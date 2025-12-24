from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import create_user, verify_user, get_user_by_id
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """
    Validate password strength
    At least 6 characters
    """
    return len(password) >= 6

def validate_username(username):
    """
    Validate username
    3-20 characters, alphanumeric and underscore only
    """
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return re.match(pattern, username) is not None

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User signup endpoint
    
    Request Body:
        username: String (3-20 chars, alphanumeric + underscore)
        email: String (valid email format)
        password: String (minimum 6 characters)
    
    Returns:
        JWT token and user data
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate username
        if not validate_username(username):
            return jsonify({
                'error': 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
            }), 400
        
        # Validate email
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Create user
        result = create_user(username, email, password)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        # Generate JWT token (convert ID to string)
        access_token = create_access_token(identity=str(result['user']['id']))
        
        return jsonify({
            'message': 'User created successfully',
            'token': access_token,
            'user': result['user']
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    
    Request Body:
        username: String (username or email)
        password: String
    
    Returns:
        JWT token and user data
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ['username', 'password']):
            return jsonify({'error': 'Username/email and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Verify user
        user = verify_user(username, password)
        
        if not user:
            return jsonify({'error': 'Invalid username/email or password'}), 401
        
        # Generate JWT token (convert ID to string)
        access_token = create_access_token(identity=str(user['id']))
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """
    Verify JWT token and return user data
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        User data
    """
    try:
        current_user_id = get_jwt_identity()
        user = get_user_by_id(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current user data
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        User data
    """
    try:
        current_user_id = get_jwt_identity()
        user = get_user_by_id(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
