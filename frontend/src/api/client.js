import axios from 'axios'

export const ACCESS_KEY = 'tour_access'
export const REFRESH_KEY = 'tour_refresh'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem(REFRESH_KEY)
    ) {
      original._retry = true
      try {
        const { data } = await axios.post(`${client.defaults.baseURL}/auth/refresh/`, {
          refresh: localStorage.getItem(REFRESH_KEY),
        })
        localStorage.setItem(ACCESS_KEY, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return client(original)
      } catch {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
        window.dispatchEvent(new Event('auth-expired'))
      }
    }
    return Promise.reject(error)
  },
)
