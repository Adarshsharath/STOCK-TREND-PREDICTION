# FinBot AI 🤖📈

A comprehensive FinTech dashboard combining technical trading strategies, ML-based stock predictions, and an AI-powered finance chatbot.

## 🌟 Features

### 1. Trading Strategies
- **EMA Crossover**: Exponential Moving Average crossover strategy
- **RSI Strategy**: Relative Strength Index momentum strategy
- **MACD Strategy**: Moving Average Convergence Divergence
- **Bollinger Scalping**: Mean reversion with Bollinger Bands
- **SuperTrend**: Trend-following indicator strategy

### 2. ML Predictions
- **LSTM**: Long Short-Term Memory neural network
- **Prophet**: Facebook's time series forecasting model
- **ARIMA**: AutoRegressive Integrated Moving Average
- **Random Forest**: Ensemble learning model
- **XGBoost**: Extreme Gradient Boosting

### 3. AI Chatbot
- Powered by Perplexity AI
- Real-time financial insights
- Market analysis and trading advice
- Persistent chat across all pages

### 4. Weather & Disaster Alerts 🌪️ **NEW**
- Real-time weather monitoring in major financial centers
- Natural disaster alerts (hurricanes, earthquakes, floods, etc.)
- Market impact assessment
- Investment risk warnings based on severe weather
- Monitors: New York, London, Tokyo, Hong Kong, Mumbai, and more

## 🚀 Tech Stack

### Frontend
- React 18
- TailwindCSS
- Plotly.js (Interactive charts)
- Framer Motion (Animations)
- Axios (API calls)
- React Router (Navigation)

### Backend
- Flask (Python web framework)
- yfinance (Stock data)
- scikit-learn (ML models)
- TensorFlow (Deep learning)
- Prophet (Time series)
- XGBoost (Gradient boosting)
- Perplexity AI (Chatbot)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- pip

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```bash
cp .env.example .env
```

6. Add your API keys to `.env`:
```
PERPLEXITY_API_KEY=your_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here  # Optional but recommended
```

Get your OpenWeather API key from [OpenWeatherMap](https://openweathermap.org/api) (Free tier: 1,000 calls/day)

7. Run the Flask server:
```bash
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎨 Design System

### Color Palette
- **Background**: `#0d1117` (Dark)
- **Accent**: `#00b4d8` / `#38bdf8` (Teal/Blue)
- **Text**: `#e2e8f0` (Light gray)
- **Success**: `#22c55e` (Green - Buy signals)
- **Danger**: `#ef4444` (Red - Sell signals)
- **Card**: `#161b22` (Dark card background)
- **Border**: `#30363d` (Subtle borders)

### Typography
- **Display**: Poppins (Headings)
- **Body**: Inter (Content)

## 📡 API Endpoints

### Strategy Endpoint
```
GET /api/strategy?name={strategy}&symbol={stock}&period={period}
```

**Parameters:**
- `name`: Strategy name (ema_crossover, rsi, macd, bollinger_scalping, supertrend)
- `symbol`: Stock symbol (e.g., AAPL, TSLA, INFY.NS)
- `period`: Time period (1mo, 3mo, 6mo, 1y, 2y, 5y)

### Prediction Endpoint
```
GET /api/predict?model={model}&symbol={stock}&period={period}
```

**Parameters:**
- `model`: Model name (lstm, prophet, arima, randomforest, xgboost)
- `symbol`: Stock symbol
- `period`: Time period (1y, 2y, 5y)

### Chatbot Endpoint
```
POST /api/chatbot
```

**Body:**
```json
{
  "message": "What is a good strategy for volatile markets?",
  "conversation_history": []
}
```

### Weather Alerts Endpoint 🌪️ **NEW**
```
GET /api/weather-alerts?city={city}
```

**Parameters:**
- `city` (optional): Specific city to check (e.g., "New York", "Tokyo")

**Returns:** Real-time weather alerts and natural disaster warnings for major financial centers with market impact assessment.

### Disaster Impact Info
```
GET /api/disaster-impact-info
```

Returns information about how different disaster types impact markets.

### List Endpoints
```
GET /api/strategies  # List all available strategies
GET /api/models      # List all available ML models
GET /api/health      # Health check
```

## 🔧 Configuration

### Perplexity API
Get your API key from [Perplexity AI](https://www.perplexity.ai/)

### Stock Symbols
- US stocks: Use ticker symbol (e.g., `AAPL`, `TSLA`, `GOOGL`)
- Indian stocks: Add `.NS` suffix (e.g., `INFY.NS`, `TCS.NS`)
- Other markets: Check [Yahoo Finance](https://finance.yahoo.com/) for correct symbols

## 📊 Usage Examples

### Analyzing a Strategy
1. Navigate to **Strategies** tab
2. Select a strategy (e.g., EMA Crossover)
3. Enter stock symbol (e.g., AAPL)
4. Choose time period (e.g., 1 Year)
5. Click **Analyze**

### Making Predictions
1. Navigate to **Predictions** tab
2. Select ML model (e.g., LSTM)
3. Enter stock symbol
4. Choose time period
5. Click **Predict**

### Using the Chatbot
1. Click the chat icon in bottom-right corner
2. Ask questions about finance, stocks, or strategies
3. Get AI-powered insights in real-time

## 🚢 Deployment

### Backend (Render/Railway)
1. Create new web service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Add environment variable: `PERPLEXITY_API_KEY`

### Frontend (Vercel/Netlify)
1. Create new project
2. Connect your repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Update API base URL in production

## 📝 Project Structure

```
STOCK_TREND/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── strategies/            # Trading strategies
│   │   ├── ema_crossover.py
│   │   ├── rsi_strategy.py
│   │   ├── macd_strategy.py
│   │   ├── bollinger_scalping.py
│   │   └── supertrend.py
│   ├── models/                # ML prediction models
│   │   ├── lstm_model.py
│   │   ├── prophet_model.py
│   │   ├── arima_model.py
│   │   ├── randomforest_model.py
│   │   └── xgboost_model.py
│   ├── chatbot/
│   │   └── perplexity_bot.py  # AI chatbot
│   └── utils/
│       ├── fetch_data.py      # Data utilities
│       └── weather_alerts.py  # Weather alerts (NEW)
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── WeatherAlerts.jsx  # Weather alerts (NEW)
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. It should not be considered financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions.

## 🙏 Acknowledgments

- [yfinance](https://github.com/ranaroussi/yfinance) for stock data
- [Perplexity AI](https://www.perplexity.ai/) for chatbot capabilities
- [OpenWeatherMap](https://openweathermap.org/) for weather alerts
- [Plotly](https://plotly.com/) for interactive charts
- [TailwindCSS](https://tailwindcss.com/) for styling

---

Built with ❤️ for traders and investors
