# Deployment Guide for FinBot AI

## 🚀 Quick Deployment Options

### Option 1: Deploy Backend on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory

3. **Configure Service**
   ```
   Name: finbot-ai-backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

4. **Add Environment Variables**
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   FLASK_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://finbot-ai-backend.onrender.com`)

### Option 2: Deploy Frontend on Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your repository
   - Select the `frontend` directory

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**
   ```
   VITE_API_URL=https://finbot-ai-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

### Option 3: Deploy Frontend on Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Configure Build**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://finbot-ai-backend.onrender.com`

5. **Deploy**
   - Click "Deploy site"

## 🔧 Production Configuration

### Backend Production Setup

1. **Install Gunicorn** (Add to requirements.txt):
   ```
   gunicorn==21.2.0
   ```

2. **Create Procfile** (for Heroku/Render):
   ```
   web: gunicorn app:app
   ```

3. **Update CORS Settings** in `app.py`:
   ```python
   CORS(app, origins=[
       "https://your-frontend-domain.vercel.app",
       "http://localhost:3000"
   ])
   ```

### Frontend Production Setup

1. **Update API Base URL**
   
   Create `frontend/src/config.js`:
   ```javascript
   export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
   ```

2. **Update Axios Calls**
   
   In components, import and use:
   ```javascript
   import { API_BASE_URL } from '../config'
   
   axios.get(`${API_BASE_URL}/api/strategy`, ...)
   ```

## 🐳 Docker Deployment (Optional)

### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
      - FLASK_ENV=production
    
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

## 📊 Performance Optimization

### Backend Optimization

1. **Enable Caching**
   - Already configured with Flask-Caching
   - Adjust cache timeout in `app.py`

2. **Use Production WSGI Server**
   - Gunicorn (recommended)
   - uWSGI (alternative)

3. **Optimize Model Loading**
   - Cache trained models
   - Use model checkpoints

### Frontend Optimization

1. **Code Splitting**
   - Already handled by Vite
   - Lazy load routes if needed

2. **Asset Optimization**
   - Vite automatically minifies
   - Use CDN for static assets

3. **Caching Strategy**
   - Configure service worker
   - Set appropriate cache headers

## 🔒 Security Checklist

- [ ] Environment variables properly set
- [ ] CORS configured for production domains
- [ ] API rate limiting enabled
- [ ] HTTPS enforced
- [ ] Sensitive data not in repository
- [ ] Dependencies updated
- [ ] Error messages don't expose internals

## 📈 Monitoring

### Recommended Tools

1. **Backend Monitoring**
   - Sentry (Error tracking)
   - New Relic (Performance)
   - Datadog (Infrastructure)

2. **Frontend Monitoring**
   - Vercel Analytics
   - Google Analytics
   - LogRocket (Session replay)

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in Flask
   - Verify frontend API URL

2. **API Connection Failed**
   - Verify backend is running
   - Check environment variables
   - Test endpoints with Postman

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node/Python versions
   - Review build logs

4. **Slow Predictions**
   - Reduce data period
   - Enable caching
   - Optimize model parameters

## 📞 Support

For deployment issues:
1. Check logs in your hosting platform
2. Review this guide
3. Open an issue on GitHub

---

Happy Deploying! 🚀
