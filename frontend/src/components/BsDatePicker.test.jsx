import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BsDatePicker from './BsDatePicker.jsx'
import { getTodayAdIso } from '../utils/nepaliDate.js'

function renderPicker() {
  const onChange = vi.fn()
  render(<BsDatePicker value="" minIso={getTodayAdIso()} onChange={onChange} />)
  return onChange
}

describe('BsDatePicker', () => {
  it('opens a Bikram Sambat calendar on click', async () => {
    const user = userEvent.setup()
    renderPicker()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /—|१|२|३|४|५|६|७|८|९|०/ }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('navigates to the next month and emits an AD ISO date', async () => {
    const user = userEvent.setup()
    const onChange = renderPicker()

    await user.click(screen.getByRole('button', { name: /—|१|२|३|४|५|६|७|८|९|०/ }))
    await user.click(screen.getByRole('button', { name: 'next month' }))

    const dayButtons = screen
      .getByRole('dialog')
      .querySelectorAll('button.aspect-square:not([disabled])')
    const firstDay = dayButtons[0]
    await user.click(firstDay)

    expect(onChange).toHaveBeenCalledTimes(1)
    const iso = onChange.mock.calls[0][0]
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
