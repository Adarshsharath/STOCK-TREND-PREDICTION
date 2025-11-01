import React, { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Clock, Target, Zap, LineChart, Activity } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const TRADING_TYPES = [
  {
    id: 'scalping',
    name: 'Scalping',
    icon: '⚡',
    description: 'Quick trades lasting seconds to minutes. Capture small price movements multiple times per day.',
    timeframe: '1-5 minutes',
    strategies: ['VWAP', 'Bollinger Bands'],
    models: ['XGBoost', 'Random Forest'],
    risk: 'High',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'intraday',
    name: 'Intraday / Day Trading',
    icon: '📊',
    description: 'Buy and sell within the same trading day. No overnight positions. Capture intraday price swings.',
    timeframe: '15min - 4 hours',
    strategies: ['EMA Crossover', 'SuperTrend', 'RSI'],
    models: ['LSTM', 'XGBoost'],
    risk: 'Medium-High',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'swing',
    name: 'Swing Trading',
    icon: '📈',
    description: 'Hold positions for days to weeks. Capture medium-term trends and momentum.',
    timeframe: '1 hour - 1 day',
    strategies: ['MACD', 'Ichimoku Cloud', 'ADX/DMI'],
    models: ['Prophet', 'LSTM'],
    risk: 'Medium',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'position',
    name: 'Position Trading',
    icon: '🎯',
    description: 'Long-term investing. Hold positions for weeks to months. Follow major market trends.',
    timeframe: '1 day - 1 week',
    strategies: ['Ichimoku Cloud', 'MACD'],
    models: ['lstm', 'prophet'],
    risk: 'Low-Medium',
    color: 'from-purple-500 to-indigo-500'
  }
]

const POPULAR_STOCKS = {
  indian: [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY.NS', name: 'Infosys Limited' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'WIPRO.NS', name: 'Wipro Limited' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'ITC.NS', name: 'ITC Limited' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' }
  ],
  us: [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'ORCL', name: 'Oracle Corporation' },
    { symbol: 'CSCO', name: 'Cisco Systems' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'PYPL', name: 'PayPal Holdings' }
  ]
}

const Finance = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedTradingType, setSelectedTradingType] = useState(null)
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState(null)
  const [activeMarket, setActiveMarket] = useState('indian')
  const [stockPrices, setStockPrices] = useState({})

  useEffect(() => {
    fetchMarketOverview()
    fetchStockPrices()
    
    // Restore Finance page state if returning from Strategy/Prediction
    const savedState = sessionStorage.getItem('financePageState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        if (state.selectedStock) setSelectedStock(state.selectedStock)
        if (state.selectedTradingType) setSelectedTradingType(state.selectedTradingType)
        if (state.recommendation) setRecommendation(state.recommendation)
        if (state.activeMarket) setActiveMarket(state.activeMarket)
      } catch (error) {
        console.error('Error restoring Finance state:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Refresh stock prices when market changes
    fetchStockPrices()
  }, [activeMarket])

  const fetchMarketOverview = async () => {
    try {
      const res = await axios.get('/api/market-overview')
      setMarketData(res.data)
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
  }

  const fetchStockPrices = async () => {
    try {
      const stocks = POPULAR_STOCKS[activeMarket]
      const pricePromises = stocks.map(async (stock) => {
        try {
          const res = await axios.get('/api/stock-price', {
            params: { symbol: stock.symbol },
            timeout: 5000
          })
          return { symbol: stock.symbol, data: res.data }
        } catch (error) {
          console.error(`Error fetching price for ${stock.symbol}:`, error)
          return { symbol: stock.symbol, data: null }
        }
      })
      
      const results = await Promise.all(pricePromises)
      const pricesMap = {}
      results.forEach(({ symbol, data }) => {
        if (data) {
          pricesMap[symbol] = data
        }
      })
      setStockPrices(pricesMap)
    } catch (error) {
      console.error('Error fetching stock prices:', error)
    }
  }

  const handleStockSelect = (stock) => {
    setSelectedStock(stock)
    setSelectedTradingType(null)
    setRecommendation(null)
  }

  const handleTradingTypeSelect = async (tradingType) => {
    setSelectedTradingType(tradingType)
    setLoading(true)
    
    try {
      // Fetch strategy analysis
      // Map frontend strategy names to backend API names
      const strategyMapping = {
        'VWAP': 'vwap',
        'Bollinger Bands': 'bollinger_scalping',
        'EMA Crossover': 'ema_crossover',
        'SuperTrend': 'supertrend',
        'RSI': 'rsi',
        'MACD': 'macd',
        'Ichimoku Cloud': 'ichimoku',
        'ADX/DMI': 'adx_dmi',
        'ML LSTM': 'ml_lstm'
      }
      
      // Determine periods based on trading type for better results
      const strategyPeriod = tradingType.id === 'position' ? '6mo' : tradingType.id === 'swing' ? '3mo' : '1mo'
      const predictionPeriod = tradingType.id === 'position' ? '2y' : tradingType.id === 'swing' ? '1y' : '6mo'
      
      const strategyName = strategyMapping[tradingType.strategies[0]] || tradingType.strategies[0].toLowerCase().replace(/ /g, '_')
      const strategyRes = await axios.get('/api/strategy', {
        params: {
          name: strategyName,
          symbol: selectedStock.symbol,
          period: strategyPeriod
        }
      })

      // Fetch prediction
      const modelName = tradingType.models[0].toLowerCase()
      const predictionRes = await axios.get('/api/predict', {
        params: {
          model: modelName,
          symbol: selectedStock.symbol,
          period: predictionPeriod
        }
      })

      // Generate recommendation
      const buySignals = strategyRes.data.buy_signals?.length || 0
      const sellSignals = strategyRes.data.sell_signals?.length || 0
      const prediction = predictionRes.data
      
      // Check prediction direction more safely
      let predictionPositive = false
      
      if (prediction) {
        if (prediction.direction === 'up' || prediction.direction === 'UP') {
          predictionPositive = true
        } else if (prediction.next_day_prediction && prediction.next_day_prediction.direction === 'UP') {
          predictionPositive = true
        } else if (prediction.predictions && prediction.predictions.length > 0) {
          // For regression models, check if trend is upward
          const recentPredictions = prediction.predictions.slice(-5)
          const avgChange = recentPredictions.reduce((sum, val, idx, arr) => {
            if (idx === 0) return sum
            return sum + (val - arr[idx - 1])
          }, 0) / (recentPredictions.length - 1)
          predictionPositive = avgChange > 0
        }
      }
      
      // Determine recommendation
      let action, confidence, summary
      
      if (buySignals > sellSignals && predictionPositive) {
        action = 'BUY'
        confidence = 'High'
        summary = `✅ ${tradingType.name} looks favorable for ${selectedStock.name}! The ${tradingType.strategies[0]} strategy shows ${buySignals} buy signals and ${modelName.toUpperCase()} model predicts positive movement.`
      } else if (sellSignals > buySignals && !predictionPositive) {
        action = 'SELL'
        confidence = 'High'
        summary = `🔴 ${tradingType.name} suggests selling ${selectedStock.name}. The ${tradingType.strategies[0]} strategy shows ${sellSignals} sell signals and ${modelName.toUpperCase()} model predicts downward movement.`
      } else {
        action = 'WAIT'
        confidence = 'Low'
        summary = `⚠️ Mixed signals for ${tradingType.name} on ${selectedStock.name}. ${buySignals} buy vs ${sellSignals} sell signals. Consider waiting for clearer direction.`
      }
      
      setRecommendation({
        action,
        confidence,
        summary,
        details: {
          buySignals,
          sellSignals,
          strategy: tradingType.strategies[0],
          model: tradingType.models[0],
          timeframe: tradingType.timeframe
        }
      })
    } catch (error) {
      console.error('Error generating recommendation:', error)
      setRecommendation({
        action: 'ERROR',
        summary: 'Unable to generate recommendation. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredStocks = [...POPULAR_STOCKS.indian, ...POPULAR_STOCKS.us].filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Smart Start</h1>
        </div>
        <p className="text-white text-opacity-90 text-lg">
          Search stocks, choose your trading style, and get AI-powered recommendations
        </p>
      </div>

      {/* Stock Search */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-bold text-text mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-primary" />
          Search & Select Stock
        </h2>
        
        {/* Market Toggle */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveMarket('indian')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeMarket === 'indian'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            Indian Markets
          </button>
          <button
            onClick={() => setActiveMarket('us')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeMarket === 'us'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            US Markets
          </button>
        </div>

        <input
          type="text"
          placeholder="Search for stocks (e.g., RELIANCE, AAPL, TCS)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Popular Stocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(searchQuery ? filteredStocks : POPULAR_STOCKS[activeMarket]).map((stock) => {
            const priceData = stockPrices[stock.symbol]
            const hasPrice = priceData && priceData.price
            const change = priceData?.change || 0
            const changePercent = priceData?.changePercent || 0
            const isPositive = change >= 0
            
            return (
              <button
                key={stock.symbol}
                onClick={() => handleStockSelect(stock)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedStock?.symbol === stock.symbol
                    ? 'border-primary bg-blue-50'
                    : 'border-border bg-white hover:border-primary hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-text">{stock.symbol}</p>
                    <p className="text-xs text-text-muted">{stock.name}</p>
                  </div>
                  {hasPrice && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-text">
                        {activeMarket === 'indian' ? '₹' : '$'}{priceData.price.toFixed(2)}
                      </p>
                      <div className={`text-xs font-semibold flex items-center justify-end ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Trading Type Selection */}
      {selectedStock && (
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-bold text-text mb-4">
            Choose Your Trading Style for {selectedStock.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRADING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTradingTypeSelect(type)}
                className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                  selectedTradingType?.id === type.id
                    ? 'border-primary bg-blue-50'
                    : 'border-border hover:border-primary'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{type.icon}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    type.risk === 'High' ? 'bg-red-100 text-red-700' :
                    type.risk.includes('Medium') ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {type.risk} Risk
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text mb-2">{type.name}</h3>
                <p className="text-sm text-text-light mb-3">{type.description}</p>
                <div className="space-y-2 text-xs text-text-muted">
                  <p><Clock className="w-3 h-3 inline mr-1" /> <strong>Timeframe:</strong> {type.timeframe}</p>
                  <p><Target className="w-3 h-3 inline mr-1" /> <strong>Strategies:</strong> {type.strategies.join(', ')}</p>
                  <p><Zap className="w-3 h-3 inline mr-1" /> <strong>Models:</strong> {type.models.join(', ')}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {loading && (
        <div className="bg-white rounded-xl p-8 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Analyzing {selectedStock?.name} with {selectedTradingType?.name}...</p>
        </div>
      )}

      {recommendation && !loading && (
        <div className={`rounded-xl p-6 shadow-card border-l-4 ${
          recommendation.action === 'BUY'
            ? 'bg-green-50 border-green-500'
            : recommendation.action === 'WAIT'
            ? 'bg-yellow-50 border-yellow-500'
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-text mb-2">
                {recommendation.action === 'BUY' 
                  ? '✅ Recommendation: BUY' 
                  : recommendation.action === 'SELL'
                  ? '🔴 Recommendation: SELL'
                  : '⚠️ Recommendation: WAIT'}
              </h3>
              <p className="text-sm text-text-muted">Confidence: {recommendation.confidence}</p>
            </div>
            {(recommendation.action === 'BUY' || recommendation.action === 'WAIT' || recommendation.action === 'SELL') && recommendation.details && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Save current Finance state
                    sessionStorage.setItem('financePageState', JSON.stringify({
                      selectedStock,
                      selectedTradingType,
                      recommendation,
                      activeMarket
                    }))
                    sessionStorage.setItem('returnToFinance', 'true')
                    
                    const strategyId = recommendation.details.strategy.toLowerCase().replace(/ /g, '-').replace(/\//, '-')
                    navigate(`/strategies/${strategyId}`, { state: { fromFinance: true } })
                  }}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2"
                >
                  <LineChart className="w-5 h-5" />
                  <span>View Strategy</span>
                </button>
                <button
                  onClick={() => {
                    // Save current Finance state
                    sessionStorage.setItem('financePageState', JSON.stringify({
                      selectedStock,
                      selectedTradingType,
                      recommendation,
                      activeMarket
                    }))
                    sessionStorage.setItem('returnToFinance', 'true')
                    
                    navigate('/predictions', { state: { fromFinance: true } })
                  }}
                  className="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>View Model</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-text-light leading-relaxed">{recommendation.summary}</p>
          </div>

          {recommendation.details && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3">
                <p className="text-text-muted">Buy Signals</p>
                <p className="text-xl font-bold text-success">{recommendation.details.buySignals}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-text-muted">Sell Signals</p>
                <p className="text-xl font-bold text-danger">{recommendation.details.sellSignals}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-text-muted">Strategy</p>
                <p className="text-sm font-semibold text-text">{recommendation.details.strategy}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-text-muted">Model</p>
                <p className="text-sm font-semibold text-text">{recommendation.details.model}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-text-muted">Timeframe</p>
                <p className="text-sm font-semibold text-text">{recommendation.details.timeframe}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Finance
