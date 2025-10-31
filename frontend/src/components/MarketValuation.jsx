import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Building2 } from 'lucide-react'
import axios from 'axios'

const MarketValuation = ({ symbol }) => {
  const [valuation, setValuation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (symbol) {
      fetchValuation()
    }
  }, [symbol])

  const fetchValuation = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('/api/market-valuation', {
        params: { symbol },
        timeout: 15000
      })
      
      if (response.data) {
        setValuation(response.data)
      }
    } catch (err) {
      console.error('Market valuation error:', err)
      setError(err.response?.data?.message || 'Unable to fetch market data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num, decimals = 2) => {
    if (!num) return 'N/A'
    if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`
    return `$${num.toFixed(decimals)}`
  }

  const formatPercent = (num) => {
    if (!num) return 'N/A'
    const sign = num > 0 ? '+' : ''
    return `${sign}${num.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold text-text dark:text-white">Loading Market Data...</h3>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-text dark:text-white">Market Valuation</h3>
          </div>
          <button
            onClick={fetchValuation}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
      </div>
    )
  }

  if (!valuation) return null

  const priceChange = valuation.change_percent || 0
  const isPositive = priceChange >= 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-text dark:text-white">Market Valuation</h3>
            <p className="text-xs text-text-light dark:text-gray-400">{symbol} • Real-time Data</p>
          </div>
        </div>
        <button
          onClick={fetchValuation}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Current Price */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-4 mb-4">
        <p className="text-sm opacity-90 mb-1">Current Price</p>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold">{formatNumber(valuation.current_price, 2)}</p>
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
            {isPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-lg font-semibold">{formatPercent(priceChange)}</span>
          </div>
        </div>
        <p className="text-xs opacity-75 mt-2">Change: {formatNumber(valuation.change, 2)}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Market Cap */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Market Cap</p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
            {formatNumber(valuation.market_cap)}
          </p>
        </div>

        {/* Volume */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Volume</p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
            {formatNumber(valuation.volume, 0)}
          </p>
        </div>

        {/* PE Ratio */}
        {valuation.pe_ratio && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">P/E Ratio</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-300">
              {valuation.pe_ratio.toFixed(2)}
            </p>
          </div>
        )}

        {/* 52 Week High */}
        {valuation.week_52_high && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">52W High</p>
            <p className="text-lg font-bold text-orange-900 dark:text-orange-300">
              {formatNumber(valuation.week_52_high, 2)}
            </p>
          </div>
        )}

        {/* 52 Week Low */}
        {valuation.week_52_low && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">52W Low</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-300">
              {formatNumber(valuation.week_52_low, 2)}
            </p>
          </div>
        )}

        {/* Average Volume */}
        {valuation.avg_volume && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Avg Volume</p>
            <p className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
              {formatNumber(valuation.avg_volume, 0)}
            </p>
          </div>
        )}
      </div>

      {/* Trading Range */}
      {valuation.day_low && valuation.day_high && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Today's Range</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              {formatNumber(valuation.day_low, 2)}
            </span>
            <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ 
                  width: `${((valuation.current_price - valuation.day_low) / (valuation.day_high - valuation.day_low)) * 100}%` 
                }}
              />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              {formatNumber(valuation.day_high, 2)}
            </span>
          </div>
        </div>
      )}

      {/* Company Info */}
      {valuation.company_name && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-text dark:text-white">{valuation.company_name}</p>
          {valuation.sector && (
            <p className="text-xs text-text-light dark:text-gray-400 mt-1">
              {valuation.sector} • {valuation.industry || 'N/A'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MarketValuation
