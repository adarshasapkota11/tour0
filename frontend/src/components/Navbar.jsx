import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import Logo from './Logo'
import NotificationBell from './NotificationBell'

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
    isActive ? 'text-brand-600' : 'text-ink-muted hover:text-brand-600'
  }`

const navItems = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/destinations', labelKey: 'nav.destinations' },
  { to: '/activities', labelKey: 'nav.activities' },
  { to: '/my-bookings', labelKey: 'nav.myBookings', authed: true },
  { to: '/admin', labelKey: 'nav.admin', staff: true },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggle } = useTheme()
  const { t, lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success(t('nav.loggedOut'))
  }

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-20 bg-nav backdrop-blur border-b border-line">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-ink" onClick={close}>
          <Logo markClass="h-7 w-7" textClass="text-xl" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems
            .filter((item) => !item.authed || isAuthenticated)
            .filter((item) => !item.staff || user?.is_staff)
            .map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {t(item.labelKey)}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggle}
            aria-label={t('nav.toggleTheme')}
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

          <button
            onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
            aria-label={t('nav.toggleLanguage')}
            className="px-2 py-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 rounded-lg border border-line-strong"
          >
            {lang === 'en' ? 'नेपाली' : 'EN'}
          </button>

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                to="/profile"
                className="hidden sm:block text-sm text-ink-muted hover:text-brand-600"
              >
                {user.full_name || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:block px-3 py-2 text-sm font-medium text-ink-muted hover:text-red-600 rounded-lg"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `hidden md:block px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive ? 'text-brand-600' : 'text-ink-muted hover:text-brand-600'
                  }`
                }
              >
                {t('nav.login')}
              </NavLink>
              <Link
                to="/register"
                className="hidden md:block px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                {t('nav.signup')}
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={t('nav.toggleMenu')}
            className="md:hidden p-2 text-ink-muted hover:text-brand-600 rounded-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-line bg-card px-4 py-3 space-y-1">
          {navItems
            .filter((item) => !item.authed || isAuthenticated)
            .filter((item) => !item.staff || user?.is_staff)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={close}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive ? 'text-brand-600 bg-brand-tint' : 'text-ink-muted hover:bg-subtle'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                to="/profile"
                onClick={close}
                className="block px-3 py-2 text-sm font-medium text-ink-muted hover:text-brand-600 rounded-lg"
              >
                {user.full_name || user.email}
              </Link>
              <button
                onClick={() => {
                  close()
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-ink-muted hover:text-red-600 rounded-lg"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="pt-1 space-y-1">
              <Link
                to="/login"
                onClick={close}
                className="block px-3 py-2 text-sm font-medium text-ink-muted hover:text-brand-600 rounded-lg"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={close}
                className="block px-3 py-2 text-sm font-semibold text-center text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                {t('nav.signup')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
