import { useState, useEffect } from 'react'
import NotificationCenter from './NotificationCenter'
import { notificationService } from '../services/notificationService'

export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (userId) {
      const loadUnreadCount = async () => {
        const count = await notificationService.getUnreadCount(userId)
        setUnreadCount(count)
      }
      loadUnreadCount()

      // Poll for updates every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  if (!userId) return null

  return (
    <>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="notification-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell-badge">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <NotificationCenter
          userId={userId}
          onClose={() => setIsOpen(false)}
          onUnreadChange={setUnreadCount}
        />
      )}
    </>
  )
}
