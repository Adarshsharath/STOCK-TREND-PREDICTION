import React, { useState } from 'react'
import { Bell, X, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NotificationBell = ({ notifications, onClearAll, onRemove, onSelectNotification }) => {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.length

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white dark:bg-dark-bg-elevated rounded-full shadow-lg hover:shadow-xl dark:shadow-neon transition-all duration-200 border-2 border-primary dark:border-neon-purple hover:border-primary-dark dark:hover:border-neon-blue"
      >
        <Bell className="w-6 h-6 text-primary dark:text-neon-purple" />
        
        {/* Badge for unread count */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl border-2 border-gray-200 dark:border-dark-border z-50 max-h-[500px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-lg">Signal Notifications</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-dark-text-muted">
                <Bell className="w-16 h-16 mx-auto mb-3 opacity-30 dark:text-dark-text-muted" />
                <p className="font-medium dark:text-dark-text">No notifications yet</p>
                <p className="text-sm">Signals will appear here when detected</p>
              </div>
            ) : (
              <>
                {/* Clear All Button */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-dark-bg-elevated border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-text-secondary font-medium">
                    {unreadCount} {unreadCount === 1 ? 'notification' : 'notifications'}
                  </span>
                  <button
                    onClick={onClearAll}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-96">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-elevated cursor-pointer transition-colors ${
                        notification.type === 'BUY' ? 'border-l-4 border-l-green-500 dark:border-l-neon-green' : 'border-l-4 border-l-red-500 dark:border-l-neon-pink'
                      }`}
                      onClick={() => onSelectNotification(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'BUY' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {notification.type === 'BUY' ? (
                              <TrendingUp className="w-5 h-5 text-green-600 dark:text-neon-green" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600 dark:text-neon-pink" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900 dark:text-dark-text">
                              {notification.type} Signal
                            </p>
                            <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">
                              {notification.strategyName} • {notification.symbol}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-dark-text mt-1">
                              ${notification.price.toFixed(2)}
                            </p>
                            {notification.date && (
                              <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">
                                {new Date(notification.timestamp || Date.now()).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(notification.id)
                          }}
                          className="ml-2 text-gray-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell
