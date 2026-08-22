import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { client } from './client'

const fetchAll = async (url) => {
  const { data } = await client.get(url)
  return data
}

export const buildQuery = (params) => {
  const clean = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') clean[key] = value
  }
  const query = new URLSearchParams(clean).toString()
  return query ? `?${query}` : ''
}

export const useDestinations = (params) =>
  useQuery({
    queryKey: ['destinations', params],
    queryFn: () => fetchAll(`/destinations/${buildQuery(params)}`),
  })

export const useDestination = (slug) =>
  useQuery({
    queryKey: ['destinations', slug],
    queryFn: () => fetchAll(`/destinations/${slug}/`),
    enabled: !!slug,
  })

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchAll('/categories/'),
  })

export const useActivities = (params, options) =>
  useQuery({
    queryKey: ['activities', params],
    queryFn: () => fetchAll(`/activities/${buildQuery(params)}`),
    ...options,
  })

export const useActivity = (slug) =>
  useQuery({
    queryKey: ['activities', slug],
    queryFn: () => fetchAll(`/activities/${slug}/`),
    enabled: !!slug,
  })

export const useVisitPackage = (id) =>
  useQuery({
    queryKey: ['visit-packages', id],
    queryFn: () => fetchAll(`/visit-packages/${id}/`),
    enabled: !!id,
  })

export const useBookings = (params) =>
  useQuery({
    queryKey: ['bookings', params],
    queryFn: () => fetchAll(`/bookings/${buildQuery(params)}`),
  })

export const useBooking = (id) =>
  useQuery({
    queryKey: ['bookings', id],
    queryFn: () => fetchAll(`/bookings/${id}/`),
    enabled: !!id,
  })

export const useCreateBooking = () =>
  useMutation({
    mutationFn: (payload) => client.post('/bookings/', payload).then((r) => r.data),
  })

export const useCancelBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) =>
      client.post(`/bookings/${id}/cancel/`, { reason }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export const useInitiatePayment = () =>
  useMutation({
    mutationFn: (payload) => client.post('/payments/initiate/', payload).then((r) => r.data),
  })

export const useVerifyPayment = () =>
  useMutation({
    mutationFn: (payload) => client.post('/payments/verify/', payload).then((r) => r.data),
  })

// --- Inquiries ---
export const useInquiries = () =>
  useQuery({
    queryKey: ['inquiries'],
    queryFn: () => fetchAll('/inquiries/?page_size=100'),
  })

export const useInquiry = (id) =>
  useQuery({
    queryKey: ['inquiries', id],
    queryFn: () => fetchAll(`/inquiries/${id}/`),
    enabled: !!id,
  })

export const useCreateInquiry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/inquiries/start/', payload).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['inquiries', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
    },
  })
}

export const useSendInquiryMessage = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) =>
      client.post(`/inquiries/${id}/messages/`, { body }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries', id] })
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
    },
  })
}
