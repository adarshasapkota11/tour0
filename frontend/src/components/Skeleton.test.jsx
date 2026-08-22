import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  ActivityCardSkeleton,
  ActivityGridSkeleton,
  DestinationCardSkeleton,
  DestinationGridSkeleton,
  Skeleton,
} from './Skeleton.jsx'

describe('Skeleton', () => {
  it('renders a div with animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('accepts custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />)
    expect(container.firstChild).toHaveClass('h-4', 'w-10')
  })
})

describe('ActivityCardSkeleton', () => {
  it('renders a card skeleton', () => {
    const { container } = render(<ActivityCardSkeleton />)
    expect(container.querySelector('.bg-card')).toBeInTheDocument()
  })
})

describe('DestinationCardSkeleton', () => {
  it('renders a card skeleton', () => {
    const { container } = render(<DestinationCardSkeleton />)
    expect(container.querySelector('.bg-card')).toBeInTheDocument()
  })
})

describe('ActivityGridSkeleton', () => {
  it('renders default 6 cards', () => {
    const { container } = render(<ActivityGridSkeleton />)
    expect(container.querySelectorAll('.bg-card').length).toBe(6)
  })

  it('renders custom count', () => {
    const { container } = render(<ActivityGridSkeleton count={3} />)
    expect(container.querySelectorAll('.bg-card').length).toBe(3)
  })
})

describe('DestinationGridSkeleton', () => {
  it('renders default 6 cards', () => {
    const { container } = render(<DestinationGridSkeleton />)
    expect(container.querySelectorAll('.bg-card').length).toBe(6)
  })

  it('renders custom count', () => {
    const { container } = render(<DestinationGridSkeleton count={2} />)
    expect(container.querySelectorAll('.bg-card').length).toBe(2)
  })
})
