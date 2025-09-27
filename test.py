from pymongo import MongoClient
import json
from bson import ObjectId
from datetime import datetime

# MongoDB connection URI
MONGO_URI = "mongodb+srv://blocksenetail:blocksenetail@blocksenetail.e9wprn6.mongodb.net/?retryWrites=true&w=majority&appName=blocksenetail"

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, datetime):
                doc[key] = value.isoformat()
            elif isinstance(value, dict):
                doc[key] = serialize_doc(value)
            elif isinstance(value, list):
                doc[key] = [serialize_doc(item) if isinstance(item, dict) else str(item) if isinstance(item, ObjectId) else item for item in value]
    return doc

def fetch_all_complaints():
    """
    Fetch all complaints from the MongoDB complaints collection
    """
    client = None
    try:
        # Create MongoDB client
        client = MongoClient(MONGO_URI)
        
        # List all databases to see what's available
        print("Available databases:")
        for db_name in client.list_database_names():
            print(f"  - {db_name}")
        
        # Try multiple possible database names
        possible_db_names = ['test', 'blocksenetail', 'complaints_db', 'your_app_name']
        
        complaints = []
        found_db = None
        
        for db_name in possible_db_names:
            try:
                db = client[db_name]
                collections = db.list_collection_names()
                print(f"\nDatabase '{db_name}' collections: {collections}")
                
                if 'complaints' in collections:
                    complaints_collection = db['complaints']
                    complaints = list(complaints_collection.find())
                    found_db = db_name
                    print(f"Found {len(complaints)} complaints in database '{db_name}'")
                    break
            except Exception as e:
                print(f"Error checking database '{db_name}': {e}")
        
        if not complaints:
            print("No complaints collection found in any database")
            return []
        
        # Serialize all documents
        serialized_complaints = []
        for complaint in complaints:
            try:
                serialized_complaint = serialize_doc(complaint.copy())
                serialized_complaints.append(serialized_complaint)
            except Exception as e:
                print(f"Error serializing complaint: {e}")
        
        print(f"\nSuccessfully found {len(serialized_complaints)} complaints in database '{found_db}'")
        
        # Print first complaint as sample
        if serialized_complaints:
            print(f"\nSample complaint:")
            print(json.dumps(serialized_complaints[0], indent=2))
            
            # Print all complaint IDs and titles
            print(f"\nAll complaints:")
            for i, complaint in enumerate(serialized_complaints, 1):
                title = complaint.get('title', 'No title')
                complaint_id = complaint.get('_id', 'No ID')
                status = complaint.get('status', 'No status')
                print(f"{i}. ID: {complaint_id} | Title: {title} | Status: {status}")
        
        return serialized_complaints, found_db
        
    except Exception as e:
        print(f"Error fetching complaints: {e}")
        import traceback
        traceback.print_exc()
        return [], None
    
    finally:
        # Close the connection
        if client:
            client.close()

def check_database_structure():
    """Check the database structure and collections"""
    client = None
    try:
        client = MongoClient(MONGO_URI)
        
        print("=== DATABASE STRUCTURE ===")
        for db_name in client.list_database_names():
            if db_name not in ['admin', 'local', 'config']:  # Skip system databases
                print(f"\nDatabase: {db_name}")
                db = client[db_name]
                collections = db.list_collection_names()
                
                for collection_name in collections:
                    collection = db[collection_name]
                    count = collection.count_documents({})
                    print(f"  Collection: {collection_name} ({count} documents)")
                    
                    # Show sample document structure
                    if count > 0:
                        sample = collection.find_one()
                        if sample:
                            print(f"    Sample fields: {list(sample.keys())}")
    
    except Exception as e:
        print(f"Error checking database structure: {e}")
    finally:
        if client:
            client.close()

# Main execution
if __name__ == "__main__":
    print("=== MONGODB COMPLAINTS FETCHER ===\n")
    
    # First, check database structure
    check_database_structure()
    
    print("\n" + "="*50)
    print("Fetching complaints...")
    
    # Fetch all complaints
    all_complaints, database_name = fetch_all_complaints()
    
    print(f"\n=== SUMMARY ===")
    print(f"Database used: {database_name}")
    print(f"Total complaints fetched: {len(all_complaints)}")
    
    if all_complaints:
        print(f"\n✅ SUCCESS: Found {len(all_complaints)} complaints!")
        print(f"Database name to use in Node.js: '{database_name}'")
    else:
        print("❌ No complaints found or error occurred")