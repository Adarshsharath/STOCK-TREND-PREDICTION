import React, { useState, useEffect } from 'react'
import { X, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../config'

const TradeModal = ({ isOpen, onClose, symbol, currentPrice, prediction, onSuccess }) => {
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [balance, setBalance] = useState(0)
    const [fetchingBalance, setFetchingBalance] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchBalance()
        }
    }, [isOpen])

    const fetchBalance = async () => {
        setFetchingBalance(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${API_URL}/api/paper/balance`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBalance(res.data.balance)
        } catch (err) {
            console.error('Error fetching balance:', err)
        } finally {
            setFetchingBalance(false)
        }
    }

    const handleTrade = async (type) => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${API_URL}/api/paper/trade`, {
                symbol,
                type,
                quantity: parseInt(quantity),
                strategy: prediction?.modelName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            onSuccess?.(type, quantity, symbol)
            onClose()
        } catch (err) {
            console.error('Trade error:', err)
            setError(err.response?.data?.error || 'Failed to execute trade')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const totalCost = quantity * currentPrice

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-bg-secondary w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border dark:border-dark-border">
                {/* Header */}
                <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary p-2 rounded-xl">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text dark:text-dark-text">Paper Trade</h3>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted">Virtual Market Order</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-dark-bg-elevated p-4 rounded-2xl border border-border dark:border-dark-border">
                        <div>
                            <div className="text-sm font-bold text-text dark:text-dark-text">{symbol}</div>
                            <div className="text-xs text-text-muted dark:text-dark-text-muted">Current Price</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black text-primary">₹{currentPrice.toLocaleString('en-IN')}</div>
                            {prediction && (
                                <div className={`text-xs font-bold flex items-center justify-end ${prediction.direction === 'Bullish' ? 'text-green-600' : 'text-red-600'}`}>
                                    {prediction.direction === 'Bullish' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {prediction.direction} Signal
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-text-muted dark:text-dark-text-muted px-1">
                            <span>Quantity</span>
                            <span>Balance: ₹{balance.toLocaleString('en-IN')}</span>
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white dark:bg-dark-bg-elevated border border-border dark:border-dark-border rounded-xl px-5 py-4 text-xl font-black focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-muted dark:text-dark-text-muted">Total Estimated Value</span>
                            <span className="font-black text-text dark:text-dark-text">₹{totalCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-text-muted dark:text-dark-text-muted">Remaining Balance</span>
                            <span className={`font-bold ${balance - totalCost < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                ₹{(balance - totalCost).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleTrade('buy')}
                            disabled={loading || balance < totalCost}
                            className="bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>BUY CALL</span>}
                        </button>
                        <button
                            onClick={() => handleTrade('sell')}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>SELL PUT</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TradeModal
