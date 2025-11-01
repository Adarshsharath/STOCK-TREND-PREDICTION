# Authentication System Setup Guide

## Overview
A complete login/signup authentication system has been successfully integrated into the FinSight AI stock prediction application.

## Features Implemented

### Backend (Flask + SQLite + JWT)
- ✅ SQLite database with users table
- ✅ Password hashing using bcrypt
- ✅ JWT token-based authentication (7-day expiry)
- ✅ Three authentication endpoints:
  - `POST /api/auth/signup` - Create new user account
  - `POST /api/auth/login` - Authenticate existing user
  - `GET /api/auth/verify` - Verify JWT token validity
  - `GET /api/auth/me` - Get current user info
- ✅ Input validation and error handling
- ✅ Protected routes support

### Frontend (React + Tailwind CSS)
- ✅ Modern, responsive Login page
- ✅ Modern, responsive Signup page with:
  - Real-time password strength indicator
  - Password confirmation validation
  - Username and email format validation
- ✅ AuthContext for global authentication state
- ✅ Protected routes (Dashboard requires login)
- ✅ Navbar integration with:
  - User profile display
  - Login/Logout functionality
- ✅ Automatic token verification on app load
- ✅ Redirect logic for authenticated users

## Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
pip install flask-jwt-extended==4.6.0 bcrypt==4.1.2
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### 2. Initialize Database

The database is automatically initialized when you run the app, or manually:
```bash
python database.py
```

This creates `finsight.db` in the backend directory.

### 3. Start Backend Server

```bash
python app.py
```

Server runs on http://localhost:5000

### 4. Start Frontend Server

```bash
cd frontend
npm install  # if not already done
npm run dev
```

Frontend runs on http://localhost:5173 (or your configured port)

## API Endpoints

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- Username: 3-20 characters, alphanumeric + underscore only
- Email: Valid email format
- Password: Minimum 6 characters

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### POST /api/auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "username": "johndoe",  // or email
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### GET /api/auth/verify
Verify JWT token and get user data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### GET /api/auth/me
Get current authenticated user info (same as verify).

**Headers:**
```
Authorization: Bearer <token>
```

## Frontend Usage

### Using AuthContext

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome {user.username}!</div>;
  }

  return <button onClick={() => login('user', 'pass')}>Login</button>;
}
```

### Protected Routes

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Secure, stateless authentication with 7-day expiry
3. **Input Validation**: Server-side validation for all user inputs
4. **SQL Injection Protection**: Using parameterized queries
5. **CORS Configuration**: Configured for frontend-backend communication
6. **Token Verification**: Automatic token verification on app load
7. **Protected Routes**: Dashboard and other sensitive pages require authentication

## Testing

A test script is provided to verify all authentication endpoints:

```bash
cd backend
python test_auth.py
```

**Test Results:**
- ✅ Signup: Creates new user successfully
- ✅ Login: Authenticates and returns JWT token
- ✅ Token Verification: Validates token and returns user data
- ✅ Invalid Login: Properly rejects bad credentials

## Configuration

### JWT Secret Key
In production, set a secure JWT secret key:

```python
# backend/app.py
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
```

Create a `.env` file:
```
JWT_SECRET_KEY=your-very-secure-random-key-here
```

### Token Expiry
Modify token expiration time in `backend/app.py`:

```python
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)  # Change as needed
```

## File Structure

```
backend/
├── app.py                 # Main Flask app with JWT config
├── auth.py               # Authentication routes
├── database.py           # Database setup and user operations
├── test_auth.py          # Authentication test script
├── finsight.db           # SQLite database (auto-generated)
└── requirements.txt      # Updated with auth dependencies

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── components/
│   │   ├── Navbar.jsx           # Updated with login/logout
│   │   └── ProtectedRoute.jsx   # Route protection component
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   └── Signup.jsx           # Signup page
│   └── App.jsx                  # Updated with auth routes
```

## User Flow

1. **New User:**
   - Visit `/signup`
   - Fill in username, email, password
   - Automatically logged in after signup
   - Redirected to `/dashboard`

2. **Existing User:**
   - Visit `/login` or click "Login" in navbar
   - Enter username/email and password
   - Redirected to `/dashboard` on success

3. **Protected Access:**
   - Try to access `/dashboard` without login
   - Automatically redirected to `/login`
   - After login, redirected back to dashboard

4. **Logout:**
   - Click logout button in navbar
   - Token removed from localStorage
   - Redirected to `/login`

## Troubleshooting

### Issue: "Cannot connect to Flask server"
**Solution:** Make sure backend server is running on port 5000
```bash
cd backend
python app.py
```

### Issue: "CORS error"
**Solution:** CORS is configured in `app.py`. Check that frontend URL is correct.

### Issue: "Token verification fails"
**Solution:** 
- Check JWT_SECRET_KEY consistency
- Ensure token is being sent in Authorization header
- Verify token hasn't expired

### Issue: "Database not found"
**Solution:** Run database initialization:
```bash
cd backend
python database.py
```

## Next Steps & Integration

The authentication system is now ready for integration with your financial stock analysis features:

1. **User-Specific Data:** Store user preferences, watchlists, saved strategies
2. **Portfolio Management:** Track user's stock portfolios and transactions
3. **Personalized Recommendations:** AI recommendations based on user history
4. **Social Features:** Share strategies, follow other users
5. **Premium Features:** Implement tiered access (free/premium users)

## Production Deployment Checklist

- [ ] Change JWT_SECRET_KEY to a secure random value
- [ ] Enable HTTPS for all communications
- [ ] Set up proper CORS origins (remove wildcard)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add email verification for new signups
- [ ] Implement password reset functionality
- [ ] Add refresh token mechanism
- [ ] Set up proper logging and monitoring
- [ ] Use a production-grade database (PostgreSQL/MySQL)
- [ ] Implement account lockout after failed attempts

## Support

For issues or questions about the authentication system, check:
1. Backend logs in terminal running `app.py`
2. Browser console for frontend errors
3. Database file `finsight.db` exists in backend directory
4. All dependencies installed correctly

---

**Authentication System Status:** ✅ Fully Functional & Tested
**Last Updated:** November 1, 2025
