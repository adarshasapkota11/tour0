/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test'

const API = 'http://127.0.0.1:8000'
const E2E_USER = { email: 'e2e@test.com', password: 'e2e1234!' }
const E2E_ADMIN = { email: 'e2e-admin@test.com', password: 'e2e1234!' }

async function loginViaUI(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByPlaceholder('••••••••').fill(credentials.password)
  await page.locator('#email').fill(credentials.email)
  await page.getByRole('button', { name: /log\s*in/i }).click()
  await page.waitForURL('**/', { timeout: 10_000 })
}

type Fixtures = {
  userToken: string
  adminToken: string
  authedUser: Page
  authedAdmin: Page
}

export const test = base.extend<Fixtures>({
  userToken: async ({ page }, use) => {
    const res = await page.request.post(`${API}/api/auth/login/`, { data: E2E_USER })
    const body = await res.json()
    await use(body.access)
  },
  adminToken: async ({ page }, use) => {
    const res = await page.request.post(`${API}/api/auth/login/`, { data: E2E_ADMIN })
    const body = await res.json()
    await use(body.access)
  },
  authedUser: async ({ page }, use) => {
    await loginViaUI(page, E2E_USER)
    await use(page)
  },
  authedAdmin: async ({ page }, use) => {
    await loginViaUI(page, E2E_ADMIN)
    await use(page)
  },
})

export { expect } from '@playwright/test'

export const CREDENTIALS = { E2E_USER, E2E_ADMIN }
