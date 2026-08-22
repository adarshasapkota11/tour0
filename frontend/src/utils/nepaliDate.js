import {
  adToBs,
  bsToAd,
  toNepaliNumerals,
  getMonthData,
  getTodayBs,
  LOCALE,
} from 'nepali-date-utils'

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000

export function toDevanagari(value) {
  return toNepaliNumerals(value)
}

export function formatNum(n, lang) {
  const grouped = Number(n).toLocaleString('en-IN')
  return lang === 'ne' ? toDevanagari(grouped) : grouped
}

export function formatPrice(amount, lang) {
  const value = formatNum(amount, lang)
  return lang === 'ne' ? `रु ${value}` : `Rs ${value}`
}

function toDate(dateLike) {
  if (dateLike instanceof Date) return dateLike
  if (typeof dateLike === 'string') {
    const match = dateLike.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const [, y, m, d] = match.map(Number)
      return new Date(y, m - 1, d, 12)
    }
    return new Date(dateLike)
  }
  throw new Error('nepaliDate: unsupported date input')
}

export function toBs(dateLike) {
  const { year, month, day } = adToBs(toDate(dateLike))
  return { year, month, day }
}

const MONTH_NAMES = {
  en: LOCALE.en.monthLong,
  ne: LOCALE.np.monthLong,
}

export function formatDateBs(dateLike, lang = 'en') {
  const { year, month, day } = toBs(dateLike)
  if (lang === 'ne') {
    return `${toDevanagari(day)} ${MONTH_NAMES.ne[month - 1]} ${toDevanagari(year)}`
  }
  return `${day} ${MONTH_NAMES.en[month - 1]} ${year}`
}

export function bsToAdIso({ year, month, day }) {
  const shifted = new Date(bsToAd(year, month, day).getTime() + NEPAL_OFFSET_MS)
  return shifted.toISOString().slice(0, 10)
}

export function bsToWeekday({ year, month, day }) {
  const shifted = new Date(bsToAd(year, month, day).getTime() + NEPAL_OFFSET_MS)
  return shifted.getUTCDay()
}

export function daysInBsMonth(year, month) {
  return getMonthData(year, month).totalDays
}

export function bsMonthStartWeekday(year, month) {
  return getMonthData(year, month).startDay
}

export function getTodayBsObj() {
  const [year, month, day] = getTodayBs().split('-').map(Number)
  return { year, month, day }
}

export function getTodayAdIso() {
  return bsToAdIso(getTodayBsObj())
}

export const bsMonthNames = MONTH_NAMES
