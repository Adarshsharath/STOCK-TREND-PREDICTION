import axios from "axios";
import { API_URL } from "../config";

// Create Axios instance for backend API
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Attach Authorization header with JWT token (if available)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
