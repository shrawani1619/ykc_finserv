import { useState, useEffect, useRef } from 'react'
import { Bell, Check, X } from 'lucide-react'
import api from '../services/api'

const NotificationDropdown = ({ isOpen, onClose, unreadCount, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // Try to fetch notifications from API if endpoint exists
      try {
        const response = await api.notifications?.getAll?.() || { data: [] }
        const data = response.data || response || []
        setNotifications(Array.isArray(data) ? data : [])
        
        // Update unread count
        const unread = data.filter(n => !n.read).length
        if (setUnreadCount) {
          setUnreadCount(unread)
        }
      } catch (error) {
        // Silently handle 404 or API not available - this is expected if backend doesn't have notifications yet
        if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
          // API endpoint doesn't exist yet, which is fine
          setNotifications([])
          if (setUnreadCount) {
            setUnreadCount(0)
          }
        } else {
          // Other errors - log but don't show to user
          console.log('Notification API not available:', error.message)
          setNotifications([])
        }
      }
    } catch (error) {
      // Fallback error handling
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      // Try to mark notification as read if API exists
      if (api.notifications?.markAsRead) {
        try {
          await api.notifications.markAsRead(notificationId)
        } catch (error) {
          // Silently ignore 404 errors - API might not be implemented yet
          if (!error.message?.includes('404') && !error.message?.includes('Not Found')) {
            console.log('Error marking notification as read:', error.message)
          }
        }
      }
      
      // Update local state regardless of API call success
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId || n.id === notificationId
            ? { ...n, read: true }
            : n
        )
      )
      
      // Update unread count
      if (setUnreadCount) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      // Fallback - still update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId || n.id === notificationId
            ? { ...n, read: true }
            : n
        )
      )
      if (setUnreadCount) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      // Try to mark all as read if API exists
      if (api.notifications?.markAllAsRead) {
        try {
          await api.notifications.markAllAsRead()
        } catch (error) {
          // Silently ignore 404 errors - API might not be implemented yet
          if (!error.message?.includes('404') && !error.message?.includes('Not Found')) {
            console.log('Error marking all notifications as read:', error.message)
          }
        }
      }
      
      // Update local state regardless of API call success
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      
      // Update unread count
      if (setUnreadCount) {
        setUnreadCount(0)
      }
    } catch (error) {
      // Fallback - still update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      if (setUnreadCount) {
        setUnreadCount(0)
      }
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Try to delete notification if API exists
      if (api.notifications?.delete) {
        try {
          await api.notifications.delete(notificationId)
        } catch (error) {
          // Silently ignore 404 errors - API might not be implemented yet
          if (!error.message?.includes('404') && !error.message?.includes('Not Found')) {
            console.log('Error deleting notification:', error.message)
          }
        }
      }
      
      // Update local state regardless of API call success
      const notification = notifications.find(n => n._id === notificationId || n.id === notificationId)
      const wasUnread = notification && !notification.read
      
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId && n.id !== notificationId)
      )
      
      // Update unread count if deleted notification was unread
      if (wasUnread && setUnreadCount) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      // Fallback - still update local state
      const notification = notifications.find(n => n._id === notificationId || n.id === notificationId)
      const wasUnread = notification && !notification.read
      
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId && n.id !== notificationId)
      )
      
      if (wasUnread && setUnreadCount) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[120] max-h-96 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-900 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary-900 hover:text-primary-800 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-900 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const isUnread = !notification.read
              return (
                <div
                  key={notification._id || notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    isUnread ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title || notification.message || 'Notification'}
                      </p>
                      {notification.message && notification.title && (
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      )}
                      {notification.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isUnread && (
                        <button
                          onClick={() => markAsRead(notification._id || notification.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id || notification.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Delete"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 text-center">
          <button
            onClick={onClose}
            className="text-xs text-primary-900 hover:text-primary-800 font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown

