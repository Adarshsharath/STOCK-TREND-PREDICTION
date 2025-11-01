# 🎯 Quick Answer: Host Frontend on Render

## ⚠️ IMPORTANT: Choose the Right Service Type!

When Render asks for **language**, you should:

### ❌ DON'T Choose:
- Web Service (this is for backend/server apps)

### ✅ DO Choose:
- **Static Site** (this is for React/Vite frontend)

---

## 📋 Exact Steps

### 1. **Click "New +" in Render Dashboard**

### 2. **Select "Static Site"** 
   - Look for "Static Site" option
   - This is different from "Web Service"
   - Static Site = Frontend (React, Vite, HTML/JS)
   - Web Service = Backend (Python, Node.js server)

### 3. **Connect Your GitHub Repository**
   - Authorize Render if needed
   - Select your repository

### 4. **Fill These Settings:**

```
Name: finbot-frontend
(or any name)

Branch: main
(use your default branch)

Root Directory: frontend
(THIS IS IMPORTANT - tells Render where frontend code is)

Build Command: npm install && npm run build

Publish Directory: dist
(where Vite outputs built files)
```

### 5. **Add Environment Variable**

Click **"Add Environment Variable"** button:

```
Key: VITE_API_URL
Value: https://stock-trend-prediction-3.onrender.com
```

⚠️ **Use YOUR actual backend URL!**

### 6. **Click "Create Static Site"**

Wait 3-5 minutes for deployment!

---

## ✅ After Deployment

Your frontend will be available at:
`https://your-name.onrender.com`

---

## 🔍 If You Don't See "Static Site" Option

1. Make sure you're logged into Render
2. Look for these options:
   - **Static Site** ← Choose this!
   - Web Service (don't choose)
   - Background Worker (don't choose)

---

## 📝 Summary

- **Service Type**: Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://stock-trend-prediction-3.onrender.com`

---

Need more help? See `RENDER_FRONTEND_SETUP.md` for detailed troubleshooting!

