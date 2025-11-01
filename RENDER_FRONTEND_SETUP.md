# 🚀 Deploy Frontend on Render - Step by Step Guide

## ✅ What You Need First

- ✅ Backend already hosted on Render: `https://stock-trend-prediction-3.onrender.com`
- ✅ Code pushed to GitHub

---

## 📋 Step-by-Step Instructions

### **Step 1: In Render Dashboard**

1. Click **"New +"** button (top right)
2. Select **"Static Site"** (NOT Web Service!)
   - Static Site = For React/Vite frontend
   - Web Service = For backend/server apps

### **Step 2: Connect Repository**

1. Choose **"Connect GitHub"** (if not already connected)
2. Authorize Render to access your repositories
3. Select your repository that contains the frontend code

### **Step 3: Configure Build Settings**

Fill in these settings:

```
Name: finbot-frontend
(or any name you prefer)

Branch: main
(use your default branch name)

Root Directory: frontend
(This tells Render where your frontend code is)

Build Command: npm install && npm run build
(Installs dependencies and builds the app)

Publish Directory: dist
(This is where Vite outputs the built files)
```

**Important Fields:**
- **Name**: Your service name
- **Branch**: Usually `main` or `master`
- **Root Directory**: `frontend` (the folder with `package.json`)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` (Vite's output folder)

### **Step 4: Add Environment Variable**

Click **"Add Environment Variable"** and add:

```
Key: VITE_API_URL
Value: https://stock-trend-prediction-3.onrender.com
```

⚠️ **Replace with YOUR actual backend URL!**

This tells your frontend where to find the backend API.

### **Step 5: Deploy**

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build to complete
3. Once done, your frontend will be live!

---

## 🎯 Your URLs After Deployment

- **Backend**: `https://stock-trend-prediction-3.onrender.com`
- **Frontend**: `https://your-frontend-name.onrender.com`

---

## ✅ Verify Deployment

1. **Visit your frontend URL** in browser
2. **Open browser DevTools** (F12)
3. **Go to Network tab**
4. **Try using the app** (e.g., search for a stock)
5. **Check if API requests** are going to your backend URL

---

## 🐛 Common Issues

### Build Fails

**Problem**: Build command fails
- **Check**: Node.js version (needs 18+)
- **Solution**: Render auto-detects Node version, but you can specify in `package.json`:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

### Environment Variable Not Working

**Problem**: Frontend still uses `localhost:5000`
- **Check**: Environment variable is named exactly `VITE_API_URL` (must start with `VITE_` for Vite)
- **Check**: Value has no trailing slash: `https://stock-trend-prediction-3.onrender.com` (not `https://...com/`)
- **Solution**: Rebuild after adding environment variable

### API Requests Fail (CORS Errors)

**Problem**: Frontend can't connect to backend
- **Solution**: This should already be fixed - backend CORS allows all origins (`*`)
- If issues persist, check backend logs on Render

### Blank Page

**Problem**: Page loads but shows nothing
- **Check**: Browser console for errors (F12)
- **Check**: Network tab for failed requests
- **Solution**: Verify environment variable is set correctly

---

## 📝 Render Static Site Settings Summary

```
Name: finbot-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
Environment Variable:
  VITE_API_URL = https://stock-trend-prediction-3.onrender.com
```

---

## 🎉 Done!

Once deployed:
1. Your frontend will automatically rebuild when you push to GitHub
2. Check your frontend URL in browser
3. Test the app!

**Need help?** Check the logs in Render dashboard if build fails.

