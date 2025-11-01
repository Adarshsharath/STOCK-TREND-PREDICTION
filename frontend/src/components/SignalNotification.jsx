import React, { useEffect } from 'react'
import { TrendingUp, TrendingDown, X, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SignalNotification = ({ signal, onClose, onMoreInfo }) => {
  const isBuy = signal.type === 'BUY'

  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed right-6 top-24 z-50 w-80 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl border-2 ${
        isBuy ? 'border-green-500 dark:border-neon-green' : 'border-red-500 dark:border-neon-pink'
      } overflow-hidden`}
    >
      {/* Header */}
      <div className={`${isBuy ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          {isBuy ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
          <span className="font-bold text-lg">
            {isBuy ? 'BUY' : 'SELL'} Signal Detected!
          </span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 bg-white dark:bg-dark-bg-card">
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-dark-text-muted mb-1">Strategy</p>
          <p className="font-semibold text-gray-900 dark:text-white">{signal.strategyName}</p>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-dark-text-muted mb-1">Stock Symbol</p>
          <p className="font-semibold text-gray-900 dark:text-white">{signal.symbol}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-dark-text-muted mb-1">Price</p>
          <p className="font-bold text-xl text-gray-900 dark:text-white">${signal.price.toFixed(2)}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={onMoreInfo}
          className={`w-full ${
            isBuy ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          } text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center space-x-2`}
        >
          <Info className="w-4 h-4" />
          <span>More Info</span>
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 3, ease: 'linear' }}
        className={`h-1 ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}
      />
    </motion.div>
  )
}

const SignalNotificationContainer = ({ notifications, onClose, onMoreInfo }) => {
  return (
    <div className="fixed right-0 top-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <div key={notification.id} style={{ marginTop: index * 10 }}>
              <SignalNotification
                signal={notification}
                onClose={() => onClose(notification.id)}
                onMoreInfo={() => onMoreInfo(notification)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SignalNotificationContainer
