import { useI18n } from '../i18n/index.jsx'

function pageItems(current, total) {
  const pages = []
  const range = (start, end) => {
    for (let i = start; i <= end; i += 1) pages.push(i)
  }
  if (total <= 7) {
    range(1, total)
  } else {
    range(1, 2)
    if (current > 4) pages.push('…')
    range(Math.max(3, current - 1), Math.min(total - 2, current + 1))
    if (current < total - 3) pages.push('…')
    range(total - 1, total)
  }
  return pages.filter((p, i) => p !== '…' || pages[i - 1] !== '…')
}

export default function Pagination({ count, page, pageSize = 12, onChange }) {
  const { t } = useI18n()
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  if (totalPages <= 1) return null

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    onChange(p)
  }

  const baseClass =
    'min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-lg text-sm font-medium border transition-colors'
  const idleClass = 'border-line bg-card text-ink hover:border-brand-400'
  const activeClass = 'border-brand-600 bg-brand-600 text-white'
  const disabledClass = 'border-line bg-card text-ink-faint cursor-not-allowed'

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label={t('pagination.page', { page: `${page}` })}
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label={t('pagination.previous')}
        className={`${baseClass} ${page <= 1 ? disabledClass : idleClass}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === '…' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-ink-faint" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-label={t('pagination.page', { page: `${item}` })}
            aria-current={item === page ? 'page' : undefined}
            className={`${baseClass} ${item === page ? activeClass : idleClass}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label={t('pagination.next')}
        className={`${baseClass} ${page >= totalPages ? disabledClass : idleClass}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}
