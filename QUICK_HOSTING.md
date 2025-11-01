# ⚡ Quick Hosting Guide

## 🎯 Fastest Way to Host (3 Steps)

### 1️⃣ Push to GitHub

```bash
cd STOCK-TREND-PREDICTION
git init
git add .
git commit -m "Initial commit"
# Create a repo on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2️⃣ Deploy Backend on Render (Free)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: `finbot-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add Environment Variables:
   ```
   PERPLEXITY_API_KEY=your_key_here
   JWT_SECRET_KEY=generate_random_secret
   FLASK_ENV=production
   ```
6. Click "Create Web Service"
7. Wait ~5 minutes, then copy your backend URL: `https://finbot-backend.onrender.com`

### 3️⃣ Deploy Frontend on Render (Free)

1. In Render dashboard, click "New +" → "Static Site"
2. Connect the same GitHub repo
3. Configure:
   - **Name**: `finbot-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://finbot-backend.onrender.com
   ```
   ⚠️ Replace with your actual backend URL from step 2!
5. Click "Create Static Site"
6. Done! 🎉 Your app is live!

---

## 🔑 Generate JWT Secret Key

Run this command:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and use it as `JWT_SECRET_KEY`.

---

## ✅ Test Your Deployment

1. **Backend**: Visit `https://your-backend.onrender.com/api/health`
2. **Frontend**: Visit your frontend URL and test the app!

---

## 🆘 Need More Help?

See `HOSTING_GUIDE.md` for detailed instructions and other hosting options.

