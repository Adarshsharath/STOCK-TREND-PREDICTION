# 🔧 FinBot AI - Troubleshooting Guide

## ✅ Quick Fix - Start Fresh

### Step 1: Stop All Running Processes
Close all terminal windows running Flask or Vite.

### Step 2: Start Backend
```bash
cd backend
python app.py
```

Wait until you see:
```
* Running on http://127.0.0.1:5000
* Debugger is active!
```

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

Wait until you see:
```
➜  Local:   http://localhost:3000/
```

### Step 4: Open Browser
Navigate to: **http://localhost:3000**

---

## 🐛 Common Issues & Solutions

### Issue 1: "ModuleNotFoundError: No module named 'flask_caching'"

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

---

### Issue 2: "ModuleNotFoundError: No module named 'chatbot.perplexity_bot'"

**Solution:** The `__init__.py` files were missing. They have been created. Just restart:
```bash
cd backend
python app.py
```

---

### Issue 3: "proxy error: /api/predict" or "ECONNRESET"

**Causes:**
- Backend not running
- Backend crashed
- Port mismatch

**Solution:**

1. **Check if backend is running:**
   - Look for terminal with Flask output
   - Should show: `Running on http://127.0.0.1:5000`

2. **Test backend directly:**
   Open browser: `http://localhost:5000/api/health`
   Should return: `{"status":"healthy",...}`

3. **Restart both servers:**
   - Close all terminals
   - Start backend first
   - Wait 5 seconds
   - Start frontend

---

### Issue 4: Port Already in Use

**Backend (Port 5000):**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Frontend (Port 3000):**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

---

### Issue 5: TensorFlow Warnings

The warnings like:
```
oneDNN custom operations are on...
```

**These are NORMAL and can be ignored.** They don't affect functionality.

To hide them:
```bash
set TF_ENABLE_ONEDNN_OPTS=0
python app.py
```

---

### Issue 6: Frontend Shows Blank Page

**Solution:**

1. **Check browser console** (F12):
   - Look for errors
   - Check Network tab for failed requests

2. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cache
   - Reload page

3. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

### Issue 7: Charts Not Displaying

**Solution:**

1. **Check if data is loading:**
   - Open browser console (F12)
   - Look for API responses

2. **Verify backend response:**
   ```bash
   # Test strategy endpoint
   http://localhost:5000/api/strategy?name=ema_crossover&symbol=AAPL&period=1y
   ```

3. **Reinstall Plotly:**
   ```bash
   cd frontend
   npm install plotly.js react-plotly.js
   ```

---

### Issue 8: Chatbot Not Working

**Cause:** Missing Perplexity API key

**Solution:**

1. **Create .env file:**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Add API key:**
   Edit `.env` file:
   ```
   PERPLEXITY_API_KEY=your_actual_key_here
   ```

3. **Restart backend:**
   ```bash
   python app.py
   ```

**Note:** App works without API key, but chatbot won't respond.

---

### Issue 9: "No data found for symbol"

**Causes:**
- Invalid stock symbol
- Internet connection issue
- Yahoo Finance API down

**Solution:**

1. **Try different symbols:**
   - US: `AAPL`, `TSLA`, `GOOGL`, `MSFT`
   - India: `INFY.NS`, `TCS.NS`, `RELIANCE.NS`

2. **Check internet connection**

3. **Try shorter period:**
   - Use `1mo` or `3mo` instead of `5y`

---

### Issue 10: Slow ML Predictions

**Cause:** ML models training on-demand

**Solution:**

1. **Use smaller periods:**
   - Use `1y` instead of `5y`

2. **Try faster models first:**
   - ARIMA (fastest)
   - Prophet (medium)
   - LSTM (slowest but most accurate)

3. **Be patient:**
   - First prediction: 30-60 seconds
   - Cached predictions: instant

---

## 🚀 Best Practices

### Starting the App

1. **Always start backend first**
2. **Wait 5 seconds**
3. **Then start frontend**
4. **Wait for "ready" messages**
5. **Open browser**

### Testing

1. **Test backend health:**
   ```
   http://localhost:5000/api/health
   ```

2. **Test a simple strategy:**
   - Go to Strategies page
   - Select "EMA Crossover"
   - Enter "AAPL"
   - Period "1y"
   - Click Analyze

3. **Test a fast prediction:**
   - Go to Predictions page
   - Select "ARIMA"
   - Enter "AAPL"
   - Period "1y"
   - Click Predict

---

## 📊 Verify Everything is Working

### Backend Checklist
- [ ] Flask server running on port 5000
- [ ] No import errors
- [ ] Health endpoint responds: `http://localhost:5000/api/health`
- [ ] Strategy endpoint works: `http://localhost:5000/api/strategy?name=ema_crossover&symbol=AAPL&period=1y`

### Frontend Checklist
- [ ] Vite dev server running on port 3000
- [ ] No console errors in browser (F12)
- [ ] Home page loads
- [ ] Navigation works
- [ ] Can switch between pages

### Integration Checklist
- [ ] Can analyze strategies
- [ ] Charts display correctly
- [ ] Can make predictions
- [ ] Metrics show up
- [ ] Chatbot button appears

---

## 🆘 Still Not Working?

### Debug Steps

1. **Check Python version:**
   ```bash
   python --version
   ```
   Should be 3.9 or higher

2. **Check Node version:**
   ```bash
   node --version
   ```
   Should be 18 or higher

3. **Reinstall everything:**
   
   **Backend:**
   ```bash
   cd backend
   pip uninstall -y -r requirements.txt
   pip install -r requirements.txt
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

4. **Check file structure:**
   ```
   backend/
   ├── __init__.py files in all folders ✓
   ├── app.py ✓
   ├── chatbot/ ✓
   ├── models/ ✓
   ├── strategies/ ✓
   └── utils/ ✓
   ```

---

## 📞 Quick Commands Reference

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python app.py

# Test health
curl http://localhost:5000/api/health
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Both
```bash
# Use the launcher script
START_APP.bat
```

---

## ✅ Success Indicators

You know everything is working when:

1. **Backend terminal shows:**
   ```
   * Running on http://127.0.0.1:5000
   * Debugger is active!
   ```

2. **Frontend terminal shows:**
   ```
   ➜  Local:   http://localhost:3000/
   ```

3. **Browser shows:**
   - Beautiful home page with gradient
   - Navigation bar at top
   - No console errors (F12)

4. **You can:**
   - Navigate between pages
   - Analyze strategies
   - Make predictions
   - See charts
   - Click chatbot button

---

**If you've followed all steps and it still doesn't work, check:**
- Firewall settings
- Antivirus blocking ports
- Other applications using ports 5000 or 3000
- Python/Node installation issues

**Happy Trading! 📈🚀**
