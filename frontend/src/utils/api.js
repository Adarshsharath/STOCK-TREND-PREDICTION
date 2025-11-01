// Axios configuration with API base URL
import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for ML predictions
});

export default api;

