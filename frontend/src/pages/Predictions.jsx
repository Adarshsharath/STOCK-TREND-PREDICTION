import React, { useState, useEffect } from 'react'
import { Brain, Loader2, Search, ArrowLeft, Lightbulb, HelpCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import PredictionChart from '../components/PredictionChart'
import InfoCard from '../components/InfoCard'
import WeatherAlerts from '../components/WeatherAlerts'
import ModelComparison from '../components/ModelComparison'
import MarketSentimentPanel from '../components/MarketSentimentPanel'
import VolatilityPredictor from '../components/VolatilityPredictor'
import ExplainabilityPanel from '../components/ExplainabilityPanel'
import ClassificationResult from '../components/ClassificationResult'
import { useAuth } from '../context/AuthContext'

const MODELS = [
  // Regression Models (Price Prediction)
  { 
    id: 'lstm', 
    name: 'LSTM', 
    fullName: 'Long Short-Term Memory',
    category: 'regression',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-500',
    description: 'Deep learning model that remembers patterns over time. Best for stocks with clear trends and seasonal patterns.',
    accuracy: '75-85%',
    pros: 'Excellent for time series, captures complex patterns',
    cons: 'Requires more training time',
    bestFor: 'Trending stocks, long-term predictions'
  },
  { 
    id: 'prophet', 
    name: 'Prophet', 
    fullName: 'Facebook Prophet',
    category: 'regression',
    icon: '📈',
    color: 'from-green-500 to-teal-500',
    description: 'Created by Facebook, designed for business forecasting. Automatically handles holidays and seasonality.',
    accuracy: '70-80%',
    pros: 'Fast, works well with missing data',
    cons: 'Less accurate for volatile stocks',
    bestFor: 'Stable stocks, seasonal patterns'
  },
  { 
    id: 'arima', 
    name: 'ARIMA', 
    fullName: 'AutoRegressive Integrated Moving Average',
    category: 'regression',
    icon: '📊',
    color: 'from-purple-500 to-pink-500',
    description: 'Classical statistical method that analyzes past values. Fast and reliable for short-term predictions.',
    accuracy: '65-75%',
    pros: 'Very fast, simple to understand',
    cons: 'Struggles with sudden market changes',
    bestFor: 'Short-term predictions, stable markets'
  },
  { 
    id: 'randomforest', 
    name: 'Random Forest', 
    fullName: 'Random Forest Regressor',
    category: 'regression',
    icon: '🌳',
    color: 'from-emerald-500 to-green-500',
    description: 'Uses multiple decision trees to make predictions. Good at handling complex, non-linear relationships.',
    accuracy: '70-80%',
    pros: 'Robust, handles outliers well',
    cons: 'Can overfit on small datasets',
    bestFor: 'Medium-term predictions, volatile stocks'
  },
  { 
    id: 'xgboost', 
    name: 'XGBoost', 
    fullName: 'Extreme Gradient Boosting',
    category: 'regression',
    icon: '⚡',
    color: 'from-orange-500 to-red-500',
    description: 'Powerful gradient boosting algorithm. Often wins machine learning competitions for its accuracy.',
    accuracy: '75-85%',
    pros: 'High accuracy, feature importance',
    cons: 'Needs parameter tuning',
    bestFor: 'All types of stocks, high accuracy needed'
  },
  
  // Classification Models (Direction Prediction)
  { 
    id: 'logistic_regression', 
    name: 'Logistic Regression', 
    fullName: 'Logistic Regression Classifier',
    category: 'classification',
    icon: '📉',
    color: 'from-indigo-500 to-blue-500',
    description: 'Simple and fast classifier that predicts UP or DOWN movement. Good baseline model.',
    accuracy: '55-65%',
    pros: 'Very fast, interpretable',
    cons: 'Lower accuracy, assumes linear relationships',
    bestFor: 'Quick predictions, understanding trends'
  },
  { 
    id: 'xgboost_classifier', 
    name: 'XGBoost Classifier', 
    fullName: 'XGBoost Direction Classifier',
    category: 'classification',
    icon: '🎯',
    color: 'from-red-500 to-pink-500',
    description: 'Predicts whether stock will go UP or DOWN using gradient boosting. Very accurate for direction prediction.',
    accuracy: '60-75%',
    pros: 'High accuracy, handles complex patterns',
    cons: 'Slower than simple models',
    bestFor: 'Day trading, swing trading decisions'
  },
  { 
    id: 'randomforest_classifier', 
    name: 'Random Forest Classifier', 
    fullName: 'Random Forest Direction Classifier',
    category: 'classification',
    icon: '🌲',
    color: 'from-green-500 to-emerald-500',
    description: 'Uses ensemble of decision trees to vote on stock direction. Robust and reliable.',
    accuracy: '58-70%',
    pros: 'Stable predictions, good with noise',
    cons: 'Can be conservative',
    bestFor: 'Conservative trading, risk management'
  },
  { 
    id: 'lstm_classifier', 
    name: 'LSTM Classifier', 
    fullName: 'LSTM Direction Classifier',
    category: 'classification',
    icon: '🔮',
    color: 'from-purple-500 to-indigo-500',
    description: 'Deep learning model that learns temporal patterns to predict stock direction. Best for trending markets.',
    accuracy: '60-75%',
    pros: 'Captures long-term trends',
    cons: 'Requires more data and training time',
    bestFor: 'Trending stocks, pattern-based trading'
  },
  { 
    id: 'svm', 
    name: 'SVM', 
    fullName: 'Support Vector Machine',
    category: 'classification',
    icon: '🎲',
    color: 'from-yellow-500 to-orange-500',
    description: 'Finds optimal boundary between UP and DOWN movements. Works well with limited data.',
    accuracy: '55-70%',
    pros: 'Good with small datasets',
    cons: 'Slower on large datasets',
    bestFor: 'Small-cap stocks, limited historical data'
  }
]

const Predictions = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { experienceLevel } = useAuth()
  const fromFinance = location.state?.fromFinance || sessionStorage.getItem('returnToFinance') === 'true'
  
  const [selectedModel, setSelectedModel] = useState(null)
  const [symbol, setSymbol] = useState('RELIANCE.NS')
  const [period, setPeriod] = useState('2y')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [sentimentVolatility, setSentimentVolatility] = useState(null)
  const [svLoading, setSvLoading] = useState(false)
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(true)

  const isBeginner = experienceLevel === 'beginner'

  const fetchSentimentVolatility = async (stockSymbol) => {
    setSvLoading(true)
    try {
      const response = await api.get('/api/sentiment-volatility', {
        params: {
          symbol: stockSymbol.toUpperCase(),
          period: '1y'
        },
        timeout: 30000
      })
      setSentimentVolatility(response.data)
    } catch (err) {
      console.error('Sentiment/Volatility fetch error:', err)
      setSentimentVolatility(null)
    } finally {
      setSvLoading(false)
    }
  }

  // Load sentiment/volatility when symbol changes
  useEffect(() => {
    if (symbol.trim()) {
      fetchSentimentVolatility(symbol)
    }
  }, [symbol])

  const fetchPrediction = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await api.get('/api/predict', {
        params: {
          model: selectedModel,
          symbol: symbol.toUpperCase(),
          period
        },
        timeout: 120000
      })

      if (response.data && response.data.predictions) {
        setData(response.data)
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Prediction fetch error:', err)
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout - ML model training took too long. Try a shorter period.')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.message) {
        setError(`Error: ${err.message}`)
      } else {
        setError('Failed to fetch prediction data. Please check if backend is running.')
      }
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId)
    setShowAnalyze(true)
    setData(null)
    setError(null)
  }

  const handleAnalyze = () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }
    if (!selectedModel) {
      setError('Please select a model')
      return
    }
    fetchPrediction()
  }

  const currentModel = MODELS.find(m => m.id === selectedModel)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {fromFinance && (
        <button
          onClick={() => {
            sessionStorage.removeItem('returnToFinance')
            navigate('/finance')
          }}
          className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Smart Start</span>
        </button>
      )}
      
      {/* Weather Alerts */}
      <WeatherAlerts />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6" />
          <span className="text-sm font-medium">Machine Learning Predictions</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">ML Predictions</h1>
        <p className="text-white text-opacity-90">
          Choose from 10 advanced ML models - 5 for price prediction + 5 for direction prediction
        </p>
      </div>

      {/* Model Selection Cards */}
      {!showAnalyze && (
        <>
          {/* Regression Models */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
            <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">📈 Price Prediction Models</h2>
            <p className="text-text-muted dark:text-dark-text-muted mb-6">Predict exact future stock prices</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODELS.filter(m => m.category === 'regression').map(model => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg dark:hover:shadow-neon hover:scale-105 ${
                    selectedModel === model.id
                      ? 'border-primary bg-blue-50 dark:bg-blue-900/30 dark:border-neon-blue'
                      : 'border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated hover:border-primary dark:hover:border-neon-purple'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{model.icon}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {model.accuracy}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text dark:text-dark-text mb-1">{model.name}</h3>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted mb-3">{model.fullName}</p>
                  <p className="text-sm text-text-light dark:text-dark-text-secondary mb-3">{model.description}</p>
                  <div className="space-y-2 text-xs">
                    <p><strong className="text-green-600">✓</strong> {model.pros}</p>
                    <p><strong className="text-red-600">✗</strong> {model.cons}</p>
                    <p className="text-primary dark:text-neon-purple font-semibold">Best for: {model.bestFor}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Classification Models */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
            <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">🎯 Direction Prediction Models</h2>
            <p className="text-text-muted dark:text-dark-text-muted mb-6">Predict if stock will go UP ⬆️ or DOWN ⬇️</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODELS.filter(m => m.category === 'classification').map(model => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg dark:hover:shadow-neon hover:scale-105 ${
                    selectedModel === model.id
                      ? 'border-primary bg-blue-50 dark:bg-blue-900/30 dark:border-neon-blue'
                      : 'border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated hover:border-primary dark:hover:border-neon-purple'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{model.icon}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {model.accuracy}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text dark:text-dark-text mb-1">{model.name}</h3>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted mb-3">{model.fullName}</p>
                  <p className="text-sm text-text-light dark:text-dark-text-secondary mb-3">{model.description}</p>
                  <div className="space-y-2 text-xs">
                    <p><strong className="text-green-600">✓</strong> {model.pros}</p>
                    <p><strong className="text-red-600">✗</strong> {model.cons}</p>
                    <p className="text-primary dark:text-neon-purple font-semibold">Best for: {model.bestFor}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Analyze Section - Shows after model selection */}
      {showAnalyze && currentModel && (
        <>
          {/* Back button and selected model info */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <button
              onClick={() => {setShowAnalyze(false); setSelectedModel(null); setData(null); setError(null);}}
              className="text-primary hover:text-primary-dark mb-4 font-medium"
            >
              ← Back to Model Selection
            </button>
            <div className={`bg-gradient-to-r ${currentModel.color} text-white rounded-xl p-6 mb-4`}>
              <div className="flex items-start space-x-4">
                <span className="text-5xl">{currentModel.icon}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{currentModel.name}</h2>
                  <p className="text-white text-opacity-90 mb-2">{currentModel.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>✓ {currentModel.pros}</p>
                    <p>✗ {currentModel.cons}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <p className="text-xs opacity-90">Accuracy</p>
                    <p className="text-2xl font-bold">{currentModel.accuracy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyze Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Stock Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., RELIANCE.NS, TCS.NS"
                  className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Data Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1y">1 Year</option>
                  <option value="2y">2 Years</option>
                  <option value="5y">5 Years</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !symbol}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Training...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sentiment, Volatility, and Model Performance Analysis - Shows immediately */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MarketSentimentPanel sentimentData={sentimentVolatility?.sentiment} />
        <VolatilityPredictor volatilityData={sentimentVolatility?.volatility} />
        <ModelComparison 
          currentModel={selectedModel}
          metrics={data?.metrics || null}
        />
      </div>

      {/* Loading Message */}
      {loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-neon-blue rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-blue-800 dark:text-blue-300 font-medium">Training {MODELS.find(m => m.id === selectedModel)?.name} model for {symbol}...</p>
          <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">ML model training may take 30-90 seconds. Please be patient.</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-neon-pink rounded-xl p-4">
          <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">Try ARIMA model (fastest) or a shorter period, or check if the backend is running.</p>
        </div>
      )}

      {/* Results */}
      {data && (
        <>
          {/* Check if it's a classification model */}
          {data.metadata.type === 'classification' ? (
            /* Classification Result - Simple UP/DOWN Display */
            <ClassificationResult data={data} symbol={symbol} />
          ) : (
            /* Regression Result - Chart Display */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PredictionChart
                  predictions={data.predictions}
                  actual={data.actual}
                  dates={data.dates}
                  modelName={data.metadata.name}
                  metrics={data.metrics}
                />
              </div>
              <div className="space-y-6">
                <ExplainabilityPanel reasoning={data.reasoning} />
                <InfoCard
                  title={data.metadata.name}
                  description={data.metadata.description}
                  parameters={data.metadata.parameters}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Predictions
