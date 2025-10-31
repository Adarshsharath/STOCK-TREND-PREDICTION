import React from 'react'
import Plot from 'react-plotly.js'
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react'

const VolatilityPredictor = ({ volatilityData }) => {
  if (!volatilityData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">Volatility Predictor</h3>
        </div>
        <p className="text-text-muted text-sm">Loading volatility data...</p>
      </div>
    )
  }

  const {
    predicted_volatility_dollar,
    predicted_volatility_percent,
    volatility_level,
    color,
    current_atr,
    avg_range_5d,
    current_price,
    historical_data
  } = volatilityData

  // Prepare chart data
  const dates = historical_data.map(d => d.date)
  const dailyRanges = historical_data.map(d => d.daily_range)
  const atrValues = historical_data.map(d => d.atr)

  const traces = [
    {
      x: dates,
      y: dailyRanges,
      type: 'scatter',
      mode: 'lines',
      name: 'Daily Range',
      line: { color: '#94a3b8', width: 2 },
      fill: 'tozeroy',
      fillcolor: 'rgba(148, 163, 184, 0.1)'
    },
    {
      x: dates,
      y: atrValues,
      type: 'scatter',
      mode: 'lines',
      name: 'ATR (14)',
      line: { color: '#0891b2', width: 3 }
    }
  ]

  const layout = {
    title: {
      text: 'Volatility Trend (Last 30 Days)',
      font: { color: '#1e293b', size: 14, family: 'Inter' }
    },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#f8fafc',
    xaxis: {
      title: '',
      gridcolor: '#e2e8f0',
      color: '#64748b',
      showgrid: false
    },
    yaxis: {
      title: 'Price Range ($)',
      gridcolor: '#e2e8f0',
      color: '#64748b'
    },
    legend: {
      font: { color: '#64748b', size: 10 },
      bgcolor: '#ffffff',
      bordercolor: '#e2e8f0',
      borderwidth: 1,
      orientation: 'h',
      x: 0,
      y: 1.15
    },
    hovermode: 'x unified',
    margin: { t: 60, r: 20, b: 40, l: 50 },
    height: 250
  }

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">Volatility Predictor</h3>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <span className="text-xs font-semibold" style={{ color: color }}>
            {volatility_level}
          </span>
        </div>
      </div>

      {/* Predicted Volatility Card */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${color}10`, borderLeft: `4px solid ${color}` }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
              Next-Day Predicted Volatility
            </p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold" style={{ color: color }}>
                ±{predicted_volatility_percent.toFixed(2)}%
              </span>
              <span className="text-sm text-text-muted">
                (${predicted_volatility_dollar.toFixed(2)})
              </span>
            </div>
          </div>
          {volatility_level === 'High' && (
            <AlertTriangle className="w-8 h-8" style={{ color: color }} />
          )}
        </div>
        <p className="text-xs text-text-light mt-2">
          Expected price movement range for the next trading day
        </p>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-background rounded-lg">
          <p className="text-xs text-text-muted mb-1">Current ATR</p>
          <p className="text-lg font-bold text-primary">${current_atr.toFixed(2)}</p>
        </div>
        <div className="text-center p-3 bg-background rounded-lg">
          <p className="text-xs text-text-muted mb-1">Avg 5D Range</p>
          <p className="text-lg font-bold text-primary">${avg_range_5d.toFixed(2)}</p>
        </div>
        <div className="text-center p-3 bg-background rounded-lg">
          <p className="text-xs text-text-muted mb-1">Current Price</p>
          <p className="text-lg font-bold text-primary">${current_price.toFixed(2)}</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-900 mb-1">
              How it works
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Volatility prediction uses Average True Range (ATR) analysis based on the last 5 days' 
              price movements to forecast the expected trading range for tomorrow.
            </p>
          </div>
        </div>
      </div>

      {/* AI Badge */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2 text-xs text-text-muted">
          <Activity className="w-3 h-3" />
          <span>AI-powered volatility prediction using ATR analysis</span>
        </div>
      </div>
    </div>
  )
}

export default VolatilityPredictor
