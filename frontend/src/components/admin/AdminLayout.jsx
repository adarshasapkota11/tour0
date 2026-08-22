import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAdminInquiries } from '../../api/adminHooks'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext.jsx'
import Logo from '../Logo'
import NotificationBell from '../NotificationBell'
import ScrollToTop from '../ScrollToTop'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '📊' },
  { to: '/admin/destinations', label: 'Destinations', icon: '📍' },
  { to: '/admin/activities', label: 'Activities', icon: '🎿' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { to: '/admin/visit-packages', label: 'Visit packages', icon: '🎒' },
  { to: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { to: '/admin/payments', label: 'Payments', icon: '💳' },
  { to: '/admin/inquiries', label: 'Inquiries', icon: '💬', badge: 'inquiries' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
]

const desktopLink = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-tint text-brand-tint-fg' : 'text-ink-muted hover:bg-subtle hover:text-brand-600'
  }`

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const { data: openInquiries } = useAdminInquiries({ status: 'open', page_size: 1 })
  const openCount = openInquiries?.count || 0

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
  }

  return (
    <div className="min-h-screen flex bg-surface">
      <ScrollToTop />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-line transform transition-transform lg:sticky lg:top-0 lg:h-[100svh] lg:shrink-0 lg:flex lg:flex-col lg:translate-x-0 print:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-line">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-ink">
            <Logo markClass="h-6 w-6" textClass="text-lg" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLink} onClick={() => setOpen(false)}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge === 'inquiries' && openCount > 0 && (
                <span className="ml-1 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-brand-600 text-white text-xs font-semibold">
                  {openCount > 99 ? '99+' : openCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 p-3 border-t border-line space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-ink truncate">
              {user.full_name || user.email}
            </p>
            <p className="text-xs text-ink-muted">Content Manager</p>
          </div>
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:bg-subtle hover:text-brand-600"
          >
            ← View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:bg-subtle hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-nav backdrop-blur border-b border-line h-16 flex items-center gap-4 px-4 print:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle admin menu"
            className="lg:hidden p-2 text-ink-muted hover:text-brand-600 rounded-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-ink">Admin</h1>
          <NotificationBell className="ml-auto" />
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2 text-ink-muted hover:text-brand-600 rounded-lg"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </button>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>

        <footer className="border-t border-line px-4 py-4 text-center text-sm text-ink-faint print:hidden">
          Powered by{' '}
          <a
            href="https://aPrayogshala.com.np"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            aPrayogshala.com.np
          </a>
        </footer>
      </div>
    </div>
  )
}
