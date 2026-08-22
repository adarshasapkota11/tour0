import { test, expect, CREDENTIALS } from './fixtures'

test.describe('Authentication', () => {
  test.describe('Register', () => {
    test('register new user and redirect to home', async ({ page }) => {
      const unique = `e2e-${Date.now()}@test.com`
      await page.goto('/register')

      await page.getByPlaceholder('Ram Bahadur').fill('Test User')
      await page.locator('input[type="email"]').fill(unique)
      await page.getByPlaceholder('98XXXXXXXX').fill('9800000000')
      await page.getByPlaceholder('Min 8 characters').fill('Password123!')
      await page.getByPlaceholder('Repeat password').fill('Password123!')

      await page.getByRole('button', { name: /sign up/i }).click()

      await expect(page).toHaveURL('/')
    })

    test('register with mismatched passwords shows error', async ({ page }) => {
      await page.goto('/register')

      await page.getByPlaceholder('Ram Bahadur').fill('Test User')
      await page.locator('input[type="email"]').fill('e2e-dup@test.com')
      await page.getByPlaceholder('Min 8 characters').fill('Password123!')
      await page.getByPlaceholder('Repeat password').fill('Different123!')

      await page.getByRole('button', { name: /sign up/i }).click()

      await expect(page.getByText('Passwords do not match.')).toBeVisible()
    })
  })

  test.describe('Login', () => {
    test('login with existing user shows authenticated nav', async ({ page }) => {
      await page.goto('/login')

      await page.locator('#email').fill(CREDENTIALS.E2E_USER.email)
      await page.locator('#password').fill(CREDENTIALS.E2E_USER.password)
      await page.getByRole('button', { name: /log\s*in/i }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('E2E Test User')).toBeVisible({ timeout: 10_000 })
    })

    test('login with wrong password shows error', async ({ page }) => {
      await page.goto('/login')

      await page.locator('#email').fill(CREDENTIALS.E2E_USER.email)
      await page.locator('#password').fill('wrongpassword')
      await page.getByRole('button', { name: /log\s*in/i }).click()

      await expect(page.locator('[class*="danger"]')).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('logout shows login link in nav', async ({ authedUser }) => {
      await expect(authedUser.getByText('E2E Test User')).toBeVisible({ timeout: 10_000 })
      await authedUser.getByRole('button', { name: /logout/i }).click()

      await expect(authedUser.getByRole('link', { name: /login/i })).toBeVisible()
    })
  })

  test.describe('Protected routes', () => {
    test('unauthenticated user visiting /my-bookings redirects to /login', async ({ page }) => {
      await page.goto('/my-bookings')

      await expect(page).toHaveURL(/\/login/)
    })
  })
})
