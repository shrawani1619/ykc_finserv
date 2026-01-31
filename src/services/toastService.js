/**
 * Toast Notification Service
 * 
 * This service manages toast notifications that appear in the top-right corner
 */

let toastListeners = []
// Track recent notifications to prevent duplicates
const recentNotifications = new Map()
const NOTIFICATION_COOLDOWN = 2000 // 2 seconds cooldown

export const toast = {
  success: (title, message, duration = 5000) => {
    showToast({ type: 'success', title, message, duration })
  },
  error: (title, message, duration = 5000) => {
    showToast({ type: 'error', title, message, duration })
  },
  warning: (title, message, duration = 5000) => {
    showToast({ type: 'warning', title, message, duration })
  },
  info: (title, message, duration = 5000) => {
    showToast({ type: 'info', title, message, duration })
  },
}

const showToast = (notification) => {
  // Create a unique key for this notification
  const notificationKey = `${notification.type}_${notification.title}_${notification.message}`
  const now = Date.now()
  
  // Check if we've shown this notification recently
  const lastShown = recentNotifications.get(notificationKey)
  if (lastShown && (now - lastShown) < NOTIFICATION_COOLDOWN) {
    // Skip duplicate notification
    return
  }
  
  // Record this notification
  recentNotifications.set(notificationKey, now)
  
  // Clean up old entries periodically
  if (recentNotifications.size > 50) {
    const cutoff = now - NOTIFICATION_COOLDOWN * 10
    for (const [key, time] of recentNotifications.entries()) {
      if (time < cutoff) {
        recentNotifications.delete(key)
      }
    }
  }
  
  const id = Date.now() + Math.random()
  const toastNotification = { ...notification, id }
  
  toastListeners.forEach((listener) => listener(toastNotification))
}

export const subscribe = (listener) => {
  toastListeners.push(listener)
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener)
  }
}
