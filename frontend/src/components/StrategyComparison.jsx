import React from 'react'
import { LineChart, Zap, Target, TrendingUp, Award, Clock, Activity } from 'lucide-react'

const StrategyComparison = ({ currentStrategy }) => {
  // Strategy characteristics data
  const strategyInfo = {
    'ema_crossover': {
      name: 'EMA Crossover',
      speed: 4,
      accuracy: 4,
      signals: 3,
      riskLevel: 3,
      description: 'Identifies trend changes using moving averages',
      strengths: ['Clear entry/exit signals', 'Works in trending markets', 'Simple to understand'],
      weaknesses: ['Lags in sideways markets', 'Multiple false signals', 'Best for trending stocks'],
      bestFor: 'Trending markets and momentum trading',
      timeframe: '1-3 months',
      color: 'blue'
    },
    'rsi': {
      name: 'RSI Strategy',
      speed: 5,
      accuracy: 3,
      signals: 4,
      riskLevel: 2,
      description: 'Detects overbought/oversold conditions',
      strengths: ['Quick signals', 'Works in ranging markets', 'Low risk entries'],
      weaknesses: ['Weak in strong trends', 'Can stay overbought/oversold', 'Needs confirmation'],
      bestFor: 'Range-bound markets and reversals',
      timeframe: 'Days to weeks',
      color: 'green'
    },
    'macd': {
      name: 'MACD Strategy',
      speed: 3,
      accuracy: 5,
      signals: 3,
      riskLevel: 3,
      description: 'Captures momentum shifts and trend strength',
      strengths: ['High accuracy', 'Momentum confirmation', 'Reliable trend signals'],
      weaknesses: ['Slower signals', 'Lags in fast markets', 'Complex for beginners'],
      bestFor: 'Momentum trading and trend confirmation',
      timeframe: 'Weeks to months',
      color: 'purple'
    },
    'bollinger_scalping': {
      name: 'Bollinger Scalping',
      speed: 5,
      accuracy: 3,
      signals: 5,
      riskLevel: 4,
      description: 'High-frequency trading using volatility bands',
      strengths: ['Many trading opportunities', 'Quick profits', 'Volatility adaptive'],
      weaknesses: ['High risk', 'Requires constant monitoring', 'Small profit margins'],
      bestFor: 'Day trading and scalping',
      timeframe: 'Minutes to hours',
      color: 'orange'
    },
    'supertrend': {
      name: 'SuperTrend',
      speed: 4,
      accuracy: 5,
      signals: 2,
      riskLevel: 2,
      description: 'Strong trend-following with clear signals',
      strengths: ['Very clear signals', 'Low false signals', 'Great for trends'],
      weaknesses: ['Poor in sideways markets', 'Late entries', 'Misses quick reversals'],
      bestFor: 'Strong trending markets',
      timeframe: 'Weeks to months',
      color: 'red'
    }
  }

  const current = strategyInfo[currentStrategy] || strategyInfo['ema_crossover']

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      green: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      purple: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      orange: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      red: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    }
    return colors[color] || colors.blue
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < rating ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const getRiskLabel = (level) => {
    if (level <= 2) return { text: 'Low Risk', color: 'text-green-600 dark:text-green-400' }
    if (level <= 3) return { text: 'Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' }
    return { text: 'High Risk', color: 'text-red-600 dark:text-red-400' }
  }

  const risk = getRiskLabel(current.riskLevel)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-text dark:text-white">Strategy Analysis</h3>
          <p className="text-xs text-text-light dark:text-gray-400">Understanding {current.name} characteristics</p>
        </div>
      </div>

      {/* Current Strategy Highlight */}
      <div className={`border-2 rounded-lg p-4 mb-6 ${getColorClass(current.color)}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xl font-bold">{current.name}</h4>
            <p className="text-sm opacity-90 mt-1">{current.description}</p>
          </div>
          <Award className="w-8 h-8 opacity-50" />
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white dark:bg-gray-800 bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Speed</span>
              {renderStars(current.speed)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Accuracy</span>
              {renderStars(current.accuracy)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Signal Freq.</span>
              {renderStars(current.signals)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Risk Level</span>
              {renderStars(current.riskLevel)}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-text dark:text-white">Risk Assessment</span>
          </div>
          <span className={`text-sm font-bold ${risk.color}`}>{risk.text}</span>
        </div>
      </div>

      {/* Best For */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <Zap className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text dark:text-white mb-1">Best Use Case</p>
            <p className="text-sm text-text-light dark:text-gray-300">{current.bestFor}</p>
          </div>
        </div>
      </div>

      {/* Timeframe */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-text dark:text-white">Typical Timeframe</span>
          </div>
          <span className="text-sm font-bold text-primary">{current.timeframe}</span>
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-text dark:text-white mb-2 flex items-center space-x-2">
          <span className="text-green-600">✓</span>
          <span>Strengths</span>
        </p>
        <ul className="space-y-1">
          {current.strengths.map((strength, idx) => (
            <li key={idx} className="text-xs text-text-light dark:text-gray-300 flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-text dark:text-white mb-2 flex items-center space-x-2">
          <span className="text-orange-600">⚠</span>
          <span>Limitations</span>
        </p>
        <ul className="space-y-1">
          {current.weaknesses.map((weakness, idx) => (
            <li key={idx} className="text-xs text-text-light dark:text-gray-300 flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Strategy Comparison Quick View */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-text dark:text-white mb-3">Quick Comparison</p>
        <div className="space-y-2">
          {Object.entries(strategyInfo).map(([key, strategy]) => (
            <div
              key={key}
              className={`flex items-center justify-between p-2 rounded ${
                key === currentStrategy
                  ? 'bg-primary bg-opacity-10 border border-primary dark:bg-primary dark:bg-opacity-20'
                  : 'bg-gray-50 dark:bg-gray-700/30'
              }`}
            >
              <span className={`text-xs font-medium ${
                key === currentStrategy ? 'text-primary' : 'text-text-light dark:text-gray-400'
              }`}>
                {strategy.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-text-light dark:text-gray-400">{strategy.speed}/5</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-text-light dark:text-gray-400">{strategy.accuracy}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Tip */}
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <span className="font-semibold">💡 Pro Tip:</span> Test this strategy with different periods to find the optimal timeframe for your trading style.
        </p>
      </div>
    </div>
  )
}

export default StrategyComparison
