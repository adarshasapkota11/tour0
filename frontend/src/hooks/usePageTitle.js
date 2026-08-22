import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · TourNepal` : 'TourNepal — Tours & Adventure in Nepal'
    return () => {
      document.title = 'TourNepal — Tours & Adventure in Nepal'
    }
  }, [title])
}
