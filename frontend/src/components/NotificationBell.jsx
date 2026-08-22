import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotifications } from '../context/NotificationContext'
import { useI18n } from '../i18n/index.jsx'

function timeAgo(iso, lang) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(lang === 'ne' ? 'ne' : 'en', { numeric: 'auto' })
  if (seconds < 60) return formatter.format(-Math.max(1, seconds), 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return formatter.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return formatter.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 30) return formatter.format(-days, 'day')
  const months = Math.floor(days / 30)
  return formatter.format(-months, 'month')
}

export default function NotificationBell({ className = '' }) {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const { notifications, unreadCount, connected, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const handleOpen = (notification) => {
    markRead(notification.id)
    setOpen(false)
    if (notification.link) navigate(notification.link)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('notifications.toggle')}
        aria-expanded={open}
        className="relative p-2 text-ink-muted hover:text-brand-600 rounded-lg"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.66V5a2 2 0 1 0-4 0v.34A6 6 0 0 0 6 11v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card text-ink border border-line rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <p className="font-semibold">{t('notifications.title')}</p>
            {connected && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('notifications.live')}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-line">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-ink-faint">
                {t('notifications.empty')}
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-subtle transition-colors ${
                    notification.is_read ? 'opacity-70' : ''
                  }`}
                >
                  <p className="text-sm text-ink">{notification.text}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {timeAgo(notification.created_at, lang)}
                  </p>
                </button>
              ))
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="w-full px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-tint border-t border-line"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
