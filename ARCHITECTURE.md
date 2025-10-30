# 🏗️ FinBot AI - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components Layer                                         │  │
│  │  • Navbar          • StrategyChart    • Chatbot          │  │
│  │  • InfoCard        • PredictionChart  • ChatWindow       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages Layer                                              │  │
│  │  • Strategies Page                                        │  │
│  │  • Predictions Page                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  State Management                                         │  │
│  │  • ChatContext (Conversation state)                       │  │
│  │  • React Router (Navigation)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Axios HTTP Calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (Python)                        │
│                     http://localhost:5000                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Endpoints (app.py)                                   │  │
│  │  • GET  /api/strategy    • GET  /api/strategies          │  │
│  │  • GET  /api/predict     • GET  /api/models              │  │
│  │  • POST /api/chatbot     • GET  /api/health              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                     │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │  │
│  │  │  Strategies    │  │  ML Models     │  │  Chatbot   │ │  │
│  │  │  • EMA         │  │  • LSTM        │  │  • Perp AI │ │  │
│  │  │  • RSI         │  │  • Prophet     │  │            │ │  │
│  │  │  • MACD        │  │  • ARIMA       │  └────────────┘ │  │
│  │  │  • Bollinger   │  │  • RandomForest│                 │  │
│  │  │  • SuperTrend  │  │  • XGBoost     │                 │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Data Layer                                               │  │
│  │  • fetch_data.py (yfinance integration)                   │  │
│  │  • Data preprocessing & feature engineering               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┬──────────────┐
                ▼                         ▼              ▼
    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐
    │  Yahoo Finance   │    │  Perplexity AI   │    │  Flask Cache │
    │   (yfinance)     │    │      API         │    │   (Memory)   │
    │                  │    │                  │    │              │
    │  Stock Data      │    │  AI Responses    │    │  Cache Data  │
    └──────────────────┘    └──────────────────┘    └──────────────┘
```

---

## Data Flow Diagrams

### 1. Strategy Analysis Flow

```
User Input (Symbol, Strategy, Period)
    │
    ▼
Frontend: Strategies.jsx
    │
    │ axios.get('/api/strategy?name=ema&symbol=AAPL&period=1y')
    ▼
Backend: app.py → get_strategy()
    │
    ├─→ fetch_data.py → yfinance → Yahoo Finance API
    │                      │
    │                      ▼
    │                  Raw OHLCV Data
    │
    ├─→ strategies/ema_crossover.py
    │       │
    │       ├─→ Calculate EMA(12), EMA(26)
    │       ├─→ Generate Buy/Sell Signals
    │       └─→ Return: { data, buy_signals, sell_signals, metadata }
    │
    ▼
Frontend: StrategyChart.jsx
    │
    ├─→ Plotly.js renders interactive chart
    ├─→ Green triangles for Buy signals
    └─→ Red triangles for Sell signals
    │
    ▼
User sees visualization + strategy info
```

### 2. ML Prediction Flow

```
User Input (Symbol, Model, Period)
    │
    ▼
Frontend: Predictions.jsx
    │
    │ axios.get('/api/predict?model=lstm&symbol=TSLA&period=2y')
    ▼
Backend: app.py → get_prediction()
    │
    ├─→ fetch_data.py → yfinance → Yahoo Finance API
    │                      │
    │                      ▼
    │                  Historical Price Data
    │
    ├─→ models/lstm_model.py
    │       │
    │       ├─→ Create sequences (60-day windows)
    │       ├─→ Scale data (MinMaxScaler)
    │       ├─→ Build LSTM model (TensorFlow)
    │       ├─→ Train on 80% data
    │       ├─→ Predict on 20% test data
    │       ├─→ Calculate metrics (MAE, RMSE, Accuracy)
    │       └─→ Return: { predictions, actual, dates, metrics, metadata }
    │
    ▼
Frontend: PredictionChart.jsx
    │
    ├─→ Plotly.js renders actual vs predicted
    ├─→ Display metrics cards
    └─→ Show model information
    │
    ▼
User sees predictions + performance metrics
```

### 3. Chatbot Flow

```
User types message in chat
    │
    ▼
Frontend: ChatWindow.jsx
    │
    │ axios.post('/api/chatbot', { message, conversation_history })
    ▼
Backend: app.py → chatbot()
    │
    ├─→ chatbot/perplexity_bot.py
    │       │
    │       ├─→ Build message array with system prompt
    │       ├─→ Add conversation history
    │       ├─→ Add user message
    │       │
    │       ├─→ POST to Perplexity AI API
    │       │       │
    │       │       └─→ Perplexity AI processes with:
    │       │           • System prompt (FinBot context)
    │       │           • User question
    │       │           • Conversation history
    │       │
    │       ├─→ Receive AI response
    │       └─→ Return: { response, conversation_history, error }
    │
    ▼
Frontend: ChatWindow.jsx
    │
    ├─→ Display bot message in chat
    ├─→ Update conversation history
    └─→ Scroll to bottom
    │
    ▼
User sees AI response
```

---

## Component Hierarchy

### Frontend Component Tree

```
App.jsx
├── ChatProvider (Context)
│   └── Router
│       ├── Navbar.jsx
│       │   ├── Logo + Brand
│       │   └── Navigation Links
│       │
│       ├── Routes
│       │   ├── /strategies → Strategies.jsx
│       │   │   ├── Header
│       │   │   ├── Controls Form
│       │   │   │   ├── Strategy Dropdown
│       │   │   │   ├── Symbol Input
│       │   │   │   ├── Period Dropdown
│       │   │   │   └── Analyze Button
│       │   │   │
│       │   │   └── Results Grid
│       │   │       ├── StrategyChart.jsx (Plotly)
│       │   │       ├── InfoCard.jsx
│       │   │       └── Signal Summary
│       │   │
│       │   └── /predictions → Predictions.jsx
│       │       ├── Header
│       │       ├── Controls Form
│       │       │   ├── Model Dropdown
│       │       │   ├── Symbol Input
│       │       │   ├── Period Dropdown
│       │       │   └── Predict Button
│       │       │
│       │       └── Results Grid
│       │           ├── PredictionChart.jsx (Plotly)
│       │           ├── Metrics Cards
│       │           └── InfoCard.jsx
│       │
│       └── Chatbot.jsx (Fixed Position)
│           ├── Floating Action Button
│           └── ChatWindow.jsx (Conditional)
│               ├── Header
│               ├── Messages Area
│               │   ├── Empty State
│               │   ├── Message Bubbles
│               │   └── Loading Indicator
│               └── Input Area
```

### Backend Module Structure

```
app.py (Flask App)
├── CORS Configuration
├── Cache Configuration
├── Route Handlers
│   ├── /api/health
│   ├── /api/strategy
│   ├── /api/predict
│   ├── /api/chatbot
│   ├── /api/strategies
│   └── /api/models
│
├── strategies/
│   ├── ema_crossover.py
│   │   └── ema_crossover_strategy()
│   ├── rsi_strategy.py
│   │   └── rsi_strategy()
│   ├── macd_strategy.py
│   │   └── macd_strategy()
│   ├── bollinger_scalping.py
│   │   └── bollinger_scalping_strategy()
│   └── supertrend.py
│       └── supertrend_strategy()
│
├── models/
│   ├── lstm_model.py
│   │   └── lstm_predict()
│   ├── prophet_model.py
│   │   └── prophet_predict()
│   ├── arima_model.py
│   │   └── arima_predict()
│   ├── randomforest_model.py
│   │   └── randomforest_predict()
│   └── xgboost_model.py
│       └── xgboost_predict()
│
├── chatbot/
│   └── perplexity_bot.py
│       └── chat_with_perplexity()
│
└── utils/
    └── fetch_data.py
        ├── fetch_stock_data()
        ├── preprocess_data()
        └── calculate_returns()
```

---

## Technology Stack Details

### Frontend Stack

```
┌─────────────────────────────────────┐
│         React 18.2.0                │  Component-based UI
├─────────────────────────────────────┤
│         Vite 5.0.8                  │  Build tool & dev server
├─────────────────────────────────────┤
│      TailwindCSS 3.3.6              │  Utility-first CSS
├─────────────────────────────────────┤
│       Plotly.js 2.27.1              │  Interactive charts
├─────────────────────────────────────┤
│    Framer Motion 10.16.16           │  Animations
├─────────────────────────────────────┤
│      Lucide React 0.294.0           │  Icons
├─────────────────────────────────────┤
│        Axios 1.6.2                  │  HTTP client
├─────────────────────────────────────┤
│   React Router DOM 6.20.0           │  Routing
└─────────────────────────────────────┘
```

### Backend Stack

```
┌─────────────────────────────────────┐
│         Flask 3.0.0                 │  Web framework
├─────────────────────────────────────┤
│       yfinance 0.2.33               │  Stock data
├─────────────────────────────────────┤
│        Pandas 2.1.4                 │  Data manipulation
├─────────────────────────────────────┤
│        NumPy 1.26.2                 │  Numerical computing
├─────────────────────────────────────┤
│     scikit-learn 1.3.2              │  ML algorithms
├─────────────────────────────────────┤
│      TensorFlow 2.15.0              │  Deep learning
├─────────────────────────────────────┤
│       Prophet 1.1.5                 │  Time series forecasting
├─────────────────────────────────────┤
│       XGBoost 2.0.3                 │  Gradient boosting
├─────────────────────────────────────┤
│     statsmodels 0.14.1              │  Statistical models
├─────────────────────────────────────┤
│      Perplexity AI API              │  AI chatbot
└─────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│  1. Environment Variables                               │
│     • API keys stored in .env (not in git)              │
│     • .env.example for template                         │
├─────────────────────────────────────────────────────────┤
│  2. CORS Configuration                                  │
│     • Restrict origins in production                    │
│     • Allow localhost in development                    │
├─────────────────────────────────────────────────────────┤
│  3. Input Validation                                    │
│     • Validate stock symbols                            │
│     • Sanitize user inputs                              │
│     • Error handling for invalid data                   │
├─────────────────────────────────────────────────────────┤
│  4. API Rate Limiting (Future)                          │
│     • Prevent abuse                                     │
│     • Throttle requests                                 │
├─────────────────────────────────────────────────────────┤
│  5. HTTPS in Production                                 │
│     • Encrypt data in transit                           │
│     • Secure API communications                         │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────┐
│      Flask-Caching (Backend)        │
├─────────────────────────────────────┤
│  • Cache Type: Simple (Memory)      │
│  • Default Timeout: 300s (5 min)    │
│  • Cached Endpoints:                │
│    - Stock data fetches             │
│    - Strategy calculations          │
│    - Model predictions              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Browser Caching (Frontend)     │
├─────────────────────────────────────┤
│  • Vite build optimization          │
│  • Code splitting                   │
│  • Asset minification               │
│  • Lazy loading (future)            │
└─────────────────────────────────────┘
```

### Build Optimization

```
Frontend Build Process (npm run build):
    │
    ├─→ Vite bundles React code
    ├─→ TailwindCSS purges unused styles
    ├─→ Minify JavaScript
    ├─→ Optimize assets
    ├─→ Generate source maps
    └─→ Output to dist/ folder

Backend Deployment:
    │
    ├─→ Use Gunicorn (production WSGI)
    ├─→ Enable caching
    ├─→ Optimize model loading
    └─→ Configure workers
```

---

## Error Handling Flow

```
Error Occurs
    │
    ├─→ Frontend Error
    │   ├─→ Try-Catch in async functions
    │   ├─→ Display error message to user
    │   ├─→ Log to console (dev mode)
    │   └─→ Maintain app stability
    │
    └─→ Backend Error
        ├─→ Try-Except in route handlers
        ├─→ Return JSON error response
        ├─→ HTTP status codes (400, 500)
        ├─→ Log error details
        └─→ Don't expose internals
```

---

## Deployment Architecture

### Development

```
Local Machine
├── Backend: localhost:5000
├── Frontend: localhost:3000
└── Direct communication
```

### Production

```
┌──────────────────────────────────────────┐
│         Vercel/Netlify (Frontend)        │
│         https://finbot-ai.vercel.app     │
└────────────────┬─────────────────────────┘
                 │
                 │ HTTPS API Calls
                 ▼
┌──────────────────────────────────────────┐
│         Render/Railway (Backend)         │
│    https://finbot-ai-api.onrender.com   │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────────┐         ┌──────────────┐
│ Yahoo Finance│         │ Perplexity AI│
└─────────────┘         └──────────────┘
```

---

## Scalability Considerations

### Current Architecture (MVP)
- Single server deployment
- In-memory caching
- Synchronous processing
- Direct API calls

### Future Scalability (If Needed)
```
┌─────────────────────────────────────────┐
│  Load Balancer                          │
├─────────────────────────────────────────┤
│  Multiple Backend Instances             │
├─────────────────────────────────────────┤
│  Redis Cache (Shared)                   │
├─────────────────────────────────────────┤
│  Message Queue (Celery)                 │
├─────────────────────────────────────────┤
│  Database (PostgreSQL)                  │
├─────────────────────────────────────────┤
│  Model Serving (TensorFlow Serving)     │
└─────────────────────────────────────────┘
```

---

## Monitoring & Logging

### Development
```
Frontend: Browser DevTools Console
Backend: Flask Debug Mode Logs
```

### Production (Recommended)
```
┌─────────────────────────────────────────┐
│  Frontend Monitoring                    │
│  • Vercel Analytics                     │
│  • Sentry (Error tracking)              │
│  • Google Analytics                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Backend Monitoring                     │
│  • Render Logs                          │
│  • Sentry (Error tracking)              │
│  • New Relic (Performance)              │
└─────────────────────────────────────────┘
```

---

**Architecture designed for:**
✅ Modularity  
✅ Scalability  
✅ Maintainability  
✅ Performance  
✅ Security  

