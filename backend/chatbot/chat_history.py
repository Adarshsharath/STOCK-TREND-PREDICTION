import json
import os
from datetime import datetime
from typing import List, Dict, Optional
import uuid

# File-based storage for chat history
CHAT_HISTORY_DIR = os.path.join(os.path.dirname(__file__), 'chat_histories')

def ensure_history_dir():
    """Ensure the chat history directory exists"""
    if not os.path.exists(CHAT_HISTORY_DIR):
        os.makedirs(CHAT_HISTORY_DIR)

def create_new_conversation(title: str = "New Conversation") -> str:
    """Create a new conversation and return its ID"""
    ensure_history_dir()
    
    conversation_id = str(uuid.uuid4())
    conversation = {
        'id': conversation_id,
        'title': title,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'messages': []
    }
    
    file_path = os.path.join(CHAT_HISTORY_DIR, f'{conversation_id}.json')
    with open(file_path, 'w') as f:
        json.dump(conversation, f, indent=2)
    
    return conversation_id

def save_message(conversation_id: str, role: str, content: str):
    """Save a message to a conversation"""
    ensure_history_dir()
    file_path = os.path.join(CHAT_HISTORY_DIR, f'{conversation_id}.json')
    
    if not os.path.exists(file_path):
        # Create new conversation if doesn't exist
        conversation = {
            'id': conversation_id,
            'title': content[:50] + '...' if len(content) > 50 else content,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'messages': []
        }
    else:
        with open(file_path, 'r') as f:
            conversation = json.load(f)
    
    # Add new message
    message = {
        'role': role,
        'content': content,
        'timestamp': datetime.now().isoformat()
    }
    conversation['messages'].append(message)
    conversation['updated_at'] = datetime.now().isoformat()
    
    # Update title with first user message if still default
    if conversation['title'] == "New Conversation" and role == 'user':
        conversation['title'] = content[:50] + '...' if len(content) > 50 else content
    
    with open(file_path, 'w') as f:
        json.dump(conversation, f, indent=2)

def get_conversation(conversation_id: str) -> Optional[Dict]:
    """Get a conversation by ID"""
    ensure_history_dir()
    file_path = os.path.join(CHAT_HISTORY_DIR, f'{conversation_id}.json')
    
    if not os.path.exists(file_path):
        return None
    
    with open(file_path, 'r') as f:
        return json.load(f)

def list_conversations() -> List[Dict]:
    """List all conversations"""
    ensure_history_dir()
    conversations = []
    
    for filename in os.listdir(CHAT_HISTORY_DIR):
        if filename.endswith('.json'):
            file_path = os.path.join(CHAT_HISTORY_DIR, filename)
            with open(file_path, 'r') as f:
                conv = json.load(f)
                # Return summary without full messages
                conversations.append({
                    'id': conv['id'],
                    'title': conv['title'],
                    'created_at': conv['created_at'],
                    'updated_at': conv['updated_at'],
                    'message_count': len(conv['messages'])
                })
    
    # Sort by updated_at descending
    conversations.sort(key=lambda x: x['updated_at'], reverse=True)
    return conversations

def delete_conversation(conversation_id: str) -> bool:
    """Delete a conversation"""
    ensure_history_dir()
    file_path = os.path.join(CHAT_HISTORY_DIR, f'{conversation_id}.json')
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False

def update_conversation_title(conversation_id: str, new_title: str) -> bool:
    """Update conversation title"""
    ensure_history_dir()
    file_path = os.path.join(CHAT_HISTORY_DIR, f'{conversation_id}.json')
    
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r') as f:
        conversation = json.load(f)
    
    conversation['title'] = new_title
    conversation['updated_at'] = datetime.now().isoformat()
    
    with open(file_path, 'w') as f:
        json.dump(conversation, f, indent=2)
    
    return True
