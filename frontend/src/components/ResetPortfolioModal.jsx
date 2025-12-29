import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, IndianRupee, Loader2 } from 'lucide-react';

const ResetPortfolioModal = ({ isOpen, onClose, onReset, loading, isInitializing = false }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        onReset(numericAmount);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-bg-secondary w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-border dark:border-dark-border">
                {/* Header */}
                <div className={`p-6 border-b border-border dark:border-dark-border flex items-center justify-between ${isInitializing ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
                    <div className={`flex items-center space-x-3 ${isInitializing ? 'text-primary' : 'text-red-600'}`}>
                        <div className={`${isInitializing ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'} p-2 rounded-xl`}>
                            {isInitializing ? <IndianRupee className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">
                                {isInitializing ? 'Initialize Bank' : 'Reset Portfolio'}
                            </h2>
                            <p className="text-xs font-bold opacity-70">
                                {isInitializing ? 'SET YOUR STARTING MONEY' : 'START FRESH'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Warning Box (Only for Reset) */}
                    {!isInitializing && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                                Warning: This will permanently delete all your holdings and trade history. You cannot undo this action.
                            </div>
                        </div>
                    )}

                    {isInitializing && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-400 font-medium">
                                Welcome! Set your initial virtual balance to start paper trading.
                            </div>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                            {isInitializing ? 'Starting Capital (₹)' : 'New Starting Balance (₹)'}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                            <input
                                type="number"
                                autoFocus
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError('');
                                }}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg-elevated border border-border dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black dark:text-white text-lg"
                                placeholder="e.g. 10,00,000"
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-xs font-bold animate-shake">{error}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-text-muted dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className={`flex-1 ${isInitializing ? 'bg-primary hover:bg-primary-dark' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isInitializing ? <CheckCircle className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                    <span>{isInitializing ? 'INITIALIZE' : 'RESET NOW'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPortfolioModal;
