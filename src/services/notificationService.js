/**
 * Notification Service
 * 
 * This service handles all notification-related API calls.
 * Uses real API endpoints connected to MongoDB database.
 */

import api from './api';

/**
 * Fetch all notifications
 * @returns {Promise<Array>} Array of notifications
 */
export const fetchNotifications = async () => {
  try {
    const response = await api.notifications.getAll();
    return response.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    // Check if user is authenticated before making request
    const authService = (await import('./auth.service')).authService;
    if (!authService.isAuthenticated()) {
      return 0;
    }
    
    const response = await api.notifications.getUnreadCount();
    return response.count || 0;
  } catch (error) {
    // Silently return 0 for connection errors or auth errors
    const isConnectionError = error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('Connection') ||
      error.name === 'TypeError'
    );
    
    if (error.message && error.message.includes('401')) {
      return 0;
    }
    
    // Don't log connection errors - they're expected when backend is down
    if (!isConnectionError) {
      console.error('Error fetching unread count:', error);
    }
    
    return 0;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification
 * @returns {Promise<void>}
 */
export const markAsRead = async (notificationId) => {
  try {
    await api.notifications.markAsRead(notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export const markAllAsRead = async () => {
  try {
    await api.notifications.markAllAsRead();
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - ID of the notification
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await api.notifications.delete(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Setup WebSocket connection for real-time notifications
 * @param {Function} onNotification - Callback function when new notification arrives
 * @returns {Function} Function to close the WebSocket connection
 */
export const setupWebSocket = (onNotification) => {
  try {
    // TODO: Implement WebSocket for real-time notifications
    // For now, using polling (handled in NotificationDropdown component)
    console.log('WebSocket setup for notifications (using polling for now)');
    return () => {};
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    return () => {};
  }
}
