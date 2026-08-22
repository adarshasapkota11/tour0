import { Link } from 'react-router-dom'

import { useI18n } from '../i18n/index.jsx'
import InquiryWidget from './InquiryWidget'
import Logo from './Logo'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <span className="flex items-center gap-3">
              <Logo markClass="h-8 w-8" textClass="text-xl" />
            </span>
            <p className="text-sm leading-relaxed text-ink-muted">{t('footer.aboutText')}</p>
            <p className="text-sm text-ink-muted">{t('footer.madeForNepal')}</p>
          </div>

          <nav className="space-y-3" aria-label="Footer quick links">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/destinations" className="text-ink-muted hover:text-brand-600 hover:underline">
                  {t('nav.destinations')}
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-ink-muted hover:text-brand-600 hover:underline">
                  {t('nav.activities')}
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-ink-muted hover:text-brand-600 hover:underline">
                  {t('nav.myBookings')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-ink-muted hover:text-brand-600 hover:underline">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
              {t('footer.contactTitle')}
            </h3>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <svg className="w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h2.5a1 1 0 0 1 .9.55l1.2 2.4a1 1 0 0 1-.1 1.1L7.7 9.2a12 12 0 0 0 6.1 6.1l2.15-1.8a1 1 0 0 1 1.1-.1l2.4 1.2a1 1 0 0 1 .55.9V20a2 2 0 0 1-2 2H19A16 16 0 0 1 3 5Z" />
              </svg>
              <a
                href="tel:+9779848666317"
                aria-label={t('footer.phoneAria')}
                className="font-medium text-ink-subtle hover:text-brand-600 hover:underline"
              >
                +977 9848666317
              </a>
            </div>
            <p className="text-xs text-ink-faint">
              {t('footer.poweredBy')}{' '}
              <a
                href="https://aPrayogshala.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                aPrayogshala.com.np
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
              {t('footer.chatWithUs')}
            </h3>
            <p className="text-sm text-ink-muted">{t('footer.chatWithUsDesc')}</p>
            <InquiryWidget />
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-muted">
          <p>{t('footer.tagline', { year: new Date().getFullYear() })}</p>
          <Link to="/privacy" className="text-ink-muted hover:text-brand-600 hover:underline">
            {t('footer.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
