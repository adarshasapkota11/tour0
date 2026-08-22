import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../i18n/index.jsx'
import Pagination from './Pagination.jsx'

function renderPagination(props) {
  return render(
    <I18nProvider>
      <Pagination count={30} page={1} pageSize={12} onChange={vi.fn()} {...props} />
    </I18nProvider>,
  )
}

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    renderPagination({ count: 10 })
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('renders page numbers, prev and next', () => {
    renderPagination()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument()
  })

  it('disables prev on the first page and next on the last page', () => {
    const { rerender } = render(
      <I18nProvider>
        <Pagination count={30} page={1} pageSize={12} onChange={vi.fn()} />
      </I18nProvider>,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()

    rerender(
      <I18nProvider>
        <Pagination count={30} page={3} pageSize={12} onChange={vi.fn()} />
      </I18nProvider>,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('calls onChange with the target page when a number is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderPagination({ onChange })
    await user.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('calls onChange with the next page', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderPagination({ onChange })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('calls onChange with the previous page', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderPagination({ page: 2, onChange })
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
