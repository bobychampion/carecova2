/**
 * Notification Service
 * Manages user notifications
 * 
 * Future API endpoint: GET /api/notifications
 */

const NOTIFICATION_STORAGE_KEY = 'carecova_notifications'

const generateNotificationId = () => {
  return `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const getNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading notifications from localStorage:', error)
    return []
  }
}

const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error('Error saving notifications to localStorage:', error)
  }
}

export const notificationService = {
  /**
   * Create a notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  createNotification: async (notificationData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = getNotifications()
        const notification = {
          id: generateNotificationId(),
          userId: notificationData.userId,
          type: notificationData.type, // 'approval', 'payment', 'reminder', 'policy'
          title: notificationData.title,
          message: notificationData.message,
          read: false,
          createdAt: new Date().toISOString(),
          link: notificationData.link || null,
        }

        notifications.unshift(notification)
        saveNotifications(notifications)
        resolve(notification)
      }, 100)
    })
  },

  /**
   * Get notifications for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} Array of notifications
   */
  getNotifications: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = getNotifications()
        const userNotifications = notifications
          .filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        resolve(userNotifications)
      }, 100)
    })
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  markAsRead: async (notificationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = getNotifications()
        const notification = notifications.find((n) => n.id === notificationId)
        if (notification) {
          notification.read = true
          saveNotifications(notifications)
        }
        resolve()
      }, 100)
    })
  },

  /**
   * Mark all notifications as read
   * @param {string} userId - User identifier
   * @returns {Promise<void>}
   */
  markAllAsRead: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = getNotifications()
        notifications.forEach((n) => {
          if (n.userId === userId && !n.read) {
            n.read = true
          }
        })
        saveNotifications(notifications)
        resolve()
      }, 100)
    })
  },

  /**
   * Get unread count
   * @param {string} userId - User identifier
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = getNotifications()
        const unread = notifications.filter(
          (n) => n.userId === userId && !n.read
        ).length
        resolve(unread)
      }, 100)
    })
  },

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  deleteNotification: async (notificationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = getNotifications()
        const filtered = notifications.filter((n) => n.id !== notificationId)
        saveNotifications(filtered)
        resolve()
      }, 100)
    })
  },
}
