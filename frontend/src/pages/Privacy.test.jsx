import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Privacy from './Privacy.jsx'
import { I18nProvider } from '../i18n/index.jsx'

function renderPrivacy() {
  return render(
    <I18nProvider>
      <Privacy />
    </I18nProvider>,
  )
}

describe('Privacy', () => {
  it('renders the page title and subtitle', () => {
    renderPrivacy()
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeInTheDocument()
  })

  it('renders all policy sections', () => {
    renderPrivacy()
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(
      expect.arrayContaining([
        'What we collect',
        'How we use it',
        'Sharing',
        'Security',
        'Your rights',
        'Contact us',
      ]),
    )
  })
})
