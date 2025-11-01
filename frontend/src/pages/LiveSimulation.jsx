import React, { useEffect, useMemo, useRef, useState } from 'react'
import Plot from 'react-plotly.js'
import axios from 'axios'
import { Play, Pause, RotateCcw, Zap, Clock, DollarSign, TrendingUp, TrendingDown, Info, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'

const STRATEGY_OPTIONS = [
  { id: 'ema_crossover', label: 'EMA Crossover' },
  { id: 'rsi', label: 'RSI' },
  { id: 'macd', label: 'MACD' },
]

const SYMBOL_OPTIONS = [
  { id: 'AAPL', label: 'AAPL' },
  { id: 'TCS.NS', label: 'TCS' },
  { id: 'RELIANCE.NS', label: 'RELIANCE' },
]

const SPEEDS = [
  { id: 250, label: '4x' },
  { id: 500, label: '2x' },
  { id: 1000, label: '1x' },
]

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
const toTs = (d) => {
  try {
    const dt = new Date(d)
    // Keep seconds precision for stable matching
    return isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0,19)
  } catch { return String(d) }
}
const fmt = (d) => {
  try { return new Date(d).toLocaleString() } catch { return String(d) }
}

export default function LiveSimulation() {
  const [strategy, setStrategy] = useState(STRATEGY_OPTIONS[0].id)
  const [symbol, setSymbol] = useState(SYMBOL_OPTIONS[0].id)
  const [days, setDays] = useState(10)
  const [speed, setSpeed] = useState(1000)
  const [isPlaying, setIsPlaying] = useState(false)
  const [data, setData] = useState([])
  const [buySignals, setBuySignals] = useState([])
  const [sellSignals, setSellSignals] = useState([])
  const [index, setIndex] = useState(0)
  const [error, setError] = useState('')
  const [isCandlestick, setIsCandlestick] = useState(true)

  // Trading state
  const [trades, setTrades] = useState([]) // {entryDate, entryPrice, exitDate?, exitPrice?}
  const timerRef = useRef(null)

  useEffect(() => {
    // load data on params change
    const load = async () => {
      setError('')
      setIsPlaying(false)
      clearInterval(timerRef.current)
      setIndex(0)
      setTrades([])
      try {
        const period = `${clamp(days, 5, 10)}d`
        const res = await axios.get('/api/strategy', {
          params: { name: strategy, symbol, period }
        })
        // Normalize timestamps for stable comparisons
        const d = (res.data?.data || [])
          .map(p => ({ ...p, ts: toTs(p.date) }))
          .sort((a,b)=> (a.ts > b.ts ? 1 : -1))
        const buys = (res.data?.buy_signals || []).map(s => ({ ...s, ts: toTs(s.date) }))
        const sells = (res.data?.sell_signals || []).map(s => ({ ...s, ts: toTs(s.date) }))
        setData(d)
        setBuySignals(buys)
        setSellSignals(sells)
      } catch (e) {
        setError('Failed to fetch data. Ensure backend is running and CORS/proxy is configured.')
      }
    }
    load()
    return () => clearInterval(timerRef.current)
  }, [strategy, symbol, days])

  const currentSlice = useMemo(() => data.slice(0, clamp(index, 0, data.length)), [data, index])

  // Process trades as we advance index
  useEffect(() => {
    if (!currentSlice.length) return
    const lastPoint = currentSlice[currentSlice.length - 1]
    const dateStr = lastPoint.ts

    const isBuy = buySignals.some(s => s.ts === dateStr)
    const isSell = sellSignals.some(s => s.ts === dateStr)

    if (isBuy) {
      // open new trade (assume 1 unit)
      setTrades(prev => [...prev, { entryDate: dateStr, entryPrice: lastPoint.close }])
    }
    if (isSell) {
      // close last open trade if any
      setTrades(prev => {
        const openIdx = prev.findIndex(t => !t.exitDate)
        if (openIdx === -1) return prev
        const clone = [...prev]
        clone[openIdx] = { ...clone[openIdx], exitDate: dateStr, exitPrice: lastPoint.close }
        return clone
      })
    }
  }, [currentSlice.length])

  const pnl = useMemo(() => {
    let realized = 0
    let open = 0
    let openTrades = 0
    const lastPrice = currentSlice.length ? currentSlice[currentSlice.length-1].close : 0

    trades.forEach(t => {
      if (t.exitPrice != null) realized += (t.exitPrice - t.entryPrice)
      else if (lastPrice) { open += (lastPrice - t.entryPrice); openTrades += 1 }
    })
    return { realized, open, total: realized + open, openTrades }
  }, [trades, currentSlice])

  // Playback timer
  useEffect(() => {
    if (!isPlaying || !data.length) return
    timerRef.current = setInterval(() => {
      setIndex(i => {
        const next = i + 1
        if (next >= data.length) {
          clearInterval(timerRef.current)
          return data.length
        }
        return next
      })
    }, speed)
    return () => clearInterval(timerRef.current)
  }, [isPlaying, speed, data.length])

  const reset = () => {
    setIsPlaying(false)
    clearInterval(timerRef.current)
    setIndex(0)
    setTrades([])
  }

  const buyMarkers = useMemo(() => currentSlice.filter(p => buySignals.some(s => s.ts === p.ts)), [currentSlice, buySignals])
  const sellMarkers = useMemo(() => currentSlice.filter(p => sellSignals.some(s => s.ts === p.ts)), [currentSlice, sellSignals])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-5 shadow-card border border-border dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-text-muted dark:text-dark-text-muted">Symbol</label>
            <select className="w-full mt-1 border rounded-lg p-2" value={symbol} onChange={e=>setSymbol(e.target.value)}>
              {SYMBOL_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted dark:text-dark-text-muted">Strategy</label>
            <select className="w-full mt-1 border rounded-lg p-2" value={strategy} onChange={e=>setStrategy(e.target.value)}>
              {STRATEGY_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted dark:text-dark-text-muted">Lookback Days</label>
            <input type="number" min={5} max={10} className="w-full mt-1 border rounded-lg p-2" value={days} onChange={e=>setDays(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-text-muted dark:text-dark-text-muted">Speed</label>
            <select className="w-full mt-1 border rounded-lg p-2" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>
              {SPEEDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex space-x-2">
            <button onClick={()=>setIsPlaying(p=>!p)} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white flex items-center justify-center space-x-2">
              {isPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
              <span>{isPlaying ? 'Pause' : 'Start'}</span>
            </button>
            <button onClick={reset} className="px-4 py-2 rounded-lg border flex items-center space-x-2">
              <RotateCcw className="w-4 h-4"/>
              <span>Reset</span>
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 shadow-card border border-border dark:border-dark-border">
        {/* Chart Type Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text">Live Price Chart</h3>
          <button
            onClick={() => setIsCandlestick(prev => !prev)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isCandlestick
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            {isCandlestick ? (
              <>
                <BarChart3 className="w-4 h-4" />
                <span>Candlestick</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Line Chart</span>
              </>
            )}
          </button>
        </div>

        <Plot
          data={[
            // Price trace - either candlestick or line
            isCandlestick ? {
              x: currentSlice.map(p => p.ts),
              open: currentSlice.map(p => p.open),
              high: currentSlice.map(p => p.high),
              low: currentSlice.map(p => p.low),
              close: currentSlice.map(p => p.close),
              type: 'candlestick',
              name: 'Price',
              increasing: { line: { color: '#16a34a' } },
              decreasing: { line: { color: '#dc2626' } }
            } : {
              x: currentSlice.map(p => p.ts),
              y: currentSlice.map(p => p.close),
              type: 'scatter',
              mode: 'lines',
              name: 'Close',
              line: { color: '#2563eb', width: 2 }
            },
            // Buy markers
            {
              x: buyMarkers.map(p => p.ts),
              y: buyMarkers.map(p => p.close),
              type: 'scatter',
              mode: 'markers',
              name: 'Buy',
              marker: { color: '#16a34a', size: 10, symbol: 'triangle-up' }
            },
            // Sell markers
            {
              x: sellMarkers.map(p => p.ts),
              y: sellMarkers.map(p => p.close),
              type: 'scatter',
              mode: 'markers',
              name: 'Sell',
              marker: { color: '#dc2626', size: 10, symbol: 'triangle-down' }
            },
          ]}
          layout={{
            autosize: true,
            height: 520,
            margin: { l: 50, r: 20, t: 20, b: 40 },
            showlegend: true,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            xaxis: { title: 'Time' },
            yaxis: { title: 'Price' },
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Recommendation Panel */}
      {pnl.total !== 0 && trades.length > 0 && (
        <div className={`rounded-2xl p-5 shadow-card border ${
          pnl.total >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {pnl.total >= 0 ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-2 ${pnl.total >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {pnl.total >= 0 ? '✅ Profitable Strategy' : '⚠️ Strategy Showing Losses'}
              </h3>
              <p className={`text-sm mb-3 ${pnl.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {pnl.total >= 0 ? (
                  <>
                    This strategy has generated a <strong>profit of ${pnl.total.toFixed(2)}</strong> on the simulated trades. 
                    The strategy is currently working well for <strong>{symbol}</strong>. You may consider following the signals.
                  </>
                ) : (
                  <>
                    This strategy has resulted in a <strong>loss of ${Math.abs(pnl.total).toFixed(2)}</strong> on the simulated trades. 
                    <strong className="block mt-2">⚠️ Not recommended to buy {symbol} using this strategy at this time.</strong> 
                    Consider trying a different strategy or waiting for better market conditions.
                  </>
                )}
              </p>
              <div className="text-xs space-y-1">
                <p className={pnl.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                  <strong>What this means:</strong> {pnl.total >= 0 
                    ? 'If you had followed these buy/sell signals in the past, you would have made money.'
                    : 'If you had followed these buy/sell signals in the past, you would have lost money.'}
                </p>
                {pnl.openTrades > 0 && (
                  <p className={pnl.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                    You currently have {pnl.openTrades} open position{pnl.openTrades > 1 ? 's' : ''} with ${pnl.open >= 0 ? '+' : ''}{pnl.open.toFixed(2)} unrealized profit/loss.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trading Signals & PnL Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-5 shadow-card border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-primary"/>
              <h3 className="font-semibold">Performance</h3>
            </div>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                <p className="font-semibold mb-1">Understanding Performance Metrics:</p>
                <p className="mb-2"><strong>Realized PnL:</strong> Profit/Loss from completed trades (bought and sold)</p>
                <p className="mb-2"><strong>Open PnL:</strong> Current profit/loss on positions still held</p>
                <p><strong>Total PnL:</strong> Combined profit/loss (Realized + Open)</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-green-50">
              <div className="flex items-center space-x-2 text-green-700"><TrendingUp className="w-4 h-4"/><span>Realized PnL</span></div>
              <div className="text-lg font-bold text-green-700">{pnl.realized.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center space-x-2 text-yellow-700"><Clock className="w-4 h-4"/><span>Open PnL</span></div>
              <div className="text-lg font-bold text-yellow-700">{pnl.open.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 text-blue-700"><Zap className="w-4 h-4"/><span>Total PnL</span></div>
              <div className={`text-lg font-bold ${pnl.total>=0?'text-blue-700':'text-red-700'}`}>{pnl.total.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2 text-gray-700"><Clock className="w-4 h-4"/><span>Open Trades</span></div>
              <div className="text-lg font-bold text-gray-700">{pnl.openTrades}</div>
            </div>
          </div>
        </div>

        {/* Open Trades */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-5 shadow-card border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Open Positions</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                <p className="font-semibold mb-1">What are Open Positions?</p>
                <p className="mb-2">These are stocks you've bought but haven't sold yet.</p>
                <p className="mb-2"><strong>Long 1 @ $XX:</strong> You bought 1 share at price $XX</p>
                <p><strong>Unrealized:</strong> How much profit/loss you have right now (not sold yet, so not final)</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {trades.filter(t => !t.exitDate).length === 0 ? (
              <p className="text-text-muted dark:text-dark-text-muted">No open positions</p>
            ) : (
              trades.filter(t => !t.exitDate).map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg border flex items-center justify-between">
                  <div>
                    <div className="font-medium">Long 1 @ {t.entryPrice.toFixed(2)}</div>
                    <div className="text-xs text-text-muted">{fmt(t.entryDate)}</div>
                  </div>
                  {currentSlice.length>0 && (
                    <div className="text-right">
                      <div className="text-xs">Unrealized</div>
                      <div className="font-semibold">{(currentSlice[currentSlice.length-1].close - t.entryPrice).toFixed(2)}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-5 shadow-card border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Trade History</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                <p className="font-semibold mb-1">Understanding Trade History:</p>
                <p className="mb-2"><strong>Entry:</strong> Price at which you bought the stock</p>
                <p className="mb-2"><strong>Exit:</strong> Price at which you sold the stock</p>
                <p className="mb-2"><strong>PnL (Profit & Loss):</strong> Exit price - Entry price</p>
                <p><strong>Green = Profit</strong>, <strong>Red = Loss</strong></p>
                <p className="mt-2 text-yellow-300">Trades marked "Open" are still active (not yet sold)</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm max-h-[260px] overflow-y-auto">
            {trades.length === 0 ? (
              <p className="text-text-muted dark:text-dark-text-muted">No trades yet</p>
            ) : (
              trades.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Long 1</div>
                    <div className="text-xs text-text-muted">{fmt(t.entryDate)}</div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs">Entry</div>
                    <div className="font-semibold">{t.entryPrice.toFixed(2)}</div>
                  </div>
                  {t.exitDate ? (
                    <>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs">Exit</div>
                        <div className="font-semibold">{t.exitPrice.toFixed(2)}</div>
                      </div>
                      <div className="text-xs text-text-muted">{fmt(t.exitDate)}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs">PnL</div>
                        <div className={`font-semibold ${t.exitPrice - t.entryPrice >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(t.exitPrice - t.entryPrice).toFixed(2)}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-text-muted mt-1">Open</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
