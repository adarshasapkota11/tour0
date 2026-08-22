import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Reports from './Reports.jsx'

const { mocks } = vi.hoisted(() => ({
  mocks: { get: vi.fn() },
}))

vi.mock('../../api/client', () => ({
  client: mocks,
  ACCESS_KEY: 'test_access',
  REFRESH_KEY: 'test_refresh',
}))

vi.mock('recharts', () => {
  const stub = ({ children, dataKey }) => (
    <div data-testid={`recharts-${dataKey || 'container'}`}>{children}</div>
  )
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
    BarChart: stub,
    Bar: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  }
})

const reportData = {
  range: { start: '2026-08-01', end: '2026-08-19' },
  totals: {
    bookings: 25,
    confirmed: 20,
    cancelled: 3,
    revenue: 500000,
    avg_booking_value: 20000,
  },
  days: ['2026-08-01', '2026-08-02'],
  bookings_by_day: [5, 3],
  revenue_by_day: [100000, 60000],
  top_activities: [['Paragliding', 10]],
  top_destinations: [['Pokhara', 12]],
  payments_by_status: { success: 20, pending: 3 },
  payments_by_gateway: { esewa: 15, khalti: 8 },
  item_split: { activities: 18, visit_packages: 7 },
}

function renderReports() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Reports', () => {
  beforeEach(() => {
    mocks.get.mockReset()
    mocks.get.mockResolvedValue({ data: reportData })
  })

  it('renders report title and stats', async () => {
    renderReports()
    expect(await screen.findByText('Bookings')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(screen.getByText('Rs 500,000')).toBeInTheDocument()
    expect(screen.getByText('Avg booking value')).toBeInTheDocument()
  })

  it('renders top activities and destinations', async () => {
    renderReports()
    await screen.findByText('Paragliding')
    expect(screen.getByText('Top activities')).toBeInTheDocument()
    expect(screen.getByText('Top destinations')).toBeInTheDocument()
  })

  it('renders preset buttons', async () => {
    renderReports()
    await screen.findByText('Reports')
    expect(screen.getByRole('button', { name: 'This month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'This year' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last year' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
  })

  it('renders the date range display', async () => {
    renderReports()
    await screen.findByText('2026-08-01 → 2026-08-19')
  })

  it('renders payments breakdowns', async () => {
    renderReports()
    await screen.findByText('Payments by status')
    expect(screen.getByText('Payments by gateway')).toBeInTheDocument()
  })
})
