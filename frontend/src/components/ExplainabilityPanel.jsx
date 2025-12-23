import React from 'react'
import { Brain, TrendingUp, TrendingDown, Target, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react'

const ExplainabilityPanel = ({ reasoning }) => {
  if (!reasoning) {
    return null
  }

  const {
    summary,
    trend,
    trend_emoji,
    trend_color,
    prediction_change_percent,
    confidence_level,
    confidence_score,
    confidence_color,
    factors,
    insight,
    metadata
  } = reasoning

  const getImpactBadge = (impact) => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-orange-100 text-orange-800 border-orange-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    }
    return badges[impact] || badges.medium
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text">AI Reasoning Summary</h3>
      </div>

      {/* Prediction Direction Card */}
      <div 
        className="rounded-lg p-4 mb-4 border-2"
        style={{ 
          backgroundColor: `${trend_color}10`,
          borderColor: trend_color
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{trend_emoji}</span>
            <div>
              <p className="text-sm text-text-muted uppercase tracking-wide">Predicted Trend</p>
              <p className="text-2xl font-bold" style={{ color: trend_color }}>
                {trend}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Expected Change</p>
            <p className="text-xl font-bold" style={{ color: trend_color }}>
              {prediction_change_percent >= 0 ? '+' : ''}{prediction_change_percent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-2">Why This Prediction?</p>
            <p className="text-sm text-blue-800 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* Key Factors */}
      {factors && factors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-text mb-3 flex items-center">
            <Target className="w-4 h-4 mr-1 text-primary" />
            Key Factors Analyzed
          </h4>
          <div className="space-y-3">
            {factors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow"
              >
                <span className="text-2xl flex-shrink-0">{factor.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-text">{factor.title}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getImpactBadge(factor.impact)}`}>
                      {factor.impact}
                    </span>
                  </div>
                  <p className="text-xs text-text-light leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Insight */}
      {insight && (
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Trading Insight</p>
              <p className="text-sm text-green-800 leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            {metadata.current_price && (
              <div>
                <p className="text-xs text-text-muted">Current Price</p>
                <p className="text-sm font-bold text-text">₹{metadata.current_price.toFixed(2)}</p>
              </div>
            )}
            {metadata.predicted_price && (
              <div>
                <p className="text-xs text-text-muted">Predicted Price</p>
                <p className="text-sm font-bold text-primary">₹{metadata.predicted_price.toFixed(2)}</p>
              </div>
            )}
            {metadata.directional_accuracy !== undefined && (
              <div>
                <p className="text-xs text-text-muted">Model Accuracy</p>
                <p className="text-sm font-bold text-success">{metadata.directional_accuracy.toFixed(1)}%</p>
              </div>
            )}
            {metadata.mae_percent !== undefined && (
              <div>
                <p className="text-xs text-text-muted">Error Margin</p>
                <p className="text-sm font-bold text-text">±{metadata.mae_percent.toFixed(2)}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-muted leading-relaxed">
            This analysis is AI-generated based on historical patterns and should not be considered as financial advice. 
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>

      {/* AI Badge */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2 text-xs text-text-muted">
          <Brain className="w-3 h-3" />
          <span>Powered by AI Explainability Engine</span>
        </div>
      </div>
    </div>
  )
}

export default ExplainabilityPanel
