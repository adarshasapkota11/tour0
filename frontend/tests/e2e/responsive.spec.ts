import { test, expect } from './fixtures'

test.describe('Responsive design', () => {
  test.describe('Mobile (375px)', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('hamburger menu is visible on mobile', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const hamburger = page.getByRole('button', { name: /Toggle menu/i })
      await expect(hamburger).toBeVisible()

      const desktopNav = page.locator('header .hidden.md\\:flex')
      await expect(desktopNav).not.toBeVisible()
    })

    test('clicking hamburger opens mobile menu', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const hamburger = page.getByRole('button', { name: /Toggle menu/i })
      await hamburger.click()

      const mobileMenu = page.locator('header .md\\:hidden').filter({ hasText: /Destinations|गन्तव्यहरू/ })
      await expect(mobileMenu).toBeVisible()
    })

    test('card grid is single column on mobile', async ({ page }) => {
      await page.goto('/destinations')
      await page.waitForLoadState('networkidle')

      const grid = page.locator('.grid').first()
      const columns = await grid.evaluate((el) => {
        const style = getComputedStyle(el)
        return style.gridTemplateColumns
      })

      expect(columns.split(' ').length).toBeLessThanOrEqual(2)
    })
  })

  test.describe('Tablet (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('multi-column layout on tablet', async ({ page }) => {
      await page.goto('/destinations')
      await page.waitForLoadState('networkidle')

      const grid = page.locator('.grid').first()
      const columns = await grid.evaluate((el) => {
        const style = getComputedStyle(el)
        return style.gridTemplateColumns
      })

      const colCount = columns.split(' ').filter((c) => c !== '0px').length
      expect(colCount).toBeGreaterThanOrEqual(2)
    })

    test('desktop nav is visible on tablet', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const desktopNav = page.locator('header .hidden.md\\:flex')
      await expect(desktopNav).toBeVisible()
    })
  })

  test.describe('Desktop (1280px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('full layout with wider content area', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const header = page.locator('header')
      await expect(header).toBeVisible()

      const desktopNav = page.locator('header .hidden.md\\:flex')
      await expect(desktopNav).toBeVisible()

      const signupBtn = page.getByRole('link', { name: /Sign up|साइन अप/i })
      await expect(signupBtn).toBeVisible()
    })

    test('admin dashboard shows sidebar on desktop', async ({ authedAdmin }) => {
      await authedAdmin.goto('/admin')
      await authedAdmin.waitForLoadState('networkidle')

      const sidebar = authedAdmin.locator('aside, nav').filter({ hasText: /Dashboard|Admin|प्रशासन/ }).first()
      await expect(sidebar).toBeVisible()
    })
  })
})
