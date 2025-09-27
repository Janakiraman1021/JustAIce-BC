import json
import requests
import os
from typing import Optional

# Try to import GroqChat; if unavailable we'll fallback to a simple analyzer
try:
    from langchain.chat_models import GroqChat
    from langchain.schema import HumanMessage
    from config import GROQ_API_KEY
    groq_available = True
    chat = GroqChat(api_key=GROQ_API_KEY)
except Exception as e:
    print("GroqChat not available, falling back to simple analyzer:", e)
    groq_available = False


ADMIN_COMPLAINTS_API = os.environ.get("ADMIN_COMPLAINTS_API", "http://localhost:5000/api/complaints/admin-view-comp")


def fetch_complaint_from_api(identifier: Optional[str] = None):
    """Fetch complaints from the admin-view API.

    If `identifier` is provided, return the single complaint matching the Mongo `_id` or
    the `complaintId` field. If `identifier` is None, return the full list of complaints
    (or None on error).
    """
    try:
        resp = requests.get(ADMIN_COMPLAINTS_API, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        # Support responses shaped like { "complaints": [...] } or a bare list
        complaints = data.get("complaints") if isinstance(data, dict) and data.get("complaints") is not None else data
        if not isinstance(complaints, list):
            return None

        # If no identifier requested, return the entire list
        if identifier is None:
            return complaints

        # Otherwise find and return the matching complaint
        for c in complaints:
            if str(c.get("_id")) == str(identifier) or str(c.get("complaintId")) == str(identifier):
                return c
        return None
    except Exception as e:
        print(f"Failed to fetch complaints from admin API: {e}")
        return None


def _simple_analyze(complaint: dict) -> dict:
    # Heuristic analyzer used when GroqChat is not available
    text = (complaint.get("title", "") + " " + complaint.get("description", "")).lower()
    priority = "Low"
    if any(k in text for k in ["urgent", "danger", "accident", "emergency"]):
        priority = "High"
    elif any(k in text for k in ["broken", "vandal", "theft", "stolen", "identity"]):
        priority = "Medium"

    current = complaint.get("status", "Pending")
    if current == "Pending":
        next_status = "In Progress" if priority != "Low" else "Pending"
    else:
        next_status = current

    recommendation = "Investigate and update status." if priority != "Low" else "Acknowledge and monitor."
    return {"next_status": next_status, "priority": priority, "recommendation": recommendation}


def analyze_complaint(complaint_or_id):
    """Analyze a complaint.

    Parameter can be either:
      - a dict representing the complaint (contains 'title'/'description'), or
      - a string identifier (_id or complaintId) in which case the function will fetch
        the complaint data from the admin API defined by ADMIN_COMPLAINTS_API.

    Returns a dict with keys: next_status, priority, recommendation.
    """
    # If caller passed an identifier string, fetch the complaint from the admin API
    complaint = None
    if isinstance(complaint_or_id, str):
        complaint = fetch_complaint_from_api(complaint_or_id)
        if complaint is None:
            return {"next_status": "Pending", "priority": "Medium", "recommendation": "Complaint not found"}
    elif isinstance(complaint_or_id, dict):
        complaint = complaint_or_id
    else:
        return {"next_status": "Pending", "priority": "Medium", "recommendation": "Invalid input"}

    prompt = f"""
    Complaint Title: {complaint.get('title', '')}
    Description: {complaint.get('description', '')}
    Current Status: {complaint.get('status', 'Pending')}

    Task:
    1. Suggest the next status (Pending/In Progress/Resolved/Closed).
    2. Assign a priority (High/Medium/Low).
    3. Provide a short action recommendation.

    Return JSON like:
    {{
        "next_status": "...",
        "priority": "...",
        "recommendation": "..."
    }}
    """

    if groq_available:
        try:
            response = chat([HumanMessage(content=prompt)])
            # langchain response content may differ; attempt to parse safely
            text = getattr(response, "content", None) or getattr(response, "text", None) or str(response)
            return json.loads(text)
        except Exception as e:
            print("GroqChat call/parse failed, falling back to simple analyzer:", e)
            return _simple_analyze(complaint)
    else:
        return _simple_analyze(complaint)
