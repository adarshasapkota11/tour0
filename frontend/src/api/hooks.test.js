import { describe, expect, it } from 'vitest'

import { buildQuery } from './hooks.js'

describe('buildQuery', () => {
  it('returns an empty string when there are no params', () => {
    expect(buildQuery()).toBe('')
    expect(buildQuery({})).toBe('')
  })

  it('drops empty, undefined and null values', () => {
    expect(buildQuery({ category: '', destination: '', search: undefined })).toBe('')
    expect(buildQuery({ category: '', search: undefined, is_featured: 'true' })).toBe(
      '?is_featured=true',
    )
  })

  it('keeps real values', () => {
    expect(buildQuery({ is_featured: 'true', page_size: 6 })).toBe('?is_featured=true&page_size=6')
    expect(buildQuery({ search: 'paragliding', destination: 'pokhara' })).toBe(
      '?search=paragliding&destination=pokhara',
    )
  })
})
