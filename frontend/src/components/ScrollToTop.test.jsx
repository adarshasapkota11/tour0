import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ScrollToTop from './ScrollToTop.jsx'

describe('ScrollToTop', () => {
  it('renders nothing (returns null)', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls scrollTo on mount', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo')
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    )
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0 })
    scrollToSpy.mockRestore()
  })
})
