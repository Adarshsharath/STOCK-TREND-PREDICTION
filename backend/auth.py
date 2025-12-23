from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import bcrypt

from db.mongo import get_users_db

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not username or not email or not password:
        return jsonify({'error': 'username, email, and password are required'}), 400

    users_col = get_users_db()["users"]
    try:
        users_col.create_index("username", unique=True)
        users_col.create_index("email", unique=True)
    except Exception:
        pass

    existing = users_col.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing:
        return jsonify({'error': 'User already exists'}), 409

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    doc = {
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow(),
        "last_login": None,
    }
    result = users_col.insert_one(doc)

    token = create_access_token(identity=str(result.inserted_id))
    return jsonify({
        'token': token,
        'user': {
            'id': str(result.inserted_id),
            'username': username,
            'email': email,
        }
    }), 201

@auth_bp.route('/signup', methods=['POST'])
def signup():
    # Alias to /register for frontend compatibility
    return register()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username_or_email = (data.get('username') or data.get('email') or '').strip()
    password = data.get('password') or ''

    if not username_or_email or not password:
        return jsonify({'error': 'username/email and password are required'}), 400

    users_col = get_users_db()["users"]
    query = {"email": username_or_email.lower()} if "@" in username_or_email else {"username": username_or_email}
    user = users_col.find_one(query)

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    stored_hash = user.get('password_hash')
    if not stored_hash or not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    users_col.update_one({'_id': user['_id']}, {'$set': {'last_login': datetime.utcnow()}})

    token = create_access_token(identity=str(user['_id']))
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'username': user.get('username'),
            'email': user.get('email'),
        }
    })


@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify():
    users_col = get_users_db()["users"]
    user_id = get_jwt_identity()
    user = users_col.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'user': {
            'id': str(user['_id']),
            'username': user.get('username'),
            'email': user.get('email'),
        }
    })