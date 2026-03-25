import axios from 'axios'

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' ? 'http://localhost:8000/api/' : 'https://zeleradeck.onrender.com/api/',
  timeout: 15000,
})



// ── Request interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: refresh on 401, forced logout with reason ────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

const BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api/'
  : 'https://zeleradeck.onrender.com/api/'

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 with refresh token logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        handleForcedLogout(error)
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${BASE}auth/refresh/`, {
          refresh: refreshToken,
        })
        const newAccess = res.data.access
        localStorage.setItem('access_token', newAccess)
        processQueue(null, newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        handleForcedLogout(err)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 — deactivated or expired
    if (error.response?.status === 403) {
      handleForcedLogout(error)
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

function handleForcedLogout(error) {
  const msg = error?.response?.data?.detail ||
              error?.response?.data?.error || ''

  localStorage.clear()

  if (msg.includes('deactivated')) {
    window.location.href = '/login?reason=deactivated'
  } else if (msg.includes('expired')) {
    window.location.href = '/login?reason=expired'
  } else {
    window.location.href = '/login'
  }
}

export default api
