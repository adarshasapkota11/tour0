const PLACE_IMAGES = {
  'kathmandu': 'kathmandu.png',
  'pokhara': 'pokhara.png',
  'chitwan': 'chitwan.png',
  'lumbini': 'lumbini.png',
  'nagarkot': 'nagarkot.png',
  'bhote-koshi': 'bhote_koshi.png',
  'trishuli-river': 'trishuli.png',
  'mount-everest': 'everest.png',
  'mustang': 'mustang.png',
  'janakpur': 'janakpur.png',
}

const ACTIVITY_SLUG_IMAGES = {
  'bhote-koshi-white-water-rafting': 'bhote_koshi_rafting.png',
  'tandem-paragliding': 'paragliding.png',
  'everest-base-camp-trek': 'everest_base camp trek.png',
  'heritage-walking-tour': 'heritage_walking_tour.png',
  'janaki-mandir-tour': 'janaki_mandir.svg',
  'upper-mustang-trek': 'upper mustang.png',
}

const ACTIVITY_IMAGES = {
  'adventure': 'adventure.png',
  'nature': 'scenic.png',
  'culture': 'culture_heritage.png',
  'spiritual': 'hiking_trekking.png',
}

export function placeImage(destination) {
  if (destination?.cover_image) return destination.cover_image
  const file = destination?.slug && PLACE_IMAGES[destination.slug]
  return file ? `/places/${file}` : ''
}

export function activityImage(activity) {
  if (activity?.image) return activity.image
  const slugFile = activity?.slug && ACTIVITY_SLUG_IMAGES[activity.slug]
  if (slugFile) return `/activities/${slugFile}`
  const file = activity?.category_slug && ACTIVITY_IMAGES[activity.category_slug]
  return file ? `/activities/${file}` : ''
}
