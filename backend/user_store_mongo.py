from datetime import datetime
from typing import Optional, Dict

import bcrypt
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from db.mongo import get_db


def _users_col():
    col = get_db()["users"]
    # Ensure unique indexes exist (safe to call repeatedly)
    try:
        col.create_index("username", unique=True)
        col.create_index("email", unique=True)
    except Exception:
        pass
    return col


def create_user(username: str, email: str, password: str) -> Dict:
    try:
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        doc = {
            "username": username,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.utcnow(),
        }
        res = _users_col().insert_one(doc)
        return {
            "success": True,
            "user": {
                "id": str(res.inserted_id),
                "username": username,
                "email": email,
            },
        }
    except DuplicateKeyError as e:
        msg = str(e).lower()
        if "username" in msg:
            return {"success": False, "error": "Username already exists"}
        if "email" in msg:
            return {"success": False, "error": "Email already exists"}
        return {"success": False, "error": "User already exists"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def verify_user(username_or_email: str, password: str) -> Optional[Dict]:
    try:
        query = {"email": username_or_email.lower()} if "@" in username_or_email else {"username": username_or_email}
        user = _users_col().find_one(query)
        if not user:
            return None

        stored_hash = user.get("password")
        if stored_hash and bcrypt.checkpw(password.encode("utf-8"), stored_hash):
            return {
                "id": str(user["_id"]),
                "username": user.get("username"),
                "email": user.get("email"),
            }
        return None
    except Exception:
        return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    try:
        user = _users_col().find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if not user:
            return None
        return {
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
        }
    except Exception:
        return None
