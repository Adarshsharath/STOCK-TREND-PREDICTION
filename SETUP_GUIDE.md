# 🚀 FinBot AI - Complete Setup Guide

## ✨ New Modern UI Design

The application has been completely redesigned with a clean, professional interface inspired by modern healthcare dashboards. Features include:

- **Clean Light Theme** - Professional white background with teal/cyan accents
- **Modern Navigation** - Horizontal navbar with icons
- **Beautiful Hero Section** - Engaging landing page
- **Interactive Dashboard** - Stats cards and overview
- **Responsive Design** - Works perfectly on all devices

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.9+** installed
- **Node.js 18+** and npm installed
- **Git** (optional, for version control)
- **Internet connection** (for fetching stock data)

---

## 🎯 Quick Start (No Virtual Environment)

### Step 1: Install Backend Dependencies

```bash
cd backend
pip install flask flask-cors flask-caching yfinance pandas numpy scikit-learn tensorflow prophet statsmodels xgboost ta requests python-dotenv gunicorn
```

Or use the requirements file:

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment (Optional)

Create a `.env` file in the `backend` folder:

```bash
cd backend
copy .env.example .env
```

Edit `.env` and add your Perplexity API key (optional for chatbot):

```
PERPLEXITY_API_KEY=your_key_here
```

### Step 3: Start Backend Server

```bash
cd backend
python app.py
```

Backend will run on: **http://localhost:5000**

### Step 4: Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

### Step 6: Open in Browser

Navigate to: **http://localhost:3000**

---

## 🎨 New Features

### 1. Home Page
- Beautiful hero section with gradient background
- Feature cards showcasing capabilities
- Stats section with key metrics
- Call-to-action buttons

### 2. Strategies Page
- Clean card-based layout
- Interactive Plotly charts with light theme
- Signal summary cards
- Professional color scheme

### 3. Predictions Page
- ML model selection
- Prediction charts with metrics
- Performance indicators
- Clean data visualization

### 4. Dashboard Page
- Overview statistics
- Strategy and model listings
- Automation rate display
- Quick access cards

### 5. About Page
- Mission statement
- Technology stack
- Feature highlights
- Important disclaimers

### 6. Modern Chatbot
- Floating action button
- Clean chat interface
- Light theme messages
- Smooth animations

---

## 🎨 Design System

### Color Palette
```css
Primary: #0891b2 (Cyan/Teal)
Primary Dark: #0e7490
Secondary: #10b981 (Green)
Background: #f8fafc (Light Gray)
Card: #ffffff (White)
Text: #1e293b (Dark Gray)
Text Light: #64748b
Border: #e2e8f0
```

### Typography
- **Font Family**: Inter (system-ui fallback)
- **Headings**: Bold, 700 weight
- **Body**: Regular, 400 weight

### Components
- **Cards**: White background, subtle shadow, rounded corners
- **Buttons**: Primary color, hover effects, rounded
- **Inputs**: White background, border, focus ring
- **Charts**: Light background, clean grid lines

---

## 📊 Testing the Application

### Test Strategy Analysis
1. Go to **Strategies** page
2. Select "EMA Crossover"
3. Enter symbol: `AAPL`
4. Select period: `1 Year`
5. Click **Analyze**
6. View buy/sell signals on chart

### Test ML Predictions
1. Go to **Predictions** page
2. Select "LSTM" model
3. Enter symbol: `TSLA`
4. Select period: `2 Years`
5. Click **Predict**
6. View predictions and metrics

### Test Chatbot
1. Click chat icon (bottom-right)
2. Ask: "What is RSI strategy?"
3. Get AI-powered response
4. Continue conversation

---

## 🔧 Troubleshooting

### Backend Issues

**Error: "No module named 'flask'"**
```bash
pip install flask flask-cors flask-caching
```

**Error: "No module named 'yfinance'"**
```bash
pip install yfinance pandas numpy
```

**Error: "No module named 'tensorflow'"**
```bash
pip install tensorflow
```

**Port 5000 already in use:**
- Stop other Flask applications
- Or change port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Frontend Issues

**Error: "Cannot find module"**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Port 3000 already in use:**
```bash
npm run dev -- --port 3001
```

**Tailwind styles not working:**
```bash
npm install tailwindcss postcss autoprefixer
```

### Data Issues

**Error: "No data found for symbol"**
- Check if symbol is correct
- Try adding market suffix (e.g., `.NS` for India)
- Check internet connection
- Try a different symbol

**Charts not displaying:**
- Check browser console for errors
- Ensure Plotly.js is installed: `npm install plotly.js react-plotly.js`
- Clear browser cache

---

## 📱 Responsive Design

The application is fully responsive and works on:

- **Desktop**: Full layout with all features
- **Tablet**: Adapted grid layouts
- **Mobile**: Stacked layouts, mobile-optimized navigation

---

## 🚀 Deployment

### Backend (Render/Railway)
1. Create new web service
2. Connect repository
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Add environment variable: `PERPLEXITY_API_KEY`

### Frontend (Vercel/Netlify)
1. Create new project
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

---

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/strategy` | GET | Get trading signals |
| `/api/predict` | GET | Get ML predictions |
| `/api/chatbot` | POST | Chat with AI |
| `/api/strategies` | GET | List strategies |
| `/api/models` | GET | List models |

---

## 🎯 Popular Stock Symbols

### US Stocks
- `AAPL` - Apple
- `TSLA` - Tesla
- `GOOGL` - Google
- `MSFT` - Microsoft
- `NVDA` - NVIDIA
- `META` - Meta
- `AMZN` - Amazon

### Indian Stocks
- `INFY.NS` - Infosys
- `TCS.NS` - TCS
- `RELIANCE.NS` - Reliance
- `HDFCBANK.NS` - HDFC Bank

---

## ⚠️ Important Notes

1. **No Virtual Environment Required** - Install packages globally or use your preferred method
2. **API Key Optional** - Chatbot requires Perplexity API key, but app works without it
3. **Internet Required** - For fetching real-time stock data
4. **Educational Purpose** - Not financial advice, for learning only

---

## 🎉 You're All Set!

Your FinBot AI application is now running with a beautiful, modern interface!

**Next Steps:**
1. Explore the Home page
2. Try different trading strategies
3. Test ML predictions
4. Chat with the AI assistant
5. View the Dashboard overview

**Happy Trading! 📈**

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review error messages
3. Check browser console
4. Verify all dependencies are installed

---

**Built with ❤️ for traders and investors**
