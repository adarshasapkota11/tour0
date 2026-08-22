import { renderHook } from '@testing-library/react'
import { describe, expect, it, afterEach } from 'vitest'

import { usePageTitle } from './usePageTitle.js'

describe('usePageTitle', () => {
  afterEach(() => {
    document.title = 'TourNepal — Tours & Adventure in Nepal'
  })

  it('sets document.title with the provided title', () => {
    renderHook(() => usePageTitle('My Page'))
    expect(document.title).toBe('My Page · TourNepal')
  })

  it('sets the default title when no title is provided', () => {
    renderHook(() => usePageTitle(''))
    expect(document.title).toBe('TourNepal — Tours & Adventure in Nepal')
  })

  it('resets title on unmount', () => {
    const { unmount } = renderHook(() => usePageTitle('Temp'))
    expect(document.title).toBe('Temp · TourNepal')
    unmount()
    expect(document.title).toBe('TourNepal — Tours & Adventure in Nepal')
  })

  it('updates title when prop changes', () => {
    const { rerender } = renderHook(
      ({ title }) => usePageTitle(title),
      { initialProps: { title: 'First' } },
    )
    expect(document.title).toBe('First · TourNepal')
    rerender({ title: 'Second' })
    expect(document.title).toBe('Second · TourNepal')
  })
})
