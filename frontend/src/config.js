// API Configuration
// In production, set VITE_API_URL environment variable to your backend URL
// Example: VITE_API_URL=https://stock-trend-prediction-3.onrender.com

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
export const API_URL = API_BASE_URL.replace(/\/$/, '');

