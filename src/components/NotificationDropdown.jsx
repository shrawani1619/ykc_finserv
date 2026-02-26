import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, X, Image as ImageIcon } from 'lucide-react'
import api from '../services/api'
import Modal from './Modal'
import StatusBadge from './StatusBadge'

const NotificationDropdown = ({ isOpen, onClose, unreadCount, setUnreadCount }) => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [notifRes, countRes] = await Promise.all([
        api.notifications?.getAll?.() || { data: [] },
        api.notifications?.getUnreadCount?.().catch(() => ({ data: { count: 0 } })),
      ])
      const data = notifRes.data || notifRes || []
      setNotifications(Array.isArray(data) ? data : [])
      const count = countRes?.data?.count ?? data.filter(n => !(n.isRead ?? n.read)).length
      if (setUnreadCount) setUnreadCount(count)
    } catch (error) {
      setNotifications([])
      if (setUnreadCount) setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId, redirectTicketId, bannerId) => {
    try {
      if (api.notifications?.markAsRead) {
        await api.notifications.markAsRead(notificationId)
      }
      setNotifications(prev =>
        prev.map(n =>
          (n._id === notificationId || n.id === notificationId)
            ? { ...n, isRead: true, read: true }
            : n
        )
      )
      if (setUnreadCount) setUnreadCount((prev) => Math.max(0, prev - 1))
      if (redirectTicketId) {
        onClose?.()
        navigate('/tickets', { state: { openTicketId: redirectTicketId } })
      } else if (bannerId) {
        // Fetch banner details and show modal
        try {
          const bannerResponse = await api.banners.getById(bannerId)
          const banner = bannerResponse.data || bannerResponse
          setSelectedBanner(banner)
          setIsBannerModalOpen(true)
          onClose?.()
        } catch (error) {
          console.error('Error fetching banner:', error)
        }
      }
    } catch (err) {
      setNotifications(prev =>
        prev.map(n =>
          (n._id === notificationId || n.id === notificationId)
            ? { ...n, isRead: true, read: true }
            : n
        )
      )
      if (setUnreadCount) setUnreadCount((prev) => Math.max(0, prev - 1))
      if (redirectTicketId) {
        onClose?.()
        navigate('/tickets', { state: { openTicketId: redirectTicketId } })
      } else if (bannerId) {
        // Fetch banner details and show modal
        try {
          const bannerResponse = await api.banners.getById(bannerId)
          const banner = bannerResponse.data || bannerResponse
          setSelectedBanner(banner)
          setIsBannerModalOpen(true)
          onClose?.()
        } catch (error) {
          console.error('Error fetching banner:', error)
        }
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      if (api.notifications?.markAllAsRead) await api.notifications.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })))
      if (setUnreadCount) setUnreadCount(0)
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })))
      if (setUnreadCount) setUnreadCount(0)
    }
  }

  const deleteNotification = async (e, notificationId) => {
    e?.stopPropagation?.()
    const notification = notifications.find(n => n._id === notificationId || n.id === notificationId)
    const wasUnread = notification && !(notification.isRead ?? notification.read)
    try {
      if (api.notifications?.delete) await api.notifications.delete(notificationId)
    } catch {}
    setNotifications(prev => prev.filter(n => n._id !== notificationId && n.id !== notificationId))
    if (wasUnread && setUnreadCount) setUnreadCount((prev) => Math.max(0, prev - 1))
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
              const isUnread = !(notification.isRead ?? notification.read)
              const ticketId = notification.relatedTicketId?._id || notification.relatedTicketId
              const bannerId = notification.relatedBannerId?._id || notification.relatedBannerId
              const isBannerNotification = notification.type === 'banner_created' || !!bannerId
              return (
                <div
                  key={notification._id || notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isUnread ? 'bg-blue-50/50' : ''
                  } ${ticketId || bannerId ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (ticketId) {
                      markAsRead(notification._id || notification.id, ticketId)
                    } else if (bannerId) {
                      markAsRead(notification._id || notification.id, null, bannerId)
                    } else {
                      markAsRead(notification._id || notification.id)
                    }
                  }}
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
                      {ticketId && (
                        <p className="text-xs text-primary-900 mt-1 font-medium">Click to view service request →</p>
                      )}
                      {isBannerNotification && (
                        <p className="text-xs text-primary-900 mt-1 font-medium">Click to view banner details →</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification._id || notification.id)
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotification(e, notification._id || notification.id)}
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

      {/* Banner Details Modal */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false)
          setSelectedBanner(null)
        }}
        title="Banner Details"
        size="md"
      >
        {selectedBanner && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Banner Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBanner.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedBanner.status} />
                </div>
              </div>
            </div>

            {selectedBanner.attachment && (
              <div>
                <label className="text-sm font-medium text-gray-500">Banner Image</label>
                <div className="mt-2">
                  <img
                    src={selectedBanner.attachment}
                    alt={selectedBanner.name}
                    className="w-full max-w-md rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg border border-gray-200 hidden items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NotificationDropdown

