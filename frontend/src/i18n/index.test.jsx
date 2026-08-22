import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { I18nProvider, useI18n } from './index.jsx'

function Probe() {
  const { lang, setLang, t } = useI18n()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="label">{t('nav.home')}</span>
      <span data-testid="count">{t('cards.activityCount', { count: 3 })}</span>
      <span data-testid="missing">{t('nope.missing')}</span>
      <button onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}>switch</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <I18nProvider>
      <Probe />
    </I18nProvider>,
  )
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
  })

  afterEach(() => {
    document.documentElement.lang = 'en'
  })

  it('defaults to English and sets the document lang', () => {
    renderProbe()
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(screen.getByTestId('label').textContent).toBe('Home')
    expect(document.documentElement.lang).toBe('en')
  })

  it('interpolates params and switches to Nepali', async () => {
    const user = userEvent.setup()
    renderProbe()
    expect(screen.getByTestId('count').textContent).toBe('3 activities')

    await user.click(screen.getByRole('button', { name: 'switch' }))
    expect(screen.getByTestId('lang').textContent).toBe('ne')
    expect(screen.getByTestId('label').textContent).toBe('गृहपृष्ठ')
    expect(screen.getByTestId('count').textContent).toBe('३ गतिविधिहरू')
    expect(document.documentElement.lang).toBe('ne')
    expect(localStorage.getItem('nt_lang')).toBe('ne')
  })

  it('falls back to the key itself when a key is missing', () => {
    renderProbe()
    expect(screen.getByTestId('missing').textContent).toBe('nope.missing')
  })
})
