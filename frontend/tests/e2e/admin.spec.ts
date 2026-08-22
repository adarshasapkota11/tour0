import { test, expect } from './fixtures'

test.describe('Admin panel', () => {
  test('navigate to /admin shows dashboard with stats', async ({ authedAdmin }) => {
    await authedAdmin.goto('/admin')

    await expect(authedAdmin).toHaveURL('/admin')
    await expect(authedAdmin.locator('h1, h2, [class*="font-bold"]').first()).toBeVisible()
  })

  test('navigate to /admin/bookings shows bookings list', async ({ authedAdmin }) => {
    await authedAdmin.goto('/admin/bookings')
    await authedAdmin.waitForLoadState('networkidle')

    await expect(authedAdmin).toHaveURL('/admin/bookings')
    await expect(authedAdmin.getByRole('heading', { name: 'Bookings' })).toBeVisible()
  })

  test('navigate to /admin/inquiries shows inquiries list', async ({ authedAdmin }) => {
    await authedAdmin.goto('/admin/inquiries')
    await authedAdmin.waitForLoadState('networkidle')

    await expect(authedAdmin).toHaveURL('/admin/inquiries')
    await expect(authedAdmin.getByRole('heading', { name: 'Inquiries' })).toBeVisible()
  })

  test('navigate to /admin/reports shows reports page', async ({ authedAdmin }) => {
    await authedAdmin.goto('/admin/reports')
    await authedAdmin.waitForLoadState('networkidle')

    await expect(authedAdmin).toHaveURL('/admin/reports')
    await expect(authedAdmin.getByRole('heading', { name: 'Reports' })).toBeVisible()
  })

  test('navigate to /admin/destinations shows destinations list', async ({ authedAdmin }) => {
    await authedAdmin.goto('/admin/destinations')
    await authedAdmin.waitForLoadState('networkidle')

    await expect(authedAdmin).toHaveURL('/admin/destinations')
    await expect(authedAdmin.getByRole('heading', { name: 'Destinations' })).toBeVisible()
  })
})
