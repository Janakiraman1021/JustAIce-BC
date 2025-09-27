from flask import Flask, jsonify, request
from mongo_utils import fetch_complaints, update_complaint_status
from ai_utils import fetch_complaint_from_api, analyze_complaint
import os

app = Flask(__name__)

@app.route("/complaints", methods=["GET"])
def get_complaints():
    complaints = fetch_complaint_from_api()
    if not complaints:
        return jsonify([])

    def _normalise_person(obj):
        # Safely return a minimal person dict or empty dict
        if not obj or not isinstance(obj, dict):
            return {}
        return {
            "_id": str(obj.get("_id") or obj.get("id") or ""),
            "name": obj.get("name"),
            "email": obj.get("email"),
            "role": obj.get("role")
        }

    result = []
    for c in complaints:
        if not isinstance(c, dict):
            # skip unexpected entries
            continue

        result.append({
            "_id": str(c.get("_id") or c.get("id") or ""),
            "title": c.get("title"),
            "description": c.get("description"),
            "type": c.get("type"),
            "location": c.get("location"),
            "date": c.get("date"),
            "tags": c.get("tags") or [],
            "ipfsHash": c.get("ipfsHash") or c.get("ipfs") or "",
            "createdBy": _normalise_person(c.get("createdBy")),
            "status": c.get("status"),
            "complaintId": c.get("complaintId"),
            "createdAt": c.get("createdAt"),
            "updatedAt": c.get("updatedAt"),
            "__v": c.get("__v"),
            "assignedTo": _normalise_person(c.get("assignedTo"))
        })
    return jsonify(result)

@app.route("/complaints/analyze", methods=["POST"])
def analyze_and_update():
    complaint_id = request.json.get("complaint_id")
    complaints = fetch_complaint_from_api()
    # Normalize possible return shapes and guard against None
    if complaints is None:
        complaints = []
    elif isinstance(complaints, dict):
        complaints = [complaints]

    def _matches_id(c, ident):
        if not isinstance(c, dict):
            return False
        # try several id fields
        try:
            if str(c.get("_id") or c.get("id") or "") == str(ident):
                return True
        except Exception:
            pass
        if c.get("complaintId") and str(c.get("complaintId")) == str(ident):
            return True
        return False

    complaint = next((c for c in complaints if _matches_id(c, complaint_id)), None)

    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404
    
    ai_result = analyze_complaint(complaint)
    next_status = ai_result.get("next_status", complaint.get("status"))
    
    if next_status != complaint.get("status"):
        update_complaint_status(complaint_id, next_status, ai_log=ai_result)
        # reflect the change in the returned object if the DB updated successfully
        try:
            complaint["status"] = next_status
        except Exception:
            pass
    # Return the full complaint object along with AI analysis
    return jsonify({
        "complaint_id": complaint_id,
        "current_status": complaint.get("status"),
        "predicted_status": next_status,
        "complaint": complaint,
        "AI_analysis": ai_result
    })



@app.route("/complaints/query", methods=["POST"])
def complaint_query():
    """
    Example POST body:
    {
        "complaint_id": "64f3c12345abcd",
        "question": "What is the status of my case?"
    }
    """
    # Use get_json(silent=True) to avoid Flask raising a 400 on invalid JSON
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid or malformed JSON in request body"}), 400

    complaint_id = data.get("complaint_id")
    question = data.get("question", "").strip()

    if not complaint_id or not question:
        return jsonify({"error": "complaint_id and question are required"}), 400

    # Fetch complaint data
    complaint = fetch_complaint_from_api(complaint_id)
    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    # First, try to answer using GroqChat (langchain-community). If GroqChat is not
    # available or the call fails, fall back to the local rule-based answers below.
    answer = None
    prompt = f"""
    You are a helpful assistant. Use the complaint data and the user's question to
    produce a concise (1-2 sentence) answer suitable for a user checking on their case.

    Complaint data:
    Title: {complaint.get('title')}
    Description: {complaint.get('description')}
    Current Status: {complaint.get('status', 'Pending')}
    Assigned Officer: {complaint.get('assignedTo', {}).get('name', 'Not assigned')}

    User Question: {question}

    Answer:
    """

    try:
        # Prefer the langchain-community GroqChat
        from langchain_community.chat_models import GroqChat
        from langchain.schema import HumanMessage

        api_key = os.environ.get('GROQ_API_KEY')
        # Also try a config module if present
        if not api_key:
            try:
                from config import GROQ_API_KEY as CFG_KEY
                api_key = CFG_KEY
            except Exception:
                api_key = None

        if not api_key:
            raise RuntimeError('GROQ_API_KEY not set in environment or config')

        chat = GroqChat(api_key=api_key)
        resp = chat([HumanMessage(content=prompt)])
        answer = getattr(resp, 'content', None) or getattr(resp, 'text', None) or str(resp)
        # If the model returned JSON or extra whitespace, trim it
        if isinstance(answer, str):
            answer = answer.strip()
    except Exception:
        # GroqChat not available or failed — perform the local heuristics fallback
        q = question.lower()
        assigned = complaint.get('assignedTo') if isinstance(complaint, dict) else None
        assigned_name = None
        if isinstance(assigned, dict):
            assigned_name = assigned.get('name')

        status = complaint.get('status') if isinstance(complaint, dict) else None
        if not status:
            status = 'Pending'

        # Simple intent matching (same as previous behavior)
        if any(kw in q for kw in ["status", "progress", "how is my case", "what is the status"]):
            if assigned_name:
                answer = f"Your case status is {status}. It is assigned to {assigned_name}."
            else:
                answer = f"Your case status is {status}. No officer has been assigned yet." 
        elif any(kw in q for kw in ["assigned", "officer", "who is assigned", "is officer"]):
            if assigned_name:
                role = assigned.get('role') if isinstance(assigned, dict) else ''
                email = assigned.get('email') if isinstance(assigned, dict) else ''
                contact = f" Contact: {email}" if email else ""
                answer = f"Yes — the case is assigned to {assigned_name} ({role}).{contact}"
            else:
                answer = "No officer has been assigned to your case yet."
        elif any(kw in q for kw in ["who filed", "created by", "who reported", "complainant"]):
            creator = complaint.get('createdBy') if isinstance(complaint, dict) else None
            name = creator.get('name') if isinstance(creator, dict) else None
            answer = f"The complaint was filed by {name}." if name else "The complainant details are not available." 
        elif any(kw in q for kw in ["where", "location"]):
            loc = complaint.get('location') or complaint.get('place') if isinstance(complaint, dict) else None
            answer = f"The reported location is {loc}." if loc else "Location information is not available."
        elif any(kw in q for kw in ["when", "date", "time"]):
            dt = complaint.get('date') or complaint.get('createdAt') if isinstance(complaint, dict) else None
            answer = f"The complaint was registered on {dt}." if dt else "Date information is not available."
        elif any(kw in q for kw in ["ipfs", "hash", "evidence"]):
            ipfs = complaint.get('ipfsHash') or complaint.get('ipfs') if isinstance(complaint, dict) else None
            answer = f"IPFS hash: {ipfs}" if ipfs else "No IPFS attachment found for this complaint."
        else:
            # Fallback to local analyzer for a short recommendation/answer
            ai_res = analyze_complaint(complaint)
            rec = ai_res.get('recommendation')
            priority = ai_res.get('priority')
            answer = f"Status: {status}. Recommendation: {rec} (Priority: {priority})"

    return jsonify({
        "complaint_id": complaint_id,
        "question": question,
        "answer": answer
    })
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
