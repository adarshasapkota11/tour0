import { useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '../i18n/index.jsx'

export default function Carousel({
  children,
  interval = 4000,
  itemClassName = 'w-72 sm:w-80 lg:w-[22rem]',
  label,
}) {
  const { t } = useI18n()
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  const measure = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const firstW = el.children[0]?.clientWidth || el.clientWidth
    const per = firstW > 0 ? Math.max(1, Math.round(el.clientWidth / firstW)) : 1
    const count = Math.max(1, Math.ceil(el.children.length / per))
    setPageCount(count)
  }, [])

  useEffect(() => {
    measure()
    const onResize = () => {
      measure()
      setPage(0)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  const scrollToPage = useCallback((index) => {
    const el = trackRef.current
    if (!el) return
    const target = index < 0 ? el.scrollWidth - el.clientWidth : index * el.clientWidth
    el.scrollTo({ left: target, behavior: 'smooth' })
  }, [])

  const next = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const last = Math.max(0, Math.ceil(el.scrollLeft / el.clientWidth))
    if (last >= pageCount - 1) scrollToPage(0)
    else scrollToPage(last + 1)
  }, [pageCount, scrollToPage])

  const prev = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const current = Math.round(el.scrollLeft / el.clientWidth)
    if (current <= 0) scrollToPage(pageCount - 1)
    else scrollToPage(current - 1)
  }, [pageCount, scrollToPage])

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setPage(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  useEffect(() => {
    if (paused || pageCount <= 1) return undefined
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [paused, pageCount, interval, next])

  const items = Array.isArray(children) ? children : [children]

  return (
    <div
      role="region"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory gap-4 py-2"
        >
          {items.map((child, index) => (
            <div key={child.key ?? index} className={`snap-start shrink-0 ${itemClassName}`}>
              {child}
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label={t('carousel.previous')}
            className="absolute top-1/2 -left-2 -translate-y-1/2 p-2 bg-card border border-line text-ink rounded-full shadow-lg hover:bg-subtle transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {pageCount > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label={t('carousel.next')}
            className="absolute top-1/2 -right-2 -translate-y-1/2 p-2 bg-card border border-line text-ink rounded-full shadow-lg hover:bg-subtle transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: pageCount }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === page ? 'w-5 bg-brand-600' : 'w-1.5 bg-line-strong'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
