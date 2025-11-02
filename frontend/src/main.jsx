import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { API_URL } from './config'

// Configure axios default baseURL for all API calls
// This ensures all axios calls go to the correct backend URL
axios.defaults.baseURL = API_URL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
