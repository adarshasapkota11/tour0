import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { Loading } from './State'

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading label="Checking session…" />
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return children
}
