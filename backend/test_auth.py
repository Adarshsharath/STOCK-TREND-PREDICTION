"""
Test script for authentication endpoints
Run this after starting the Flask server
"""
import requests
import json

BASE_URL = "http://localhost:5000/api/auth"

def test_signup():
    """Test user signup"""
    print("\n=== Testing Signup ===")
    
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "test123456"
    }
    
    response = requests.post(f"{BASE_URL}/signup", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        return response.json()['token']
    return None

def test_login():
    """Test user login"""
    print("\n=== Testing Login ===")
    
    data = {
        "username": "testuser",
        "password": "test123456"
    }
    
    response = requests.post(f"{BASE_URL}/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json()['token']
    return None

def test_verify_token(token):
    """Test token verification"""
    print("\n=== Testing Token Verification ===")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{BASE_URL}/verify", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_invalid_login():
    """Test login with invalid credentials"""
    print("\n=== Testing Invalid Login ===")
    
    data = {
        "username": "wronguser",
        "password": "wrongpassword"
    }
    
    response = requests.post(f"{BASE_URL}/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("Starting authentication tests...")
    print("Make sure the Flask server is running on http://localhost:5000")
    
    try:
        # Test signup
        token = test_signup()
        
        if not token:
            # If signup fails (user exists), try login
            token = test_login()
        
        # Test token verification
        if token:
            test_verify_token(token)
        
        # Test invalid login
        test_invalid_login()
        
        print("\n=== All tests completed ===")
        
    except requests.exceptions.ConnectionError:
        print("\nError: Cannot connect to Flask server. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"\nError: {e}")
