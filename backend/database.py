from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError
import os
import bcrypt
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
MONGODB_DB = os.getenv('MONGODB_DB', 'finsight_ai')

# MongoDB Client (singleton)
_client = None
_db = None

def get_db():
    """Get MongoDB database instance"""
    global _client, _db
    
    if _db is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client[MONGODB_DB]
    
    return _db

def init_db():
    """Initialize the database with required collections and indexes"""
    try:
        db = get_db()
        
        # Create users collection with unique indexes
        users = db.users
        users.create_index([("username", ASCENDING)], unique=True)
        users.create_index([("email", ASCENDING)], unique=True)
        
        # Create favorites collection with compound unique index
        favorites = db.favorites
        favorites.create_index([("user_id", ASCENDING), ("symbol", ASCENDING)], unique=True)
        favorites.create_index([("user_id", ASCENDING)])
        
        # Create conversations collection with index on user_id
        conversations = db.conversations
        conversations.create_index([("user_id", ASCENDING)])
        
        # Create portfolios collection with compound index on user_id and symbol
        portfolios = db.portfolios
        portfolios.create_index([("user_id", ASCENDING), ("symbol", ASCENDING)], unique=True)
        
        # Create transactions collection with index on user_id
        transactions = db.transactions
        transactions.create_index([("user_id", ASCENDING)])
        transactions.create_index([("timestamp", DESCENDING)])
        
        print("MongoDB database initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False

def create_user(username, email, password):
    """
    Create a new user with hashed password
    
    Args:
        username: User's username
        email: User's email
        password: Plain text password (will be hashed)
    
    Returns:
        dict: User data or error message
    """
    try:
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        db = get_db()
        users = db.users
        
        user_doc = {
            'username': username,
            'email': email,
            'password': hashed_password,
            'experience_level': 'beginner',
            'virtual_balance': 0.0, # Default to 0 for new users
            'created_at': datetime.utcnow()
        }
    
        
        result = users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        return {
            'success': True,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'experience_level': 'beginner'
            }
        }
    
    except DuplicateKeyError as e:
        # Check which field caused the duplicate
        if 'username' in str(e):
            return {'success': False, 'error': 'Username already exists'}
        elif 'email' in str(e):
            return {'success': False, 'error': 'Email already exists'}
        else:
            return {'success': False, 'error': 'User already exists'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}

def verify_user(username, password):
    """
    Verify user credentials
    
    Args:
        username: Username or email
        password: Plain text password
    
    Returns:
        dict: User data if valid, None otherwise
    """
    try:
        db = get_db()
        users = db.users
        
        # Check if username is an email
        if '@' in username:
            user = users.find_one({'email': username})
        else:
            user = users.find_one({'username': username})
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'experience_level': user.get('experience_level', 'beginner'),
                'virtual_balance': user.get('virtual_balance', 1000000.0)
            }
        
        return None
    
    except Exception as e:
        print(f"Error verifying user: {e}")
        return None

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        db = get_db()
        users = db.users
        
        # Convert string ID to ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        user = users.find_one({'_id': user_id})
        
        if user:
            return {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'experience_level': user.get('experience_level', 'beginner'),
                'virtual_balance': user.get('virtual_balance', 1000000.0)
            }
        
        return None
    
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def add_favorite(user_id, symbol, display_name=None):
    """Add a favorite symbol for a user"""
    try:
        symbol = (symbol or '').strip().upper()
        if not symbol:
            return {'success': False, 'error': 'Symbol is required'}
        db = get_db()
        favorites = db.favorites
        
        # Convert string ID to ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        favorite_doc = {
            'user_id': user_id,
            'symbol': symbol,
            'display_name': display_name,
            'created_at': datetime.utcnow()
        }
        
        # Use update_one with upsert to handle duplicates gracefully
        favorites.update_one(
            {'user_id': user_id, 'symbol': symbol},
            {'$setOnInsert': favorite_doc},
            upsert=True
        )
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def remove_favorite(user_id, symbol):
    """Remove a favorite symbol for a user"""
    try:
        symbol = (symbol or '').strip().upper()
        db = get_db()
        favorites = db.favorites
        
        # Convert string ID to ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        result = favorites.delete_one({'user_id': user_id, 'symbol': symbol})
        
        if result.deleted_count == 0:
            return {'success': False, 'error': 'Favorite not found'}
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def list_favorites(user_id):
    """List favorites for a user"""
    try:
        db = get_db()
        favorites = db.favorites
        
        # Convert string ID to ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cursor = favorites.find({'user_id': user_id}).sort('created_at', DESCENDING)
        
        results = []
        for fav in cursor:
            results.append({
                'symbol': fav['symbol'],
                'display_name': fav.get('display_name', fav['symbol']),
                'created_at': fav['created_at'].isoformat()
            })
        
        return results
    except Exception as e:
        return {'error': str(e)}

# --- Paper Trading / Virtual Money Functions ---

def get_virtual_balance(user_id):
    """Get user's virtual balance"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        user = db.users.find_one({'_id': user_id}, {'virtual_balance': 1})
        if user and 'virtual_balance' in user:
            return user['virtual_balance']
        return 1000000.0
    except Exception as e:
        print(f"Error getting virtual balance for {user_id}: {e}")
        return 1000000.0

def update_virtual_balance(user_id, amount):
    """Update user's virtual balance by adding amount (can be negative)"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Ensure we don't go below zero if it's a deduction
        if amount < 0:
            user = db.users.find_one({'_id': user_id}, {'virtual_balance': 1})
            if not user or user.get('virtual_balance', 0) < abs(amount):
                print(f"Insufficient funds for user {user_id}")
                return False

        result = db.users.update_one(
            {'_id': user_id},
            {'$inc': {'virtual_balance': amount}}
        )
        if result.modified_count == 0:
            print(f"Failed to update virtual balance for user {user_id}")
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating virtual balance for {user_id}: {e}")
        return False

def get_portfolio(user_id):
    """Get user's portfolio holdings"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        cursor = db.portfolios.find({'user_id': user_id})
        return list(cursor)
    except Exception as e:
        print(f"Error getting portfolio for {user_id}: {e}")
        return []

def update_portfolio(user_id, symbol, quantity, price):
    """Update portfolio holding after a trade"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        holding = db.portfolios.find_one({'user_id': user_id, 'symbol': symbol})
        
        if holding:
            new_quantity = holding['quantity'] + quantity
            if new_quantity <= 0:
                result = db.portfolios.delete_one({'user_id': user_id, 'symbol': symbol})
                return result.deleted_count > 0
            else:
                # Calculate new average price if buying
                if quantity > 0:
                    total_cost = (holding['quantity'] * holding['avg_price']) + (quantity * price)
                    new_avg_price = total_cost / new_quantity
                else:
                    new_avg_price = holding['avg_price']
                
                result = db.portfolios.update_one(
                    {'_id': holding['_id']},
                    {'$set': {
                        'quantity': new_quantity,
                        'avg_price': new_avg_price,
                        'updated_at': datetime.utcnow()
                    }}
                )
                return result.modified_count > 0
        elif quantity > 0:
            result = db.portfolios.insert_one({
                'user_id': user_id,
                'symbol': symbol,
                'quantity': quantity,
                'avg_price': price,
                'updated_at': datetime.utcnow()
            })
            return result.inserted_id is not None
        return False
    except Exception as e:
        print(f"Error updating portfolio for {user_id}: {e}")
        return False

def record_transaction(user_id, symbol, trade_type, quantity, price, strategy_used=None):
    """Record a virtual trade transaction"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        transaction = {
            'user_id': user_id,
            'symbol': symbol,
            'type': trade_type, # 'buy' or 'sell'
            'quantity': quantity,
            'price': float(price),
            'total_val': float(quantity * price),
            'timestamp': datetime.utcnow(),
            'strategy_used': strategy_used,
            'currency': 'INR'
        }
        result = db.transactions.insert_one(transaction)
        return result.inserted_id is not None
    except Exception as e:
        print(f"Error recording transaction for {user_id}: {e}")
        return False

def get_transaction_history(user_id, limit=50):
    """Get user's transaction history"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        cursor = db.transactions.find({'user_id': user_id}).sort('timestamp', DESCENDING).limit(limit)
        results = []
        for tx in cursor:
            tx['_id'] = str(tx['_id'])
            tx['user_id'] = str(tx['user_id'])
            tx['timestamp'] = tx['timestamp'].isoformat()
            results.append(tx)
        return results
    except Exception as e:
        print(f"Error getting transaction history for {user_id}: {e}")
        return []

def reset_virtual_balance(user_id, amount):
    """Reset user's virtual balance and clear their portfolio/transactions"""
    try:
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # 1. Clear portfolio
        db.portfolios.delete_many({'user_id': user_id})
        
        # 2. Clear transactions
        db.transactions.delete_many({'user_id': user_id})
        
        # 3. Set new balance
        result = db.users.update_one(
            {'_id': user_id},
            {'$set': {'virtual_balance': float(amount)}}
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error resetting virtual balance for {user_id}: {e}")
        return False

# Initialize database when module is imported
if __name__ == '__main__':
    init_db()
