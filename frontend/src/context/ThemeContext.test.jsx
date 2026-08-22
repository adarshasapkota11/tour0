import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ThemeProvider, useTheme } from './ThemeContext.jsx'

function Probe() {
  const { theme, toggle, isDark } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="is-dark">{String(isDark)}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('defaults to light and applies the light scheme', () => {
    renderProbe()
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('is-dark').textContent).toBe('false')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles to dark, updates the class and persists the choice', async () => {
    const user = userEvent.setup()
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('is-dark').textContent).toBe('true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('nt_theme')).toBe('dark')
  })

  it('respects a stored dark preference', () => {
    localStorage.setItem('nt_theme', 'dark')
    renderProbe()
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })
})
