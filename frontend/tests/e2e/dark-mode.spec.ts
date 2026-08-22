import { test, expect } from './fixtures'

test.describe('Dark mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('nt_theme')
      document.documentElement.classList.remove('dark')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('toggle dark mode adds dark class to html', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /Toggle theme/i })

    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await toggleBtn.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('toggle back removes dark class', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /Toggle theme/i })

    await toggleBtn.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await toggleBtn.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('dark mode persists after page reload', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /Toggle theme/i })
    await toggleBtn.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('background colors change in dark mode', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /Toggle theme/i })
    await toggleBtn.click()

    const html = page.locator('html')
    const colorScheme = await html.evaluate((el) => getComputedStyle(el).colorScheme)
    expect(colorScheme).toBe('dark')

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    )
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
