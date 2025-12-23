import React, { useState, useEffect } from 'react'
import { Newspaper, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, Info } from 'lucide-react'
import axios from 'axios'

const NewsSentiment = ({ symbol }) => {
  const [sentiment, setSentiment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(true) // Changed to true - show by default

  useEffect(() => {
    if (symbol) {
      fetchSentiment()
    }
  }, [symbol])

  const fetchSentiment = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('/api/news-sentiment', {
        params: {
          symbol: symbol,
          days: 7,
          page_size: 10
        },
        timeout: 15000
      })
      
      if (response.data) {
        setSentiment(response.data)
      }
    } catch (err) {
      console.error('News sentiment error:', err)
      setError(err.response?.data?.message || 'Unable to fetch news sentiment')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentIcon = () => {
    if (!sentiment || sentiment.overall_sentiment === undefined) return <Minus className="w-5 h-5" />
    
    if (sentiment.overall_sentiment >= 0.1) {
      return <TrendingUp className="w-5 h-5 text-green-600" />
    } else if (sentiment.overall_sentiment <= -0.1) {
      return <TrendingDown className="w-5 h-5 text-red-600" />
    }
    return <Minus className="w-5 h-5 text-gray-600" />
  }

  const getSentimentColor = (score) => {
    if (score >= 0.5) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 0.1) return 'bg-green-50 text-green-700 border-green-200'
    if (score >= -0.1) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (score >= -0.5) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <Newspaper className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold text-text">Loading News Sentiment...</h3>
        </div>
      </div>
    )
  }

  if (error || sentiment?.message) {
    return (
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">News Sentiment Analysis</h3>
            <p className="text-sm text-blue-800">{sentiment?.message || error}</p>
            {sentiment?.disclaimer && (
              <p className="text-xs text-blue-700 mt-2">{sentiment.disclaimer}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!sentiment || sentiment.total_articles === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Newspaper className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-text">News Sentiment Analysis</h3>
            <p className="text-xs text-text-light">{symbol} • Last {(sentiment?.period_days ?? 7)} days</p>
          </div>
        </div>
        <button
          onClick={fetchSentiment}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Overall Sentiment Card */}
      <div className={`border-2 rounded-lg p-4 mb-4 ${getSentimentColor(sentiment.overall_sentiment)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSentimentIcon()}
            <div>
              <p className="text-sm font-medium">Overall Sentiment</p>
              <p className="text-2xl font-bold">{sentiment?.sentiment_emoji ?? '😐'} {sentiment?.sentiment_label ?? 'Neutral'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Score</p>
            <p className="text-2xl font-bold">{(((typeof sentiment?.overall_sentiment === 'number' ? sentiment.overall_sentiment : 0) * 100)).toFixed(1)}%</p>
          </div>
        </div>
        
        {/* Distribution */}
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs font-medium mb-1">Positive</p>
              <p className="text-lg font-bold">{(sentiment?.distribution?.positive ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Neutral</p>
              <p className="text-lg font-bold">{(sentiment?.distribution?.neutral ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Negative</p>
              <p className="text-lg font-bold">{(sentiment?.distribution?.negative ?? 0)}</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {sentiment.recommendation && (
          <div className="mt-4 pt-4 border-t border-current border-opacity-20">
            <p className="text-sm font-semibold mb-1">Trading Signal</p>
            <p className="text-base font-bold">{sentiment.recommendation.action}</p>
            <p className="text-xs mt-1">{sentiment.recommendation.reason}</p>
          </div>
        )}
      </div>

      {/* Confidence Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Data Confidence</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(typeof sentiment?.confidence === 'number' ? sentiment.confidence : 0)}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{(typeof sentiment?.confidence === 'number' ? sentiment.confidence : 0)}%</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Consistency</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-secondary h-2 rounded-full transition-all"
                style={{ width: `${(typeof sentiment?.consistency_score === 'number' ? sentiment.consistency_score : 0)}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{(typeof sentiment?.consistency_score === 'number' ? sentiment.consistency_score : 0)}%</span>
          </div>
        </div>
      </div>

      {/* Article Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-sm text-primary font-medium hover:underline"
      >
        {expanded ? 'Hide' : 'Show'} {(sentiment?.total_articles ?? (Array.isArray(sentiment?.articles) ? sentiment.articles.length : 0))} News Articles
      </button>

      {/* Article List */}
      {expanded && sentiment.articles && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {sentiment.articles.map((article, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-text mb-1 line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-text-light">{article.source}</p>
                </div>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${getSentimentColor(article.sentiment_score)}`}>
                  {article.sentiment_emoji} {article.sentiment_label}
                </span>
              </div>
              {article.description && (
                <p className="text-xs text-text-light mb-2 line-clamp-2">{article.description}</p>
              )}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center space-x-1"
              >
                <span>Read more</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsSentiment
