import os
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def _require_uri() -> str:
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise RuntimeError("MONGODB_URI is not set. Add it to backend/.env")
    return mongo_uri


def get_client() -> MongoClient:
    global _client
    if _client is not None:
        return _client
    _client = MongoClient(_require_uri())
    return _client


def get_db() -> Database:
    global _db
    if _db is not None:
        return _db
    db_name = os.getenv("MONGODB_DB", "finsight_ai")
    _db = get_client()[db_name]
    return _db


def get_users_db() -> Database:
    return get_client()["users_db"]


def get_chat_db() -> Database:
    return get_client()["chat_db"]
