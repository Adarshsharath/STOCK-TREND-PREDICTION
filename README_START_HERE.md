# 🚀 START HERE - FinSight AI Quick Start

## ⚡ Fastest Way to Run

### Option 1: Use the Launcher (Recommended)
Double-click: **`START_APP.bat`**

This will:
1. Start backend on port 5000
2. Start frontend on port 3000
3. Open both in separate windows

Wait 10 seconds, then open: **http://localhost:3000**

---

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

Wait for: `* Running on http://127.0.0.1:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `➜  Local:   http://localhost:3000/`

**Open Browser:**
```
http://localhost:3000
```

---

## ✅ What You Should See

### 1. Backend Terminal
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Debugger is active!
```

### 2. Frontend Terminal
```
  VITE v5.4.21  ready in 1947 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Browser
- Beautiful home page with teal gradient
- Horizontal navigation bar
- "FinSight AI Trading Platform" logo
- No errors in console (press F12)

---

## 🎯 First Steps

### 1. Test a Strategy
1. Click **"Strategies"** in navbar
2. Select **"EMA Crossover"**
3. Enter symbol: **`AAPL`**
4. Select period: **`1 Year`**
5. Click **"Analyze"**
6. Wait 5-10 seconds
7. See chart with buy/sell signals!

### 2. Test a Prediction
1. Click **"Predictions"** in navbar
2. Select **"ARIMA"** (fastest model)
3. Enter symbol: **`TSLA`**
4. Select period: **`1 Year`**
5. Click **"Predict"**
6. Wait 10-15 seconds
7. See prediction chart with metrics!

### 3. Test the Chatbot
1. Click chat icon (💬) in bottom-right corner
2. Type: **"What is RSI strategy?"**
3. Press Enter
4. Get AI response!

**Note:** Chatbot requires Perplexity API key (optional)

---

## 🐛 Something Not Working?

### Quick Fixes

**Backend won't start?**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend won't start?**
```bash
cd frontend
npm install
npm run dev
```

**Connection errors?**
1. Make sure backend is running FIRST
2. Wait 5 seconds
3. Then start frontend
4. Refresh browser

**Still having issues?**
Read: **`TROUBLESHOOTING.md`**

---

## 📁 Project Structure

```
STOCK_TREND/
│
├── START_APP.bat           ← Double-click this!
├── README_START_HERE.md    ← You are here
├── TROUBLESHOOTING.md      ← If something breaks
├── SETUP_GUIDE.md          ← Detailed setup
├── WHATS_NEW.md            ← What's new in v2.0
│
├── backend/                ← Flask API
│   ├── app.py             ← Main server
│   ├── requirements.txt   ← Python packages
│   ├── strategies/        ← 5 trading strategies
│   ├── models/            ← 5 ML models
│   ├── chatbot/           ← AI chatbot
│   └── utils/             ← Helper functions
│
└── frontend/               ← React UI
    ├── package.json       ← Node packages
    ├── src/
    │   ├── pages/         ← 5 pages
    │   ├── components/    ← UI components
    │   └── context/       ← State management
    └── public/            ← Static assets
```

---

## 🎨 Features

### Pages
1. **Home** - Landing page with hero section
2. **Strategies** - 5 trading strategies with charts
3. **Predictions** - 5 ML models with predictions
4. **Dashboard** - Overview and statistics
5. **About** - Information and tech stack

### Trading Strategies
1. **EMA Crossover** - Moving average signals
2. **RSI Strategy** - Momentum indicator
3. **MACD Strategy** - Trend following
4. **Bollinger Scalping** - Mean reversion
5. **SuperTrend** - ATR-based trend

### ML Models
1. **LSTM** - Deep learning (slowest, most accurate)
2. **Prophet** - Facebook's forecasting
3. **ARIMA** - Classical time series (fastest)
4. **Random Forest** - Ensemble learning
5. **XGBoost** - Gradient boosting

### Other Features
- 🤖 AI Chatbot (Perplexity AI)
- 📊 Interactive Plotly charts
- 🎨 Modern light theme design
- 📱 Fully responsive
- ⚡ Real-time stock data

---

## 🔑 Optional: Setup Chatbot

The chatbot requires a Perplexity API key:

1. **Get API Key:**
   - Go to: https://www.perplexity.ai/
   - Sign up and get API key

2. **Create .env file:**
   ```bash
   cd backend
   copy .env.example .env
   ```

3. **Add key to .env:**
   ```
   PERPLEXITY_API_KEY=your_key_here
   ```

4. **Restart backend:**
   ```bash
   python app.py
   ```

**Note:** App works without API key, but chatbot won't respond.

---

## 📊 Popular Stock Symbols

### US Stocks
- `AAPL` - Apple
- `TSLA` - Tesla
- `GOOGL` - Google
- `MSFT` - Microsoft
- `NVDA` - NVIDIA
- `META` - Meta
- `AMZN` - Amazon

### Indian Stocks (add .NS)
- `INFY.NS` - Infosys
- `TCS.NS` - TCS
- `RELIANCE.NS` - Reliance
- `HDFCBANK.NS` - HDFC Bank

---

## ⚠️ Important Notes

1. **TensorFlow Warnings** - These are normal, ignore them:
   ```
   oneDNN custom operations are on...
   ```

2. **First Prediction** - Takes 30-60 seconds (training model)

3. **Cached Results** - Subsequent requests are instant

4. **Internet Required** - For fetching stock data

5. **Not Financial Advice** - Educational purposes only

---

## 🎉 You're All Set!

Everything is configured and ready to use. Just:

1. Run **`START_APP.bat`** OR start manually
2. Wait for both servers to start
3. Open **http://localhost:3000**
4. Explore and enjoy!

---

## 📚 More Documentation

- **SETUP_GUIDE.md** - Detailed installation
- **TROUBLESHOOTING.md** - Fix common issues
- **WHATS_NEW.md** - Version 2.0 changes
- **DEPLOYMENT.md** - Deploy to production
- **ARCHITECTURE.md** - Technical details

---

## 🆘 Need Help?

1. Check **TROUBLESHOOTING.md**
2. Verify both servers are running
3. Check browser console (F12)
4. Test backend: `http://localhost:5000/api/health`
5. Restart everything

---

**Happy Trading! 📈🚀**

**Version:** 2.0  
**Design:** Modern Light Theme  
**Status:** ✅ Ready to Use
