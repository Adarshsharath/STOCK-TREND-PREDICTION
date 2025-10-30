import React, { useState } from 'react'
import { Brain, Loader2, Search } from 'lucide-react'
import axios from 'axios'
import PredictionChart from '../components/PredictionChart'
import InfoCard from '../components/InfoCard'

const MODELS = [
  { id: 'lstm', name: 'LSTM' },
  { id: 'prophet', name: 'Prophet' },
  { id: 'arima', name: 'ARIMA' },
  { id: 'randomforest', name: 'Random Forest' },
  { id: 'xgboost', name: 'XGBoost' }
]

const Predictions = () => {
  const [selectedModel, setSelectedModel] = useState('lstm')
  const [symbol, setSymbol] = useState('AAPL')
  const [period, setPeriod] = useState('2y')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchPrediction = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await axios.get('/api/predict', {
        params: {
          model: selectedModel,
          symbol: symbol.toUpperCase(),
          period
        },
        timeout: 120000 // 120 second timeout for ML models
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

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchPrediction()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6" />
          <span className="text-sm font-medium">Machine Learning Predictions</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">ML Predictions</h1>
        <p className="text-white text-opacity-90">
          Predict stock prices using advanced machine learning and deep learning models
        </p>
      </div>

      {/* Controls */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">ML Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, TSLA"
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
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
                  <span>Predict</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Loading Message */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-blue-800 font-medium">Training {MODELS.find(m => m.id === selectedModel)?.name} model for {symbol}...</p>
          <p className="text-blue-600 text-sm mt-2">ML model training may take 30-90 seconds. Please be patient.</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-2">Try ARIMA model (fastest) or a shorter period, or check if the backend is running.</p>
        </div>
      )}

      {/* Results */}
      {data && (
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
          <div>
            <InfoCard
              title={data.metadata.name}
              description={data.metadata.description}
              parameters={data.metadata.parameters}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Predictions
