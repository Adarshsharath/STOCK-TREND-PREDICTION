import sqlite3
import os
import bcrypt
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'finsight.db')

def get_db_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            experience_level TEXT DEFAULT 'beginner',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add experience_level column if it doesn't exist (for existing databases)
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN experience_level TEXT DEFAULT "beginner"')
    except sqlite3.OperationalError:
        # Column already exists
        pass
    
    # Create favorites table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            display_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, symbol),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

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
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (username, email, hashed_password)
        )
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return {
            'success': True,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'experience_level': 'beginner'
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
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if username is an email
        if '@' in username:
            cursor.execute('SELECT * FROM users WHERE email = ?', (username,))
        else:
            cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'experience_level': user.get('experience_level', 'beginner')
            }
        
        return None
    
    except Exception as e:
        print(f"Error verifying user: {e}")
        return None

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, email, experience_level FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'experience_level': user.get('experience_level', 'beginner')
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
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT OR IGNORE INTO favorites (user_id, symbol, display_name) VALUES (?, ?, ?)',
            (user_id, symbol, display_name)
        )
        conn.commit()
        conn.close()
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def remove_favorite(user_id, symbol):
    """Remove a favorite symbol for a user"""
    try:
        symbol = (symbol or '').strip().upper()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'DELETE FROM favorites WHERE user_id = ? AND symbol = ?',
            (user_id, symbol)
        )
        conn.commit()
        changes = cursor.rowcount
        conn.close()
        if changes == 0:
            return {'success': False, 'error': 'Favorite not found'}
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def list_favorites(user_id):
    """List favorites for a user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT symbol, COALESCE(display_name, symbol) as display_name, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                'symbol': row['symbol'],
                'display_name': row['display_name'],
                'created_at': row['created_at']
            } for row in rows
        ]
    except Exception as e:
        return {'error': str(e)}

# Initialize database when module is imported
if __name__ == '__main__':
    init_db()
