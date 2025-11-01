// Notification sound utility
export const playNotificationSound = (type = 'buy') => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Create oscillator
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different sounds for buy/sell
    if (type === 'buy') {
      // Ascending tone for buy
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
    } else {
      // Descending tone for sell
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime) // G5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.2) // C5
    }
    
    // Envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log('Could not play sound:', error)
  }
}

// Request browser notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.log('Notification permission error:', error)
      return false
    }
  }
  return Notification.permission === 'granted'
}

// Show browser notification
export const showBrowserNotification = (signal) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const isBuy = signal.type === 'BUY'
    const title = `${isBuy ? '📈' : '📉'} ${signal.type} Signal - ${signal.strategyName}`
    const body = `${signal.symbol} at $${signal.price.toFixed(2)}\nClick for more details`
    
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `signal-${signal.strategyId}-${signal.index}`,
      requireInteraction: false,
      silent: false
    })
    
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000)
    
    return notification
  }
  return null
}
