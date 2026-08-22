import { describe, expect, it } from 'vitest'

import {
  bsMonthStartWeekday,
  bsToAdIso,
  bsToWeekday,
  daysInBsMonth,
  formatDateBs,
  formatNum,
  formatPrice,
  getTodayAdIso,
  getTodayBsObj,
  toBs,
} from './nepaliDate.js'

describe('nepaliDate utils', () => {
  it('converts AD ISO to BS calendar parts', () => {
    expect(toBs('2025-04-14')).toEqual({ year: 2082, month: 1, day: 1 })
    expect(toBs(new Date('2025-04-14'))).toEqual({ year: 2082, month: 1, day: 1 })
  })

  it('converts BS calendar parts back to AD ISO', () => {
    expect(bsToAdIso({ year: 2082, month: 1, day: 1 })).toBe('2025-04-14')
    expect(bsToAdIso({ year: 2082, month: 1, day: 15 })).toBe('2025-04-28')
  })

  it('formats BS dates with localized month names and digits', () => {
    expect(formatDateBs('2025-04-14', 'en')).toBe('1 Baisakh 2082')
    expect(formatDateBs('2025-04-14', 'ne')).toBe('१ बैशाख २०८२')
    expect(formatDateBs('2025-04-28', 'en')).toBe('15 Baisakh 2082')
  })

  it('formats numbers with Indian grouping and Devanagari digits', () => {
    expect(formatNum(7500, 'en')).toBe('7,500')
    expect(formatNum(22, 'en')).toBe('22')
    expect(formatNum(15000, 'ne')).toBe('१५,०००')
    expect(formatNum(7, 'ne')).toBe('७')
  })

  it('formats prices with currency prefix', () => {
    expect(formatPrice(7500, 'en')).toBe('Rs 7,500')
    expect(formatPrice(7500, 'ne')).toBe('रु ७,५००')
  })

  it('reports month lengths and starting weekdays from the BS calendar', () => {
    expect(daysInBsMonth(2082, 1)).toBe(31)
    expect(bsMonthStartWeekday(2082, 1)).toBe(1)
    expect(bsToWeekday({ year: 2082, month: 1, day: 15 })).toBe(1)
  })

  it('provides a consistent Nepal "today" in AD and BS', () => {
    const todayBs = getTodayBsObj()
    const todayAd = getTodayAdIso()
    expect(String(todayAd)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(bsToAdIso(todayBs)).toBe(todayAd)
  })
})
