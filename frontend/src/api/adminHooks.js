import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { client } from './client'

const fetchAll = async (url) => {
  const { data } = await client.get(url)
  return data
}

const invalidate = (queryClient, keys) =>
  queryClient.invalidateQueries({ queryKey: keys })

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetchAll('/admin/stats/'),
  })

// --- Reports & bills ---
export const useAdminReport = (params) =>
  useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => fetchAll(`/admin/reports/?${new URLSearchParams(params)}`),
  })

export const useAdminBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId) => {
      const { data } = await client.get(`/admin/bills/${bookingId}/pdf/`, {
        responseType: 'blob',
      })
      return data
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
    },
  })
}

// --- Destinations ---
export const useAdminDestinations = (params) =>
  useQuery({
    queryKey: ['admin', 'destinations', params],
    queryFn: () => fetchAll(`/admin/destinations/${params ? `?${new URLSearchParams(params)}` : ''}`),
  })

export const useAdminDestination = (id) =>
  useQuery({
    queryKey: ['admin', 'destinations', id],
    queryFn: () => fetchAll(`/admin/destinations/${id}/`),
    enabled: !!id,
  })

export const useCreateDestination = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/admin/destinations/', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'destinations'])
      invalidate(queryClient, ['destinations'])
    },
  })
}

export const useUpdateDestination = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      client.patch(`/admin/destinations/${id}/`, payload).then((r) => r.data),
    onSuccess: (data, vars) => {
      invalidate(queryClient, ['admin', 'destinations'])
      invalidate(queryClient, ['destinations'])
      invalidate(queryClient, ['admin', 'destinations', vars.id])
    },
  })
}

export const useDeleteDestination = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/admin/destinations/${id}/`).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'destinations'])
      invalidate(queryClient, ['destinations'])
    },
  })
}

// --- Activities ---
export const useAdminActivities = (params) =>
  useQuery({
    queryKey: ['admin', 'activities', params],
    queryFn: () => fetchAll(`/admin/activities/${params ? `?${new URLSearchParams(params)}` : ''}`),
  })

export const useAdminActivity = (id) =>
  useQuery({
    queryKey: ['admin', 'activities', id],
    queryFn: () => fetchAll(`/admin/activities/${id}/`),
    enabled: !!id,
  })

export const useCreateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/admin/activities/', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'activities'])
      invalidate(queryClient, ['activities'])
    },
  })
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      client.patch(`/admin/activities/${id}/`, payload).then((r) => r.data),
    onSuccess: (data, vars) => {
      invalidate(queryClient, ['admin', 'activities'])
      invalidate(queryClient, ['activities'])
      invalidate(queryClient, ['admin', 'activities', vars.id])
    },
  })
}

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/admin/activities/${id}/`).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'activities'])
      invalidate(queryClient, ['activities'])
    },
  })
}

// --- Categories ---
export const useAdminCategories = () =>
  useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => fetchAll('/admin/categories/?page_size=100'),
  })

export const useAdminCategory = (id) =>
  useQuery({
    queryKey: ['admin', 'categories', id],
    queryFn: () => fetchAll(`/admin/categories/${id}/`),
    enabled: !!id,
  })

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/admin/categories/', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'categories'])
      invalidate(queryClient, ['categories'])
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      client.patch(`/admin/categories/${id}/`, payload).then((r) => r.data),
    onSuccess: (data, vars) => {
      invalidate(queryClient, ['admin', 'categories'])
      invalidate(queryClient, ['categories'])
      invalidate(queryClient, ['admin', 'categories', vars.id])
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/admin/categories/${id}/`).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'categories'])
      invalidate(queryClient, ['categories'])
    },
  })
}

// --- Gallery ---
export const useAdminGallery = (destinationId) =>
  useQuery({
    queryKey: ['admin', 'gallery', destinationId],
    queryFn: () => fetchAll(`/admin/gallery/?destination=${destinationId}&page_size=100`),
    enabled: !!destinationId,
  })

export const useCreateGalleryImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/admin/gallery/', payload).then((r) => r.data),
    onSuccess: (data, vars) =>
      invalidate(queryClient, ['admin', 'gallery', vars.destination]),
  })
}

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/admin/gallery/${id}/`).then((r) => r.data),
    onSuccess: () => invalidate(queryClient, ['admin', 'gallery']),
  })
}

// --- Visit packages ---
export const useAdminVisitPackages = (destinationId) =>
  useQuery({
    queryKey: ['admin', 'visit-packages', 'destination', destinationId],
    queryFn: () => fetchAll(`/admin/visit-packages/?destination=${destinationId}&page_size=100`),
    enabled: !!destinationId,
  })

export const useAdminAllVisitPackages = (params) =>
  useQuery({
    queryKey: ['admin', 'visit-packages', 'all', params],
    queryFn: () =>
      fetchAll(
        `/admin/visit-packages/${params ? `?${new URLSearchParams(params)}` : '?page_size=100'}`,
      ),
  })

export const useAdminVisitPackage = (id) =>
  useQuery({
    queryKey: ['admin', 'visit-packages', id],
    queryFn: () => fetchAll(`/admin/visit-packages/${id}/`),
    enabled: !!id,
  })

export const useCreateVisitPackage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/admin/visit-packages/', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'visit-packages'])
      invalidate(queryClient, ['destinations'])
    },
  })
}

export const useUpdateVisitPackage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      client.patch(`/admin/visit-packages/${id}/`, payload).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'visit-packages'])
      invalidate(queryClient, ['destinations'])
    },
  })
}

export const useDeleteVisitPackage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/admin/visit-packages/${id}/`).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'visit-packages'])
      invalidate(queryClient, ['destinations'])
    },
  })
}

// --- Bookings ---
export const useAdminBookings = (params) =>
  useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: () => fetchAll(`/admin/bookings/${params ? `?${new URLSearchParams(params)}` : ''}`),
  })

export const useAdminBooking = (id) =>
  useQuery({
    queryKey: ['admin', 'bookings', id],
    queryFn: () => fetchAll(`/admin/bookings/${id}/`),
    enabled: !!id,
  })

export const useAdminBookingAction = (action) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.post(`/admin/bookings/${id}/${action}/`).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'bookings'])
      invalidate(queryClient, ['admin', 'stats'])
    },
  })
}

// --- Payments ---
export const useAdminPayments = (params) =>
  useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => fetchAll(`/admin/payments/${params ? `?${new URLSearchParams(params)}` : ''}`),
  })

export const useAdminPayment = (id) =>
  useQuery({
    queryKey: ['admin', 'payments', id],
    queryFn: () => fetchAll(`/admin/payments/${id}/`),
    enabled: !!id,
  })

export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      client.patch(`/admin/payments/${id}/`, payload).then((r) => r.data),
    onSuccess: (data, vars) => {
      invalidate(queryClient, ['admin', 'payments'])
      invalidate(queryClient, ['admin', 'stats'])
      invalidate(queryClient, ['admin', 'payments', vars.id])
    },
  })
}

// --- Inquiries ---
export const useAdminInquiries = (params) =>
  useQuery({
    queryKey: ['admin', 'inquiries', params],
    queryFn: () => fetchAll(`/admin/inquiries/${params ? `?${new URLSearchParams(params)}` : ''}`),
  })

export const useAdminInquiry = (id) =>
  useQuery({
    queryKey: ['admin', 'inquiries', id],
    queryFn: () => fetchAll(`/admin/inquiries/${id}/`),
    enabled: !!id,
  })

export const useAdminInquiryReply = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) =>
      client.post(`/admin/inquiries/${id}/reply/`, { body }).then((r) => r.data),
    onSuccess: () => {
      invalidate(queryClient, ['admin', 'inquiries'])
      invalidate(queryClient, ['admin', 'inquiries', id])
    },
  })
}

export const useAdminInquiryAction = (action) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      client.post(`/admin/inquiries/${id}/${action}/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      invalidate(queryClient, ['admin', 'inquiries'])
      invalidate(queryClient, ['admin', 'inquiries', id])
    },
  })
}
