import { test, expect } from './fixtures'

test.describe('Public pages', () => {
  test('home page loads with hero, destination cards, and activity cards', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Explore Nepal,')).toBeVisible()
    await expect(page.getByText('your way')).toBeVisible()

    await expect(page.getByText('Popular destinations')).toBeVisible()
    await expect(page.getByText('Featured adventures')).toBeVisible()
  })

  test('navigate to /destinations shows destination list', async ({ page }) => {
    await page.goto('/destinations')

    await expect(page.getByText('Explore destinations')).toBeVisible()
    await expect(page.getByText('Kathmandu')).toBeVisible()
  })

  test('navigate to /activities shows activity list', async ({ page }) => {
    await page.goto('/activities')

    await expect(page.getByText('Explore activities')).toBeVisible()
    await expect(page.getByText('Tandem Paragliding')).toBeVisible()
  })

  test('navigate to /search shows search input', async ({ page }) => {
    await page.goto('/search')

    await expect(page.getByText('Search Nepal')).toBeVisible()
  })

  test('navigate to /privacy shows privacy content', async ({ page }) => {
    await page.goto('/privacy')

    await expect(page.getByRole('heading', { name: 'Privacy policy' })).toBeVisible()
    await expect(page.getByText('How TourNepal collects, uses and protects your information.')).toBeVisible()
  })

  test('click destination card navigates to detail page', async ({ page }) => {
    await page.goto('/destinations')

    const card = page.getByText('Kathmandu').first()
    await card.click()

    await expect(page).toHaveURL(/\/destinations\//)
    await expect(page.getByText('About')).toBeVisible()
  })

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')

    await expect(page.getByText('Page not found')).toBeVisible()
    await expect(page.getByText("The page you're looking for doesn't exist or may have moved.")).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back home' })).toBeVisible()
  })
})
