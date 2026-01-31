import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService'
import { toast } from '../services/toastService'

const NotificationDropdown = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
      // Set up polling for live notifications (every 30 seconds)
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications()
      setNotifications(data)
      
      // Update unread count
      const unread = data.filter((n) => !n.read).length
      if (onCountChange) {
        onCountChange(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      
      setNotifications((prev) => {
        const updated = prev.map((notif) => 
          (notif.id === id || notif._id === id) ? { ...notif, read: true } : notif
        )
        const unread = updated.filter((n) => !n.read).length
        if (onCountChange) {
          onCountChange(unread)
        }
        return updated
      })
      
      // Show toast notification
      const notification = notifications.find(n => n.id === id || n._id === id)
      if (notification) {
        toast.success('Notification Read', `Marked "${notification.title}" as read`)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Error', 'Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      
      setNotifications((prev) => {
        const updated = prev.map((notif) => ({ ...notif, read: true }))
        if (onCountChange) {
          onCountChange(0)
        }
        return updated
      })
      
      toast.success('All Notifications Read', 'All notifications have been marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Error', 'Failed to mark all notifications as read')
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id)
      
      setNotifications((prev) => {
        const updated = prev.filter((notif) => notif.id !== id && notif._id !== id)
        const unread = updated.filter((n) => !n.read).length
        if (onCountChange) {
          onCountChange(unread)
        }
        return updated
      })
      
      toast.info('Notification Deleted', 'Notification has been removed')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error', 'Failed to delete notification')
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[110]" style={{ right: '0' }}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-900 hover:text-primary-800 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id || notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id || notification._id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-900 rounded-full"></div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notification.id || notification._id)
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full text-sm text-primary-900 hover:text-primary-800 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
