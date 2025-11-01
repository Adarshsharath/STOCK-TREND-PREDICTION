# 🚀 Hosting Guide - FinBot AI Stock Prediction

This guide will walk you through hosting your application on various platforms.

## 📋 Quick Overview

Your application consists of:
- **Backend**: Flask API (Python) on port 5000
- **Frontend**: React + Vite (Node.js) on port 3000

## 🎯 Recommended Hosting Options

### **Option 1: Render (Easiest - Recommended)**
- **Backend**: Render Web Service (Free tier available)
- **Frontend**: Render Static Site (Free tier available)
- **Pros**: Free tier, easy setup, automatic deployments from GitHub

### **Option 2: Vercel + Railway**
- **Frontend**: Vercel (Excellent for React apps)
- **Backend**: Railway or Render
- **Pros**: Vercel is optimized for Vite/React

### **Option 3: Docker + Cloud Provider**
- Deploy both services using Docker
- Works on AWS, Google Cloud, Azure, DigitalOcean, etc.

---

## 🌟 Option 1: Host on Render (Step-by-Step)

### Part A: Host Backend on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (recommended)

2. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

4. **Configure Backend Service**
   ```
   Name: finbot-backend
   Region: Choose closest to you
   Branch: main (or your default branch)
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app --bind 0.0.0.0:$PORT
   ```

5. **Add Environment Variables**
   Click "Add Environment Variable" and add:
   ```
   PERPLEXITY_API_KEY=your_perplexity_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key (optional)
   JWT_SECRET_KEY=generate_a_random_secret_key
   FLASK_ENV=production
   PORT=10000
   ```
   
   **Generate JWT Secret Key:**
   ```python
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://finbot-backend.onrender.com`

### Part B: Host Frontend on Render

1. **Create New Static Site**
   - In Render dashboard, click "New +" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Frontend Service**
   ```
   Name: finbot-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variable**
   ```
   VITE_API_URL=https://finbot-backend.onrender.com
   ```
   ⚠️ **Important**: Replace with your actual backend URL from Part A

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment
   - Your app will be live at: `https://finbot-frontend.onrender.com`

---

## ⚡ Option 2: Vercel (Frontend) + Railway (Backend)

### Host Frontend on Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**
   Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (You'll update this after deploying backend)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Host Backend on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Railway auto-detects Python
   - Set **Root Directory** to `backend`
   - Railway will detect `requirements.txt`

4. **Add Environment Variables**
   ```
   PERPLEXITY_API_KEY=your_key
   OPENWEATHER_API_KEY=your_key (optional)
   JWT_SECRET_KEY=your_secret_key
   FLASK_ENV=production
   ```

5. **Generate Domain**
   - Railway provides a default domain
   - Click "Settings" → "Generate Domain"
   - Copy the URL (e.g., `https://your-app.railway.app`)

6. **Update Frontend Environment Variable**
   - Go back to Vercel
   - Update `VITE_API_URL` with your Railway backend URL
   - Trigger a redeploy

---

## 🐳 Option 3: Docker Deployment

### Step 1: Create Dockerfile for Backend

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

### Step 2: Create Dockerfile for Frontend

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Create docker-compose.yml

Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - FLASK_ENV=production
    volumes:
      - ./backend/chatbot/chat_histories:/app/chatbot/chat_histories
      - ./backend/finsight.db:/app/finsight.db
    
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend
```

### Step 4: Build and Run

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### Deploy Docker to Cloud

**DigitalOcean App Platform:**
1. Connect GitHub repo
2. It auto-detects docker-compose.yml
3. Add environment variables
4. Deploy

**AWS ECS / Google Cloud Run:**
1. Build and push images to container registry
2. Create services using docker-compose
3. Configure load balancer
4. Deploy

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] **Backend `requirements.txt`** includes `gunicorn` ✅ (Already included)
- [ ] **Environment variables** are set (API keys, secrets)
- [ ] **CORS** allows your frontend domain (currently allows all `*`)
- [ ] **Database** path is correct (SQLite file or external DB)
- [ ] **Frontend** builds successfully (`npm run build`)
- [ ] **API URLs** are updated in frontend environment variables

---

## 📝 Post-Deployment Steps

### 1. Update CORS in Backend (Security)

After deploying, restrict CORS to your frontend domain only:

In `backend/app.py`, change line 62:
```python
# Before (allows all):
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# After (restricted):
CORS(app, resources={r"/api/*": {"origins": [
    "https://your-frontend-domain.onrender.com",
    "https://your-frontend-domain.vercel.app",
    "http://localhost:3000"  # Keep for local dev
]}}, supports_credentials=True)
```

### 2. Test Your Deployment

1. **Backend Health Check:**
   ```
   https://your-backend-url.onrender.com/api/health
   ```

2. **Frontend:**
   - Open your frontend URL
   - Test a strategy/prediction
   - Check browser console for errors

3. **Verify API Connection:**
   - Open browser DevTools → Network tab
   - Try making a request
   - Ensure requests go to correct backend URL

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Build fails on Render/Railway
- **Solution**: Check Python version (3.9+), ensure `requirements.txt` is in backend folder

**Problem**: Application crashes on start
- **Solution**: Check logs, ensure all environment variables are set
- Verify `gunicorn` is in requirements.txt ✅

**Problem**: CORS errors
- **Solution**: Update CORS origins to include your frontend domain

### Frontend Issues

**Problem**: Build fails
- **Solution**: Run `npm run build` locally first to catch errors
- Check Node.js version (18+)

**Problem**: API requests fail
- **Solution**: Verify `VITE_API_URL` environment variable is set correctly
- Check backend URL is accessible

**Problem**: Blank page after deployment
- **Solution**: Check browser console for errors
- Verify build output directory (`dist`) is configured correctly

---

## 🔒 Security Recommendations

1. **Change JWT Secret Key**: Generate a strong random key
2. **Restrict CORS**: Don't use `"origins": "*"` in production
3. **Use Environment Variables**: Never commit API keys
4. **Enable HTTPS**: Most platforms do this automatically
5. **Rate Limiting**: Consider adding rate limiting to API endpoints

---

## 📊 Monitoring Your Deployment

### Render
- View logs in dashboard
- Set up alerts for downtime

### Vercel
- Built-in analytics
- View deployment logs

### Railway
- Real-time logs
- Metrics dashboard

---

## 💰 Cost Estimates

**Free Tier Options:**
- **Render**: Free tier for both backend and frontend (with limitations)
- **Vercel**: Free tier for frontend (unlimited)
- **Railway**: $5/month after free credits expire

**Estimated Monthly Cost:**
- Render (Free tier): $0
- Vercel + Railway: ~$5/month
- DigitalOcean: ~$12/month
- AWS/GCP: Pay-as-you-go

---

## ✅ Quick Start Summary

**Fastest Path (Render - Free):**

1. Push code to GitHub
2. Deploy backend on Render (Web Service)
3. Deploy frontend on Render (Static Site)
4. Add environment variables
5. Done! 🎉

**Need help?** Check the logs in your hosting platform's dashboard for specific error messages.

---

Happy Hosting! 🚀

