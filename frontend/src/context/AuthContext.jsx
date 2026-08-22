import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { ACCESS_KEY, REFRESH_KEY, client } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await client.get('/auth/me/')
      setUser(data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem(ACCESS_KEY)) {
      fetchMe().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    const onExpired = () => setUser(null)
    window.addEventListener('auth-expired', onExpired)
    return () => window.removeEventListener('auth-expired', onExpired)
  }, [fetchMe])

  const login = useCallback(
    async (email, password) => {
      const { data } = await client.post('/auth/login/', { email, password })
      localStorage.setItem(ACCESS_KEY, data.access)
      localStorage.setItem(REFRESH_KEY, data.refresh)
      await fetchMe()
      return data
    },
    [fetchMe],
  )

  const register = useCallback(
    async (payload) => {
      const { data } = await client.post('/auth/register/', payload)
      return data
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, fetchMe, isAuthenticated: !!user }),
    [user, loading, login, register, logout, fetchMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
