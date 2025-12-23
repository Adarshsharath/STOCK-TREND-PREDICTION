from datetime import datetime
from typing import List, Dict, Optional

from bson import ObjectId

from db.mongo import get_chat_db


def _conversations_col():
    db = get_chat_db()
    col = db["conversations"]
    # Ensure useful indexes
    try:
        col.create_index("user_id")
        col.create_index("updated_at")
    except Exception:
        # Index creation failures should not break runtime
        pass
    return col


def _to_iso(dt: datetime) -> str:
    return dt.isoformat() if isinstance(dt, datetime) else str(dt)


def create_new_conversation(user_id: str, title: str = "New Conversation") -> str:
    """Create a new conversation for a user and return its ID."""
    col = _conversations_col()
    now = datetime.utcnow()
    doc = {
        "user_id": ObjectId(user_id),
        "title": title,
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    result = col.insert_one(doc)
    return str(result.inserted_id)


def save_message(conversation_id: str, role: str, content: str, user_id: str):
    """Append a message to a conversation owned by the user."""
    col = _conversations_col()
    message = {
        "role": role,
        "content": str(content),
        "timestamp": datetime.utcnow(),
    }
    # Push the message and update timestamp
    col.update_one(
        {"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)},
        {"$push": {"messages": message}, "$set": {"updated_at": datetime.utcnow()}},
    )

    # If this is the first user message and the title is default, update title
    try:
        if role == "user":
            conv = col.find_one({"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)})
            if conv:
                title = str(conv.get("title", "New Conversation") or "New Conversation")
                messages = conv.get("messages", [])
                # Title should reflect the very first user message
                if title in ("New Conversation", "Conversation", "") and len(messages) <= 1:
                    first_line = str(content).strip()
                    new_title = (first_line[:60] + "...") if len(first_line) > 60 else first_line or "New Conversation"
                    col.update_one(
                        {"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)},
                        {"$set": {"title": new_title, "updated_at": datetime.utcnow()}},
                    )
    except Exception:
        # Non-critical: failure to set title should not break message saving
        pass


def get_conversation(conversation_id: str, user_id: str) -> Optional[Dict]:
    """Fetch full conversation by ID for the given user."""
    col = _conversations_col()
    conv = col.find_one({"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)})
    if not conv:
        return None
    return {
        "id": str(conv["_id"]),
        "title": conv.get("title", "Conversation"),
        "created_at": _to_iso(conv.get("created_at")),
        "updated_at": _to_iso(conv.get("updated_at")),
        "messages": [
            {
                "role": m.get("role"),
                "content": m.get("content"),
                "timestamp": _to_iso(m.get("timestamp")),
            }
            for m in conv.get("messages", [])
        ],
    }


def list_conversations(user_id: str) -> List[Dict]:
    """List all conversations for a user (summary only)."""
    col = _conversations_col()
    cursor = col.find({"user_id": ObjectId(user_id)}).sort("updated_at", -1)
    conversations: List[Dict] = []
    for conv in cursor:
        conversations.append(
            {
                "id": str(conv["_id"]),
                "title": conv.get("title", "Conversation"),
                "created_at": _to_iso(conv.get("created_at")),
                "updated_at": _to_iso(conv.get("updated_at")),
                "message_count": len(conv.get("messages", [])),
            }
        )
    return conversations


def delete_conversation(conversation_id: str, user_id: str) -> bool:
    """Delete a conversation owned by the user."""
    col = _conversations_col()
    res = col.delete_one({"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)})
    return res.deleted_count == 1


def update_conversation_title(conversation_id: str, new_title: str, user_id: str) -> bool:
    """Update the title of a conversation for the user."""
    col = _conversations_col()
    res = col.update_one(
        {"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)},
        {"$set": {"title": str(new_title), "updated_at": datetime.utcnow()}},
    )
    return res.modified_count == 1