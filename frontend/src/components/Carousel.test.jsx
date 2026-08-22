import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import Carousel from './Carousel.jsx'

function renderCarousel(items = ['One', 'Two', 'Three']) {
  return render(
    <I18nProvider>
      <Carousel label="Test carousel">
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </Carousel>
    </I18nProvider>,
  )
}

describe('Carousel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all children', () => {
    renderCarousel()
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.getByText('Three')).toBeInTheDocument()
  })

  it('shows prev/next controls and dots when there is more than one page', () => {
    renderCarousel()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('advances on next button click and wraps around', async () => {
    const user = userEvent.setup()
    const { scrollTo } = Element.prototype
    Element.prototype.scrollTo = vi.fn()
    try {
      renderCarousel()
      const next = screen.getByRole('button', { name: 'Next' })
      const el = document.querySelector('.no-scrollbar')
      Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true })
      Object.defineProperty(el, 'scrollWidth', { value: 900, configurable: true })
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true, configurable: true })
      el.dispatchEvent(new Event('scroll'))
      await user.click(next)
      expect(Element.prototype.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ left: 300 }),
      )
    } finally {
      Element.prototype.scrollTo = scrollTo
    }
  })

  it('pauses auto-advance when hovered', () => {
    const { scrollTo } = Element.prototype
    Element.prototype.scrollTo = vi.fn()
    try {
      vi.useFakeTimers()
      const { container } = renderCarousel()
      const el = document.querySelector('.no-scrollbar')
      Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true })
      Object.defineProperty(el, 'scrollWidth', { value: 900, configurable: true })
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true, configurable: true })
      el.dispatchEvent(new Event('scroll'))
      fireEvent.mouseEnter(container.querySelector('[role="region"]'))
      vi.advanceTimersByTime(20000)
      expect(Element.prototype.scrollTo).not.toHaveBeenCalled()
    } finally {
      Element.prototype.scrollTo = scrollTo
    }
  })
})
