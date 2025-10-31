import React from 'react'
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react'

const MarketSentimentPanel = ({ sentimentData }) => {
  if (!sentimentData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">Market Sentiment Analysis</h3>
        </div>
        <p className="text-text-muted text-sm">Loading sentiment data...</p>
      </div>
    )
  }

  const { sentiment, sentiment_score, color, emoji, summary, insights, metrics } = sentimentData

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">Market Sentiment Analysis</h3>
        </div>
        <div className="text-2xl">{emoji}</div>
      </div>

      {/* Sentiment Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-light">Overall Sentiment</span>
          <span className="text-lg font-bold" style={{ color: color }}>
            {sentiment}
          </span>
        </div>
        
        {/* Sentiment Score Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full rounded-full transition-all duration-500"
            style={{
              width: `${sentiment_score}%`,
              backgroundColor: color
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 p-4 bg-background rounded-lg">
        <p className="text-sm text-text leading-relaxed">{summary}</p>
      </div>

      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-text mb-2 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start text-sm text-text-light">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-text-muted mb-1">1-Day Change</p>
            <p className={`text-lg font-bold ${metrics.return_1d >= 0 ? 'text-success' : 'text-danger'}`}>
              {metrics.return_1d >= 0 ? '+' : ''}{metrics.return_1d.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">5-Day Change</p>
            <p className={`text-lg font-bold ${metrics.return_5d >= 0 ? 'text-success' : 'text-danger'}`}>
              {metrics.return_5d >= 0 ? '+' : ''}{metrics.return_5d.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">20-Day Change</p>
            <p className={`text-lg font-bold ${metrics.return_20d >= 0 ? 'text-success' : 'text-danger'}`}>
              {metrics.return_20d >= 0 ? '+' : ''}{metrics.return_20d.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Volume Trend</p>
            <p className="text-sm font-semibold text-text capitalize">
              {metrics.volume_trend}
              {metrics.volume_trend === 'increasing' && <TrendingUp className="inline w-4 h-4 ml-1 text-success" />}
              {metrics.volume_trend === 'decreasing' && <TrendingDown className="inline w-4 h-4 ml-1 text-danger" />}
            </p>
          </div>
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2 text-xs text-text-muted">
          <Activity className="w-3 h-3" />
          <span>AI-powered sentiment analysis using technical indicators</span>
        </div>
      </div>
    </div>
  )
}

export default MarketSentimentPanel
