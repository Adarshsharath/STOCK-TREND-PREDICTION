from datetime import datetime
from typing import List, Dict, Optional
from bson import ObjectId

# Import MongoDB connection from database module
from database import get_db

def create_new_conversation(user_id: str, title: str = "New Conversation") -> str:
    """Create a new conversation for a user and return its ID"""
    try:
        db = get_db()
        conversations = db.conversations
        
        # Convert string ID to ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        conversation = {
            'user_id': user_id,
            'title': title,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'messages': []
        }
        
        result = conversations.insert_one(conversation)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating conversation: {e}")
        return None

def save_message(conversation_id: str, user_id: str, role: str, content: str):
    """Save a message to a conversation (with ownership verification)"""
    try:
        db = get_db()
        conversations = db.conversations
        
        # Convert string IDs to ObjectId
        if isinstance(conversation_id, str):
            conversation_id = ObjectId(conversation_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find conversation and verify ownership
        conversation = conversations.find_one({
            '_id': conversation_id,
            'user_id': user_id
        })
        
        if not conversation:
            # Create new conversation if doesn't exist
            conversation = {
                'user_id': user_id,
                'title': content[:50] + '...' if len(content) > 50 else content,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'messages': []
            }
        
        # Add new message
        message = {
            'role': role,
            'content': content,
            'timestamp': datetime.utcnow()
        }
        
        # Update title with first user message if still default
        update_data = {
            '$push': {'messages': message},
            '$set': {'updated_at': datetime.utcnow()}
        }
        
        if conversation.get('title') == "New Conversation" and role == 'user':
            update_data['$set']['title'] = content[:50] + '...' if len(content) > 50 else content
        
        conversations.update_one(
            {'_id': conversation_id, 'user_id': user_id},
            update_data,
            upsert=True
        )
        
        return True
    except Exception as e:
        print(f"Error saving message: {e}")
        return False

def get_conversation(conversation_id: str, user_id: str) -> Optional[Dict]:
    """Get a conversation by ID (with ownership verification)"""
    try:
        db = get_db()
        conversations = db.conversations
        
        # Convert string IDs to ObjectId
        if isinstance(conversation_id, str):
            conversation_id = ObjectId(conversation_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        conversation = conversations.find_one({
            '_id': conversation_id,
            'user_id': user_id
        })
        
        if not conversation:
            return None
        
        # Convert ObjectIds to strings for JSON serialization
        return {
            'id': str(conversation['_id']),
            'title': conversation['title'],
            'created_at': conversation['created_at'].isoformat(),
            'updated_at': conversation['updated_at'].isoformat(),
            'messages': [
                {
                    'role': msg['role'],
                    'content': msg['content'],
                    'timestamp': msg['timestamp'].isoformat()
                }
                for msg in conversation.get('messages', [])
            ]
        }
    except Exception as e:
        print(f"Error getting conversation: {e}")
        return None

def list_conversations(user_id: str) -> List[Dict]:
    """List all conversations for a user"""
    try:
        db = get_db()
        conversations = db.conversations
        
        # Convert string ID to ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cursor = conversations.find({'user_id': user_id}).sort('updated_at', -1)
        
        results = []
        for conv in cursor:
            results.append({
                'id': str(conv['_id']),
                'title': conv['title'],
                'created_at': conv['created_at'].isoformat(),
                'updated_at': conv['updated_at'].isoformat(),
                'message_count': len(conv.get('messages', []))
            })
        
        return results
    except Exception as e:
        print(f"Error listing conversations: {e}")
        return []

def delete_conversation(conversation_id: str, user_id: str) -> bool:
    """Delete a conversation (with ownership verification)"""
    try:
        db = get_db()
        conversations = db.conversations
        
        # Convert string IDs to ObjectId
        if isinstance(conversation_id, str):
            conversation_id = ObjectId(conversation_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        result = conversations.delete_one({
            '_id': conversation_id,
            'user_id': user_id
        })
        
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting conversation: {e}")
        return False

def update_conversation_title(conversation_id: str, user_id: str, new_title: str) -> bool:
    """Update conversation title (with ownership verification)"""
    try:
        db = get_db()
        conversations = db.conversations
        
        # Convert string IDs to ObjectId
        if isinstance(conversation_id, str):
            conversation_id = ObjectId(conversation_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        result = conversations.update_one(
            {'_id': conversation_id, 'user_id': user_id},
            {
                '$set': {
                    'title': new_title,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating conversation title: {e}")
        return False
