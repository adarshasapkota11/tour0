import { test, expect } from './fixtures'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('home page has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast', 'aria-command-name'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('login page has no violations', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('activities page has no violations', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('admin dashboard has no violations', async ({ authedAdmin }) => {
    await authedAdmin.goto('/admin')
    await authedAdmin.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page: authedAdmin })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('keyboard navigation: tab through navbar links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const logo = page.locator('header a').first()
    await logo.focus()

    const navLinks = ['Home', 'Destinations', 'Activities']

    for (const label of navLinks) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      const text = await focused.textContent()
      expect(text?.trim()).toContain(label)
    }
  })

  test('focus management: Escape closes a modal', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('[class*="card"]').first()
    if (await firstCard.count() === 0) {
      test.skip()
      return
    }

    await firstCard.click()
    await page.waitForTimeout(500)

    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first()
    if (await modal.count() === 0) {
      test.skip()
      return
    }

    await expect(modal).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })
})
