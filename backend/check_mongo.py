from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def run_diagnostic():
    uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    db_name = os.getenv('MONGODB_DB', 'finsight_ai')
    
    client = MongoClient(uri)
    db = client[db_name]
    
    target_collections = ['users', 'favorites', 'conversations', 'portfolios', 'transactions']
    
    with open('mongo_diag.txt', 'w') as f:
        f.write(f"Connecting to: {uri}\n")
        f.write(f"Database: {db_name}\n\n")
        
        existing = db.list_collection_names()
        f.write(f"Existing collections: {existing}\n\n")
        
        for coll_name in target_collections:
            f.write(f"Checking {coll_name}...\n")
            coll = db[coll_name]
            
            # Force document insert and delete to ensure creation
            try:
                coll.insert_one({'_init_flag': True})
                coll.delete_one({'_init_flag': True})
                f.write(f"  Successfully performed force-creation for {coll_name}\n")
            except Exception as e:
                f.write(f"  Error forcing {coll_name}: {str(e)}\n")
            
            count = coll.count_documents({})
            indexes = list(coll.list_indexes())
            f.write(f"  Count: {count}\n")
            f.write(f"  Indexes: {len(indexes)}\n\n")
            
        final_existing = db.list_collection_names()
        f.write(f"Final collections: {final_existing}\n")

if __name__ == "__main__":
    run_diagnostic()
