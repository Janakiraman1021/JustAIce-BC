from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from config import MONGO_URI, DATABASE_NAME

def get_mongo_client():
    return MongoClient(MONGO_URI)

def fetch_complaints():
    client = get_mongo_client()
    db = client[DATABASE_NAME]
    complaints = list(db.complaints.find())
    client.close()
    return complaints

def update_complaint_status(complaint_id, new_status, ai_log=None):
    client = get_mongo_client()
    db = client[DATABASE_NAME]
    update_data = {
        "status": new_status,
        "last_updated": datetime.utcnow()
    }
    if ai_log:
        update_data["LLM_notes"] = ai_log
        db.complaints.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$push": {"status_history": {"status": new_status, "updated_at": datetime.utcnow(), "note": ai_log}}}
        )
    db.complaints.update_one({"_id": ObjectId(complaint_id)}, {"$set": update_data})
    client.close()
