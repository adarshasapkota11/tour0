import { describe, expect, it } from 'vitest'

import { activityImage, placeImage } from './staticImages.js'

describe('placeImage', () => {
  it('maps known destination slugs to the public places asset', () => {
    expect(placeImage({ slug: 'kathmandu' })).toBe('/places/kathmandu.png')
    expect(placeImage({ slug: 'bhote-koshi' })).toBe('/places/bhote_koshi.png')
    expect(placeImage({ slug: 'mount-everest' })).toBe('/places/everest.png')
  })

  it('prefers an uploaded cover_image over the static asset', () => {
    expect(placeImage({ slug: 'kathmandu', cover_image: '/media/destinations/k.png' })).toBe(
      '/media/destinations/k.png',
    )
  })

  it('falls back to the backend cover_image for unknown destinations', () => {
    expect(placeImage({ slug: 'custom-place', cover_image: '/media/destinations/x.png' })).toBe(
      '/media/destinations/x.png',
    )
  })

  it('returns an empty string when nothing is available', () => {
    expect(placeImage(null)).toBe('')
    expect(placeImage({ slug: 'nope' })).toBe('')
  })
})

describe('activityImage', () => {
  it('maps known activity slugs to specific images', () => {
    expect(activityImage({ slug: 'tandem-paragliding' })).toBe('/activities/paragliding.png')
    expect(activityImage({ slug: 'bhote-koshi-white-water-rafting' })).toBe('/activities/bhote_koshi_rafting.png')
    expect(activityImage({ slug: 'everest-base-camp-trek' })).toBe('/activities/everest_base camp trek.png')
    expect(activityImage({ slug: 'heritage-walking-tour' })).toBe('/activities/heritage_walking_tour.png')
    expect(activityImage({ slug: 'janaki-mandir-tour' })).toBe('/activities/janaki_mandir.svg')
    expect(activityImage({ slug: 'upper-mustang-trek' })).toBe('/activities/upper mustang.png')
  })

  it('falls back to category slug mapping', () => {
    expect(activityImage({ slug: 'unknown', category_slug: 'adventure' })).toBe('/activities/adventure.png')
    expect(activityImage({ slug: 'unknown', category_slug: 'nature' })).toBe('/activities/scenic.png')
    expect(activityImage({ slug: 'unknown', category_slug: 'culture' })).toBe('/activities/culture_heritage.png')
  })

  it('prefers an uploaded image over the static asset', () => {
    expect(activityImage({ category_slug: 'adventure', image: '/media/activities/a.png' })).toBe(
      '/media/activities/a.png',
    )
  })

  it('falls back to the backend image for unknown categories', () => {
    expect(activityImage({ category_slug: 'weird', image: '/media/activities/x.png' })).toBe(
      '/media/activities/x.png',
    )
  })

  it('returns an empty string when nothing is available', () => {
    expect(activityImage(null)).toBe('')
    expect(activityImage({ category_slug: 'nope' })).toBe('')
  })
})
