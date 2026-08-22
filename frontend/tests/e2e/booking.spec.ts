import { test, expect } from './fixtures'

async function getFirstPackageId(page: import('@playwright/test').Page): Promise<string> {
  const res = await page.request.get('http://localhost:8000/api/visit-packages/')
  const data = await res.json()
  return String(data.results[0].id)
}

test.describe('Booking flow', () => {
  test('navigate to /book/visit/:packageId shows booking form', async ({ authedUser }) => {
    const pkgId = await getFirstPackageId(authedUser)
    await authedUser.goto(`/book/visit/${pkgId}`)
    await authedUser.waitForLoadState('networkidle')

    await expect(authedUser.getByText('Book your visit')).toBeVisible()
    await expect(authedUser.locator('input[type="date"]')).toBeVisible()
    await expect(authedUser.locator('input[type="number"]')).toBeVisible()
  })

  test('fill booking form and submit shows payment step', async ({ authedUser }) => {
    const pkgId = await getFirstPackageId(authedUser)
    await authedUser.goto(`/book/visit/${pkgId}`)
    await authedUser.waitForLoadState('networkidle')

    const today = new Date()
    today.setDate(today.getDate() + 7)
    const dateStr = today.toISOString().split('T')[0]
    await authedUser.locator('input[type="date"]').fill(dateStr)
    await authedUser.locator('input[type="number"]').fill('2')

    await authedUser.getByRole('button', { name: /continue to payment/i }).click()

    await expect(authedUser.getByText(/payment/i)).toBeVisible()
  })

  test('navigate to /my-bookings shows booking page', async ({ authedUser }) => {
    await authedUser.goto('/my-bookings')

    await expect(authedUser.getByText(/my bookings/i)).toBeVisible()
  })
})
