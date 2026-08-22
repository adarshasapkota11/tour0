import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { Loading } from './State'

export default function RequireStaff({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const warned = useRef(false)

  useEffect(() => {
    if (!loading && isAuthenticated && !user?.is_staff && !warned.current) {
      warned.current = true
      toast.error('You do not have access to the admin panel.')
    }
  }, [loading, isAuthenticated, user])

  if (loading) return <Loading label="Checking session…" />
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (!user.is_staff) return <Navigate to="/" replace />
  return children
}
