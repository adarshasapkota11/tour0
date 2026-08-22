import { describe, expect, it } from 'vitest'

import { extractError } from './errors'

describe('extractError', () => {
  it('returns detail from response', () => {
    const err = { response: { data: { detail: 'Booking not found.' } } }
    expect(extractError(err)).toBe('Booking not found.')
  })

  it('returns first field error', () => {
    const err = { response: { data: { travelers: ['Only 10 slots available.'] } } }
    expect(extractError(err)).toBe('Only 10 slots available.')
  })

  it('handles network errors', () => {
    expect(extractError({})).toBe('Network error. Please try again.')
    expect(extractError(undefined)).toBe('Network error. Please try again.')
  })

  it('falls back to generic message', () => {
    expect(extractError({ response: { data: {} } })).toBe('Something went wrong. Please try again.')
  })
})
