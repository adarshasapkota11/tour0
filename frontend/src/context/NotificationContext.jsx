import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ACCESS_KEY, client } from '../api/client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

function buildWsUrl() {
  const token = localStorage.getItem(ACCESS_KEY)
  if (!token) return null
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws/notifications/?token=${encodeURIComponent(token)}`
}

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef(null)
  const retriesRef = useRef(0)
  const [connected, setConnected] = useState(false)

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await client.get('/notifications/?page_size=20')
      return data
    },
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  })

  const markRead = useMutation({
    mutationFn: (id) => client.post(`/notifications/${id}/read/`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllRead = useMutation({
    mutationFn: () => client.post('/notifications/read-all/').then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }, [queryClient])

  const connect = useCallback(() => {
    if (typeof WebSocket === 'undefined') return
    const url = buildWsUrl()
    if (!url) return
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return

    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onopen = () => {
      retriesRef.current = 0
      setConnected(true)
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload?.text) toast(payload.text)
      } catch {
        // ignore malformed payloads
      }
      refresh()
    }

    socket.onclose = () => {
      setConnected(false)
      if (retriesRef.current < 5) {
        retriesRef.current += 1
        setTimeout(connect, Math.min(1000 * 2 ** retriesRef.current, 30_000))
      }
    }

    socket.onerror = () => socket.close()
  }, [refresh])

  useEffect(() => {
    if (isAuthenticated) {
      retriesRef.current = 0
      connect()
      return () => {
        socketRef.current?.close()
        socketRef.current = null
      }
    }
    socketRef.current?.close()
    socketRef.current = null
    setConnected(false)
    return undefined
  }, [isAuthenticated, connect])

  const value = useMemo(
    () => ({
      notifications: notificationsQuery.data?.results || [],
      unreadCount: notificationsQuery.data?.unread_count ?? 0,
      isLoading: notificationsQuery.isLoading,
      connected,
      markRead: markRead.mutate,
      markAllRead: markAllRead.mutate,
    }),
    [notificationsQuery.data, notificationsQuery.isLoading, connected, markRead.mutate, markAllRead.mutate],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
