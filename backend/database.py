import sqlite3
import os
import bcrypt
from datetime import datetime

def _resolve_db_path():
    env_path = os.getenv('SQLITE_DB_PATH')
    if env_path:
        return env_path

    base_dir = os.getenv('LOCALAPPDATA') or os.path.expanduser('~')
    db_dir = os.path.join(base_dir, 'FinSightAI')
    try:
        os.makedirs(db_dir, exist_ok=True)
        return os.path.join(db_dir, 'finsight.db')
    except Exception:
        return os.path.join(os.path.dirname(__file__), 'finsight.db')


DB_PATH = _resolve_db_path()

def get_db_connection():
    """Create and return a database connection"""
    # SQLite can throw "database is locked" under concurrent access.
    # Use a longer timeout and WAL mode to reduce lock contention.
    conn = sqlite3.connect(DB_PATH, timeout=30)
    try:
        conn.execute('PRAGMA journal_mode=WAL;')
        conn.execute('PRAGMA synchronous=NORMAL;')
        conn.execute('PRAGMA busy_timeout=30000;')
    except Exception:
        # PRAGMA failures should not prevent the app from running.
        pass
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        print("Database initialized successfully!")
    finally:
        try:
            if conn is not None:
                conn.close()
        except Exception:
            pass

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
    conn = None
    try:
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (username, email, hashed_password)
        )
        
        conn.commit()
        user_id = cursor.lastrowid
        
        return {
            'success': True,
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        }
    
    except sqlite3.IntegrityError as e:
        if 'username' in str(e):
            return {'success': False, 'error': 'Username already exists'}
        elif 'email' in str(e):
            return {'success': False, 'error': 'Email already exists'}
        else:
            return {'success': False, 'error': 'User already exists'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        try:
            if conn is not None:
                conn.close()
        except Exception:
            pass

def verify_user(username, password):
    """
    Verify user credentials
    
    Args:
        username: Username or email
        password: Plain text password
    
    Returns:
        dict: User data if valid, None otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if username is an email
        if '@' in username:
            cursor.execute('SELECT * FROM users WHERE email = ?', (username,))
        else:
            cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        
        user = cursor.fetchone()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        
        return None
    
    except Exception as e:
        print(f"Error verifying user: {e}")
        return None
    finally:
        try:
            if conn is not None:
                conn.close()
        except Exception:
            pass

def get_user_by_id(user_id):
    """Get user by ID"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, email FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if user:
            return {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        
        return None
    
    except Exception as e:
        print(f"Error getting user: {e}")
        return None
    finally:
        try:
            if conn is not None:
                conn.close()
        except Exception:
            pass

# Initialize database when module is imported
if __name__ == '__main__':
    init_db()
