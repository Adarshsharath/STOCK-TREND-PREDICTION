import React, { useEffect, useMemo, useRef, useState } from 'react'
import Plot from 'react-plotly.js'
import axios from 'axios'
import { Play, Pause, RotateCcw, Zap, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

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
        const d = (res.data?.data || []).sort((a,b)=> new Date(a.date) - new Date(b.date))
        setData(d)
        setBuySignals(res.data?.buy_signals || [])
        setSellSignals(res.data?.sell_signals || [])
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
    const dateStr = lastPoint.date

    const isBuy = buySignals.some(s => s.date === dateStr)
    const isSell = sellSignals.some(s => s.date === dateStr)

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

  const buyMarkers = useMemo(() => currentSlice.filter(p => buySignals.some(s => s.date === p.date)), [currentSlice, buySignals])
  const sellMarkers = useMemo(() => currentSlice.filter(p => sellSignals.some(s => s.date === p.date)), [currentSlice, sellSignals])

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
        <Plot
          data={[
            {
              x: currentSlice.map(p => p.date),
              y: currentSlice.map(p => p.close),
              type: 'scatter',
              mode: 'lines',
              name: 'Close',
              line: { color: '#2563eb', width: 2 },
            },
            // Buy markers
            {
              x: buyMarkers.map(p => p.date),
              y: buyMarkers.map(p => p.close),
              type: 'scatter',
              mode: 'markers',
              name: 'Buy',
              marker: { color: '#16a34a', size: 10, symbol: 'triangle-up' }
            },
            // Sell markers
            {
              x: sellMarkers.map(p => p.date),
              y: sellMarkers.map(p => p.close),
              type: 'scatter',
              mode: 'markers',
              name: 'Sell',
              marker: { color: '#dc2626', size: 10, symbol: 'triangle-down' }
            },
          ]}
          layout={{
            autosize: true,
            height: 480,
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

      {/* Trading Signals & PnL Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-5 shadow-card border border-border dark:border-dark-border">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary"/>
            <h3 className="font-semibold">Performance</h3>
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
          <h3 className="font-semibold mb-3">Open Positions</h3>
          <div className="space-y-2 text-sm">
            {trades.filter(t => !t.exitDate).length === 0 ? (
              <p className="text-text-muted dark:text-dark-text-muted">No open positions</p>
            ) : (
              trades.filter(t => !t.exitDate).map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg border flex items-center justify-between">
                  <div>
                    <div className="font-medium">Long 1 @ {t.entryPrice.toFixed(2)}</div>
                    <div className="text-xs text-text-muted">{t.entryDate}</div>
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
          <h3 className="font-semibold mb-3">Trade History</h3>
          <div className="space-y-2 text-sm max-h-[260px] overflow-y-auto">
            {trades.length === 0 ? (
              <p className="text-text-muted dark:text-dark-text-muted">No trades yet</p>
            ) : (
              trades.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Long 1</div>
                    <div className="text-xs text-text-muted">{t.entryDate}</div>
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
