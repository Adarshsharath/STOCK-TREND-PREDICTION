# 📍 Where the Code is Located

## 🔍 The Code I Showed Was an **EXAMPLE**

Those lines were **not actual code** - they were examples to show how it works.

Here's where the **actual code** is:

---

## 📁 File 1: `frontend/src/config.js`

**Lines 5-8:**

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
export const API_URL = API_BASE_URL.replace(/\/$/, '');
```

**What this does:**
- Reads `VITE_API_URL` from environment variable
- Sets `API_URL` to your backend URL (or defaults to localhost)

---

## 📁 File 2: `frontend/src/main.jsx`

**Lines 5-10:**

```javascript
import axios from 'axios'
import { API_URL } from './config'

// Configure axios default baseURL for all API calls
// This ensures all axios calls go to the correct backend URL
axios.defaults.baseURL = API_URL
```

**What this does:**
- Sets axios default baseURL to your `API_URL`
- This means ALL `axios.get()` calls automatically use your backend URL

---

## 📁 File 3: `frontend/src/pages/StrategyDetail.jsx`

**Line 140:**

```javascript
const response = await axios.get('/api/strategy', { params })
```

**What this does:**
- Makes a request to `/api/strategy`
- Because of `axios.defaults.baseURL = API_URL` in main.jsx, this becomes:
  - `https://stock-trend-prediction-2.onrender.com/api/strategy`

---

## 📁 Other Files Using axios.get():

- `frontend/src/pages/StrategyDetail.jsx` (line 140)
- `frontend/src/pages/LiveSimulation.jsx` (line 64)
- `frontend/src/pages/Finance.jsx` (line 193)
- `frontend/src/pages/Predictions.jsx` (uses `api.get()` from utils/api.js)
- And many more...

---

## 🔄 How It All Works Together:

```
1. config.js defines API_URL
   ↓
2. main.jsx sets axios.defaults.baseURL = API_URL
   ↓
3. Components call axios.get('/api/strategy')
   ↓
4. Axios automatically adds the baseURL:
   → https://stock-trend-prediction-2.onrender.com/api/strategy ✅
```

---

## 📂 Summary:

| File | Line | What It Does |
|------|------|--------------|
| `frontend/src/config.js` | 5-8 | Defines `API_URL` from environment |
| `frontend/src/main.jsx` | 10 | Sets `axios.defaults.baseURL = API_URL` |
| `frontend/src/pages/StrategyDetail.jsx` | 140 | Uses `axios.get('/api/strategy')` |
| Multiple other files | various | Use `axios.get('/api/...')` |

---

## ✅ You Don't Need to Change Any Code!

The code is already set up correctly. Just:
1. Set `VITE_API_URL` in Render environment variables
2. That's it! The code will automatically use it.

---

That's where the code is! 🎯

