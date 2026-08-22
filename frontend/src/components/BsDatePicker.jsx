import { useState } from 'react'

import {
  bsMonthNames,
  bsMonthStartWeekday,
  bsToAdIso,
  daysInBsMonth,
  getTodayBsObj,
  toBs,
  toDevanagari,
} from '../utils/nepaliDate.js'

const WEEKDAYS = ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि']

export default function BsDatePicker({ value, minIso, onChange }) {
  const today = getTodayBsObj()
  const initial = value ? toBs(value) : today
  const [view, setView] = useState({ year: initial.year, month: initial.month })
  const [open, setOpen] = useState(false)

  const days = daysInBsMonth(view.year, view.month)
  const startDay = bsMonthStartWeekday(view.year, view.month)
  const minBs = minIso ? toBs(minIso) : null

  const isPast = (y, m, d) => {
    if (!minBs) return false
    const yc = y - minBs.year
    const mc = m - minBs.month
    const dc = d - minBs.day
    return yc < 0 || (yc === 0 && mc < 0) || (yc === 0 && mc === 0 && dc < 0)
  }

  const isSelected = (d) =>
    value && view.year === initial.year && view.month === initial.month && d === initial.day

  const select = (d) => {
    onChange(bsToAdIso({ year: view.year, month: view.month, day: d }))
    setOpen(false)
  }

  const shiftMonth = (delta) => {
    let m = view.month + delta
    let y = view.year
    if (m < 1) {
      m = 12
      y -= 1
    } else if (m > 12) {
      m = 1
      y += 1
    }
    setView({ year: y, month: m })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="field flex items-center justify-between text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>
          {value
            ? `${toDevanagari(initial.day)} ${bsMonthNames.ne[initial.month - 1]} ${toDevanagari(initial.year)}`
            : '—'}
        </span>
        <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-72 bg-card border border-line-strong rounded-2xl shadow-xl p-4" role="dialog">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="previous month"
              className="p-1.5 rounded-lg text-ink-muted hover:bg-subtle"
            >
              ‹
            </button>
            <p className="text-sm font-semibold text-ink">
              {bsMonthNames.ne[view.month - 1]} {toDevanagari(view.year)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="next month"
              className="p-1.5 rounded-lg text-ink-muted hover:bg-subtle"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ink-muted">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">{w}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1
              const past = isPast(view.year, view.month, d)
              const selected = isSelected(d)
              const isToday = view.year === today.year && view.month === today.month && d === today.day
              return (
                <button
                  key={d}
                  type="button"
                  disabled={past}
                  onClick={() => select(d)}
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                    past
                      ? 'text-ink-faint opacity-40 cursor-not-allowed'
                      : selected
                        ? 'bg-brand-600 text-white'
                        : isToday
                          ? 'bg-brand-tint text-brand-tint-fg'
                          : 'text-ink hover:bg-subtle'
                  }`}
                >
                  {toDevanagari(d)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
