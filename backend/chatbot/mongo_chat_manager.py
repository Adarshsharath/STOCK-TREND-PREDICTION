#!/usr/bin/env python3
"""
MongoDB Chat Manager for FinSight AI
Manages conversation persistence with per-user isolation
"""

from datetime import datetime
from typing import List, Dict, Optional
from bson import ObjectId
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Import MongoDB connection from database module
from database import get_db

class MongoChatManager:
    """Manages chat conversations in MongoDB"""
    
    def __init__(self):
        """Initialize chat manager"""
        self.db = get_db()
        self.conversations = self.db.conversations
    
    def create_conversation(self, user_id: str, title: str = "New Conversation") -> str:
        """
        Create a new conversation for a user
        
        Args:
            user_id: User ID (from JWT)
            title: Conversation title
            
        Returns:
            Conversation ID
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            conversation = {
                "userId": user_id,
                "sessionId": str(ObjectId()),  # Unique session ID
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "title": title,
                "messages": []
            }
            
            result = self.conversations.insert_one(conversation)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error creating conversation: {e}")
            return None
    
    def save_message(self, conversation_id: str, user_id: str, role: str, content: str) -> bool:
        """
        Save a message to a conversation
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for ownership verification)
            role: Message role ('user' or 'assistant')
            content: Message content
            
        Returns:
            Success boolean
        """
        try:
            # Convert string IDs to ObjectId
            if isinstance(conversation_id, str):
                conversation_id = ObjectId(conversation_id)
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            message = {
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow()
            }
            
            # Update conversation (verify ownership)
            result = self.conversations.update_one(
                {
                    "_id": conversation_id,
                    "userId": user_id
                },
                {
                    "$push": {"messages": message},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            # If conversation doesn't exist, create it
            if result.matched_count == 0:
                # Create new conversation with first message
                conversation = {
                    "userId": user_id,
                    "sessionId": str(ObjectId()),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "title": content[:50] + "..." if len(content) > 50 else content,
                    "messages": [message]
                }
                result = self.conversations.insert_one(conversation)
                return result.inserted_id is not None
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"Error saving message: {e}")
            return False
    
    def get_conversation(self, conversation_id: str, user_id: str) -> Optional[Dict]:
        """
        Get a conversation by ID (with ownership verification)
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for ownership verification)
            
        Returns:
            Conversation dict or None
        """
        try:
            # Convert string IDs to ObjectId
            if isinstance(conversation_id, str):
                conversation_id = ObjectId(conversation_id)
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            conversation = self.conversations.find_one({
                "_id": conversation_id,
                "userId": user_id
            })
            
            if not conversation:
                return None
            
            # Convert ObjectIds to strings for JSON serialization
            return {
                "id": str(conversation["_id"]),
                "userId": str(conversation["userId"]),
                "sessionId": conversation.get("sessionId", str(conversation["_id"])),
                "title": conversation.get("title", "New Conversation"),
                "created_at": conversation["created_at"].isoformat(),
                "updated_at": conversation["updated_at"].isoformat(),
                "messages": [
                    {
                        "role": msg["role"],
                        "content": msg["content"],
                        "timestamp": msg["timestamp"].isoformat()
                    }
                    for msg in conversation.get("messages", [])
                ]
            }
            
        except Exception as e:
            print(f"Error getting conversation: {e}")
            return None
    
    def list_conversations(self, user_id: str, limit: int = 50) -> List[Dict]:
        """
        List all conversations for a user
        
        Args:
            user_id: User ID
            limit: Maximum number of conversations to return
            
        Returns:
            List of conversation summaries
        """
        try:
            # Convert string ID to ObjectId
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            cursor = self.conversations.find(
                {"userId": user_id}
            ).sort("updated_at", -1).limit(limit)
            
            results = []
            for conv in cursor:
                results.append({
                    "id": str(conv["_id"]),
                    "title": conv.get("title", "New Conversation"),
                    "created_at": conv["created_at"].isoformat(),
                    "updated_at": conv["updated_at"].isoformat(),
                    "message_count": len(conv.get("messages", []))
                })
            
            return results
            
        except Exception as e:
            print(f"Error listing conversations: {e}")
            return []
    
    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """
        Delete a conversation (with ownership verification)
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for ownership verification)
            
        Returns:
            Success boolean
        """
        try:
            # Convert string IDs to ObjectId
            if isinstance(conversation_id, str):
                conversation_id = ObjectId(conversation_id)
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = self.conversations.delete_one({
                "_id": conversation_id,
                "userId": user_id
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"Error deleting conversation: {e}")
            return False
    
    def update_title(self, conversation_id: str, user_id: str, new_title: str) -> bool:
        """
        Update conversation title (with ownership verification)
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for ownership verification)
            new_title: New title
            
        Returns:
            Success boolean
        """
        try:
            # Convert string IDs to ObjectId
            if isinstance(conversation_id, str):
                conversation_id = ObjectId(conversation_id)
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = self.conversations.update_one(
                {
                    "_id": conversation_id,
                    "userId": user_id
                },
                {
                    "$set": {
                        "title": new_title,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"Error updating title: {e}")
            return False
    
    def get_conversation_history(self, conversation_id: str, user_id: str, limit: int = 20) -> List[Dict]:
        """
        Get conversation message history
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for ownership verification)
            limit: Maximum number of messages to return
            
        Returns:
            List of messages
        """
        try:
            conversation = self.get_conversation(conversation_id, user_id)
            if not conversation:
                return []
            
            messages = conversation.get("messages", [])
            return messages[-limit:] if len(messages) > limit else messages
            
        except Exception as e:
            print(f"Error getting conversation history: {e}")
            return []

# Singleton instance
_chat_manager_instance = None

def get_chat_manager() -> MongoChatManager:
    """Get or create chat manager instance"""
    global _chat_manager_instance
    if _chat_manager_instance is None:
        _chat_manager_instance = MongoChatManager()
    return _chat_manager_instance
