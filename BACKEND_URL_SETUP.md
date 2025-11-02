# ✅ Backend URL Configuration

## 🔗 Your Backend URL

**Your actual backend URL is:**
```
https://stock-trend-prediction-2.onrender.com
```

---

## ✅ How It Works

### In Render Environment Variables (Frontend):

Set this in your **Frontend Static Site** on Render:

```
Key: VITE_API_URL
Value: https://stock-trend-prediction-2.onrender.com
```

### Result:

```javascript
// Your config.js will read:
API_URL = 'https://stock-trend-prediction-2.onrender.com'

// When your code calls:
axios.get('/api/strategy')

// It becomes:
https://stock-trend-prediction-2.onrender.com/api/strategy ✅
```

---

## ✅ Configuration is Correct

Your `config.js` is already set up correctly:

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = API_BASE_URL.replace(/\/$/, '');
```

**Just make sure:**
- ✅ In Render, set `VITE_API_URL` to: `https://stock-trend-prediction-2.onrender.com`
- ✅ No trailing slash
- ✅ No `/api` suffix
- ✅ Just the base domain

---

## 📝 Quick Checklist

- [x] Backend URL: `https://stock-trend-prediction-2.onrender.com`
- [x] `config.js` is correct
- [x] `main.jsx` sets axios.defaults.baseURL
- [ ] Set `VITE_API_URL` in Render to: `https://stock-trend-prediction-2.onrender.com`

---

## 🎯 What Happens:

```
Frontend (Render) → Reads VITE_API_URL
                → Sets API_URL = 'https://stock-trend-prediction-2.onrender.com'
                → axios.get('/api/strategy')
                → Requests go to: https://stock-trend-prediction-2.onrender.com/api/strategy ✅
```

---

That's it! Just set `VITE_API_URL` in Render to your backend URL! 🚀

