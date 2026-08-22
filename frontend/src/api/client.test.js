import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('api/client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('exports ACCESS_KEY and REFRESH_KEY constants', async () => {
    const { ACCESS_KEY, REFRESH_KEY } = await import('./client.js')
    expect(ACCESS_KEY).toBe('tour_access')
    expect(REFRESH_KEY).toBe('tour_refresh')
  })

  it('exports a client with request and response interceptors', async () => {
    const { client } = await import('./client.js')
    expect(client.interceptors).toBeDefined()
    expect(client.interceptors.request).toBeDefined()
    expect(client.interceptors.response).toBeDefined()
  })

  it('adds Authorization header when token exists in localStorage', async () => {
    localStorage.setItem('tour_access', 'my-token')
    const { client } = await import('./client.js')
    const config = { headers: {} }
    const resolved = client.interceptors.request.handlers[0].fulfilled(config)
    expect(resolved.headers.Authorization).toBe('Bearer my-token')
  })

  it('does not add Authorization header when no token', async () => {
    localStorage.removeItem('tour_access')
    const { client } = await import('./client.js')
    const config = { headers: {} }
    const resolved = client.interceptors.request.handlers[0].fulfilled(config)
    expect(resolved.headers.Authorization).toBeUndefined()
  })

  it('client has baseURL configured', async () => {
    const { client } = await import('./client.js')
    expect(client.defaults.baseURL).toBeDefined()
  })
})
