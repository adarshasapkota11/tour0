export function extractError(error) {
  if (!error?.response) return 'Network error. Please try again.'
  const data = error.response.data
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (typeof data === 'object') {
    const first = Object.values(data).flat()[0]
    if (first) return first
  }
  return 'Something went wrong. Please try again.'
}
