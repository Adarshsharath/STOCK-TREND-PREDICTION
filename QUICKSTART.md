# ⚡ Quick Start Guide

Get FinBot AI running in 5 minutes!

## 🎯 Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- Git installed

## 🚀 Setup Steps

### Step 1: Clone or Navigate to Project
```bash
cd c:/Users/ADHARSH/OneDrive/Desktop/STOCK_TREND
```

### Step 2: Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your Perplexity API key (optional for chatbot)
# PERPLEXITY_API_KEY=your_key_here

# Run Flask server
python app.py
```

Backend will start on: **http://localhost:5000**

### Step 3: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will start on: **http://localhost:3000**

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

## 🎮 Try It Out!

### Test a Strategy
1. Click **Strategies** tab
2. Select "EMA Crossover"
3. Enter stock symbol: `AAPL`
4. Click **Analyze**
5. View buy/sell signals on the chart!

### Test a Prediction
1. Click **Predictions** tab
2. Select "LSTM"
3. Enter stock symbol: `TSLA`
4. Click **Predict**
5. View predicted vs actual prices!

### Test the Chatbot
1. Click the chat icon (💬) in bottom-right
2. Ask: "What is the best strategy for beginners?"
3. Get AI-powered insights!

## 🔑 Getting Perplexity API Key (Optional)

The chatbot requires a Perplexity API key:

1. Go to [https://www.perplexity.ai/](https://www.perplexity.ai/)
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Add it to `backend/.env`:
   ```
   PERPLEXITY_API_KEY=your_actual_key_here
   ```

**Note:** The app works without the API key, but the chatbot won't function.

## 📊 Popular Stock Symbols to Try

### US Stocks
- `AAPL` - Apple
- `TSLA` - Tesla
- `GOOGL` - Google
- `MSFT` - Microsoft
- `AMZN` - Amazon
- `NVDA` - NVIDIA
- `META` - Meta (Facebook)

### Indian Stocks (add .NS suffix)
- `INFY.NS` - Infosys
- `TCS.NS` - Tata Consultancy Services
- `RELIANCE.NS` - Reliance Industries
- `HDFCBANK.NS` - HDFC Bank

## ⚠️ Troubleshooting

### Backend Issues

**Error: "No module named 'flask'"**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate
pip install -r requirements.txt
```

**Error: "Address already in use"**
```bash
# Port 5000 is busy, kill the process or change port in app.py
```

### Frontend Issues

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: "Port 3000 is already in use"**
```bash
# Vite will automatically use port 3001, or specify:
npm run dev -- --port 3001
```

### Data Issues

**Error: "No data found for symbol"**
- Check if symbol is correct
- Try adding market suffix (e.g., `.NS` for India)
- Check internet connection
- Try a different symbol

## 🎨 What You'll See

### Strategies Page
- Interactive Plotly chart with price data
- Green triangles = Buy signals
- Red triangles = Sell signals
- Strategy info card with parameters
- Signal summary

### Predictions Page
- Actual vs Predicted price comparison
- Performance metrics (MAE, RMSE, Accuracy)
- Model information
- Interactive charts

### Chatbot
- Floating chat button
- Real-time AI responses
- Finance-focused insights
- Conversation history

## 🎓 Next Steps

1. **Explore Different Strategies**
   - Try all 5 strategies on the same stock
   - Compare which gives better signals

2. **Test ML Models**
   - Compare LSTM vs Prophet vs XGBoost
   - Check which has better accuracy

3. **Customize**
   - Modify strategy parameters in backend code
   - Adjust model hyperparameters
   - Change color scheme in tailwind.config.js

4. **Deploy**
   - Follow DEPLOYMENT.md for production setup
   - Share with friends!

## 📚 Learn More

- Read full README.md for detailed documentation
- Check DEPLOYMENT.md for production deployment
- Explore the code to understand how it works

---

**Happy Trading! 📈🚀**
