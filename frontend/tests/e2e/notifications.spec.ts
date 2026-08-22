import { test, expect } from './fixtures'

test.describe('Notifications', () => {
  test('login as admin shows bell icon', async ({ authedAdmin }) => {
    await expect(authedAdmin.getByRole('button', { name: 'Toggle notifications' })).toBeVisible()
  })

  test('notification dropdown opens on bell click', async ({ authedAdmin }) => {
    await authedAdmin.getByRole('button', { name: 'Toggle notifications' }).click()

    await expect(authedAdmin.getByText('Notifications')).toBeVisible()
  })

  test('mark all read button works', async ({ authedAdmin }) => {
    await authedAdmin.goto('/')

    const bell = authedAdmin.getByRole('button', { name: 'Toggle notifications' })
    await bell.click()

    await expect(authedAdmin.getByText('Notifications')).toBeVisible()

    const markAllBtn = authedAdmin.getByRole('button', { name: 'Mark all as read' })
    const isVisible = await markAllBtn.isVisible().catch(() => false)
    if (isVisible) {
      await markAllBtn.click()
      await expect(authedAdmin.getByRole('button', { name: 'Mark all as read' })).not.toBeVisible()
    }
  })
})
