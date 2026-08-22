import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

vi.mock('./client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

import {
  useAdminStats,
  useAdminDestinations,
  useAdminActivities,
  useAdminCategories,
  useAdminVisitPackages,
  useAdminBookings,
  useAdminPayments,
  useAdminInquiries,
  useCreateDestination,
  useUpdateDestination,
  useDeleteDestination,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useCreateCategory,
  useDeleteCategory,
  useCreateVisitPackage,
  useDeleteVisitPackage,
  useAdminBookingAction,
  useUpdatePayment,
  useAdminInquiryReply,
  useAdminReport,
  useAdminBill,
} from './adminHooks'

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
)

describe('admin query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
  })

  it('useAdminStats calls /admin/stats/', async () => {
    mocks.get.mockResolvedValue({ data: { stats: { total_bookings: 5 } } })
    const { result } = renderHook(() => useAdminStats(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith('/admin/stats/')
    expect(result.current.data.stats.total_bookings).toBe(5)
  })

  it('useAdminDestinations calls /admin/destinations/', async () => {
    mocks.get.mockResolvedValue({ data: { count: 2, results: [{ id: 1 }] } })
    const { result } = renderHook(() => useAdminDestinations(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith('/admin/destinations/')
  })

  it('useAdminDestinations passes params as query string', async () => {
    const { result } = renderHook(
      () => useAdminDestinations({ page: 2, search: 'pok' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith(expect.stringContaining('/admin/destinations/?'))
    expect(mocks.get).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    expect(mocks.get).toHaveBeenCalledWith(expect.stringContaining('search=pok'))
  })

  it('useAdminActivities calls /admin/activities/', async () => {
    mocks.get.mockResolvedValue({ data: { count: 1, results: [{ id: 1 }] } })
    const { result } = renderHook(() => useAdminActivities({ page: 1 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith(expect.stringContaining('/admin/activities/'))
  })

  it('useAdminCategories calls /admin/categories/?page_size=100', async () => {
    mocks.get.mockResolvedValue({ data: { count: 2, results: [{ id: 1 }] } })
    const { result } = renderHook(() => useAdminCategories(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith('/admin/categories/?page_size=100')
  })

  it('useAdminBookings calls /admin/bookings/', async () => {
    mocks.get.mockResolvedValue({ data: { count: 3, results: [] } })
    const { result } = renderHook(() => useAdminBookings({ status: 'pending' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith(
      expect.stringContaining('/admin/bookings/?'),
    )
  })

  it('useAdminPayments calls /admin/payments/', async () => {
    mocks.get.mockResolvedValue({ data: { count: 1, results: [] } })
    const { result } = renderHook(() => useAdminPayments({ status: 'success' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith(
      expect.stringContaining('/admin/payments/'),
    )
  })

  it('useAdminInquiries calls /admin/inquiries/', async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
    const { result } = renderHook(() => useAdminInquiries(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith('/admin/inquiries/')
  })

  it('useAdminReport calls /admin/reports/ with start and end', async () => {
    mocks.get.mockResolvedValue({ data: { totals: { bookings: 0 } } })
    const { result } = renderHook(
      () => useAdminReport({ start: '2026-01-01', end: '2026-01-31' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith(
      expect.stringContaining('/admin/reports/?'),
    )
  })

  it('useAdminVisitPackages calls /admin/visit-packages/ with destination param', async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, results: [] } })
    const { result } = renderHook(() => useAdminVisitPackages(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith(
      expect.stringContaining('/admin/visit-packages/?destination=1'),
    )
  })
})

describe('admin mutation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useCreateDestination posts to /admin/destinations/', async () => {
    mocks.post.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useCreateDestination(), { wrapper })
    result.current.mutate({ name: 'Lumbini' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.post).toHaveBeenCalledWith('/admin/destinations/', { name: 'Lumbini' })
  })

  it('useUpdateDestination patches /admin/destinations/:id/', async () => {
    mocks.patch.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useUpdateDestination(), { wrapper })
    result.current.mutate({ id: 1, payload: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.patch).toHaveBeenCalledWith('/admin/destinations/1/', { name: 'Updated' })
  })

  it('useDeleteDestination deletes /admin/destinations/:id/', async () => {
    mocks.delete.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useDeleteDestination(), { wrapper })
    result.current.mutate(5)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.delete).toHaveBeenCalledWith('/admin/destinations/5/')
  })

  it('useCreateActivity posts to /admin/activities/', async () => {
    mocks.post.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useCreateActivity(), { wrapper })
    result.current.mutate({ name: 'Rafting' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.post).toHaveBeenCalledWith('/admin/activities/', { name: 'Rafting' })
  })

  it('useUpdateActivity patches /admin/activities/:id/', async () => {
    mocks.patch.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useUpdateActivity(), { wrapper })
    result.current.mutate({ id: 2, payload: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.patch).toHaveBeenCalledWith('/admin/activities/2/', { name: 'Updated' })
  })

  it('useDeleteActivity deletes /admin/activities/:id/', async () => {
    mocks.delete.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useDeleteActivity(), { wrapper })
    result.current.mutate(3)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.delete).toHaveBeenCalledWith('/admin/activities/3/')
  })

  it('useCreateCategory posts to /admin/categories/', async () => {
    mocks.post.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useCreateCategory(), { wrapper })
    result.current.mutate({ name: 'Trekking' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.post).toHaveBeenCalledWith('/admin/categories/', { name: 'Trekking' })
  })

  it('useDeleteCategory deletes /admin/categories/:id/', async () => {
    mocks.delete.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useDeleteCategory(), { wrapper })
    result.current.mutate(4)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.delete).toHaveBeenCalledWith('/admin/categories/4/')
  })

  it('useCreateVisitPackage posts to /admin/visit-packages/', async () => {
    mocks.post.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useCreateVisitPackage(), { wrapper })
    result.current.mutate({ name: 'Golden Triangle' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.post).toHaveBeenCalledWith('/admin/visit-packages/', { name: 'Golden Triangle' })
  })

  it('useDeleteVisitPackage deletes /admin/visit-packages/:id/', async () => {
    mocks.delete.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useDeleteVisitPackage(), { wrapper })
    result.current.mutate(6)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.delete).toHaveBeenCalledWith('/admin/visit-packages/6/')
  })

  it('useAdminBookingAction posts to /admin/bookings/:id/:action/', async () => {
    mocks.post.mockResolvedValue({ data: { status: 'confirmed' } })
    const { result } = renderHook(() => useAdminBookingAction('confirm'), { wrapper })
    result.current.mutate(7)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.post).toHaveBeenCalledWith('/admin/bookings/7/confirm/')
  })

  it('useUpdatePayment patches /admin/payments/:id/', async () => {
    mocks.patch.mockResolvedValue({ data: { status: 'success' } })
    const { result } = renderHook(() => useUpdatePayment(), { wrapper })
    result.current.mutate({ id: 3, payload: { status: 'success' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.patch).toHaveBeenCalledWith('/admin/payments/3/', { status: 'success' })
  })

  it('useAdminInquiryReply posts to /admin/inquiries/:id/reply/', async () => {
    mocks.post.mockResolvedValue({ data: { id: 1 } })
    const { result } = renderHook(() => useAdminInquiryReply(10), { wrapper })
    result.current.mutate('Thanks for reaching out!')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.post).toHaveBeenCalledWith('/admin/inquiries/10/reply/', {
      body: 'Thanks for reaching out!',
    })
  })

  it('useAdminBill opens a blob in a new window', async () => {
    mocks.get.mockResolvedValue({ data: new Blob(['pdf']) })
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { result } = renderHook(() => useAdminBill(), { wrapper })
    result.current.mutate(11)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.get).toHaveBeenCalledWith('/admin/bills/11/pdf/', { responseType: 'blob' })
    expect(openSpy).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer')
    openSpy.mockRestore()
  })
})
