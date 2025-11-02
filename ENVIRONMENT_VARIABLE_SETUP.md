# ✅ Environment Variable Setup for Render

## Answer: Is Adding `VITE_API_URL` Enough?

**Yes! But I've updated the code to make sure it works properly.**

---

## ✅ What You Need to Do

### 1. **Add Environment Variable in Render**

In your **Frontend Static Site** on Render:

```
Key: VITE_API_URL
Value: https://stock-trend-prediction-3.onrender.com
```

⚠️ **Important:**
- No trailing slash: `https://...render.com` ✅
- Not: `https://...render.com/` ❌
- Use YOUR actual backend URL

### 2. **Code is Already Updated**

I've already updated your code to:
- ✅ Use `VITE_API_URL` from environment variable
- ✅ Configure axios globally to use the correct backend URL
- ✅ Update AuthContext to use the config

---

## ✅ How It Works

1. **In Development** (`localhost`):
   - Uses `http://localhost:5000` (default)
   - Works with your local backend

2. **In Production** (Render):
   - Uses `VITE_API_URL` from Render environment variable
   - All axios calls automatically go to your backend URL
   - AuthContext uses the correct backend URL

---

## ✅ After Setting Environment Variable

1. **Redeploy** your frontend on Render
   - Render will automatically rebuild
   - Or click "Manual Deploy" if needed

2. **Test Your Frontend**
   - Open your frontend URL
   - Check browser console (F12) → Network tab
   - API calls should go to: `https://stock-trend-prediction-3.onrender.com/api/...`

---

## 🔍 Verify It's Working

1. Open your frontend in browser
2. Press F12 → Go to Network tab
3. Try using the app (search for a stock, etc.)
4. Check the Network requests
5. **They should go to**: `https://stock-trend-prediction-3.onrender.com/api/...`

If you see requests going to:
- ✅ `stock-trend-prediction-3.onrender.com/api/...` → **Perfect!**
- ❌ `localhost:5000/api/...` → Environment variable not set correctly
- ❌ `your-frontend-url.onrender.com/api/...` → Config not working

---

## 📝 Summary

**Yes, adding `VITE_API_URL` environment variable in Render is enough!**

The code I've updated will:
1. Read `VITE_API_URL` from Render
2. Set it as axios default baseURL
3. Use it in AuthContext
4. Make all API calls go to your backend

**Just make sure:**
- ✅ Variable name is exactly: `VITE_API_URL` (must start with `VITE_`)
- ✅ Value is your backend URL (no trailing slash)
- ✅ Rebuild/redeploy after adding the variable

---

That's it! 🎉

