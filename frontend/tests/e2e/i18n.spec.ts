import { test, expect } from './fixtures'

test.describe('Internationalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('nt_lang'))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('home page loads in English by default', async ({ page }) => {
    const lang = await page.evaluate(() => document.documentElement.lang)
    expect(lang).toBe('en')

    await expect(page.locator('header')).toContainText('Destinations')
    await expect(page.locator('header')).toContainText('Activities')
  })

  test('toggle language to Nepali and content changes', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: /Switch language/i })
    await expect(langBtn).toContainText('नेपाली')

    await langBtn.click()

    const langBtnNepali = page.getByRole('button', { name: /भाषा बदल्नुहोस्|Switch language/i })
    await expect(langBtnNepali).toContainText('EN')
    await expect(page.locator('header')).toContainText('गन्तव्यहरू')
    await expect(page.locator('header')).toContainText('गतिविधिहरू')

    const lang = await page.evaluate(() => document.documentElement.lang)
    expect(lang).toBe('ne')
  })

  test('toggle back to English and content reverts', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: /Switch language/i })

    await langBtn.click()

    const langBtnNepali = page.getByRole('button', { name: /भाषा बदल्नुहोस्|Switch language/i })
    await expect(langBtnNepali).toContainText('EN')
    await expect(page.locator('header')).toContainText('गन्तव्यहरू')

    await langBtnNepali.click()

    const langBtnBack = page.getByRole('button', { name: /Switch language|भाषा बदल्नुहोस्/i })
    await expect(langBtnBack).toContainText('नेपाली')
    await expect(page.locator('header')).toContainText('Destinations')
    await expect(page.locator('header')).toContainText('Activities')

    const lang = await page.evaluate(() => document.documentElement.lang)
    expect(lang).toBe('en')
  })

  test('language persists after page reload', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: /Switch language/i })
    await langBtn.click()

    const langBtnNepali = page.getByRole('button', { name: /भाषा बदल्नुहोस्|Switch language/i })
    await expect(langBtnNepali).toContainText('EN')

    await page.reload()
    await page.waitForLoadState('networkidle')

    const langBtnAfter = page.getByRole('button', { name: /Switch language|भाषा बदल्नुहोस्/i })
    await expect(langBtnAfter).toContainText('EN')
    await expect(page.locator('header')).toContainText('गन्तव्यहरू')

    const lang = await page.evaluate(() => document.documentElement.lang)
    expect(lang).toBe('ne')
  })
})
