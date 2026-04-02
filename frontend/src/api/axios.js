import axios from 'axios'

let base = import.meta.env.VITE_API_URL || 'https://zeleradeck.onrender.com/api/'
if (!base.endsWith('/api/') && !base.endsWith('/api')) {
  base = base.endsWith('/') ? `${base}api/` : `${base}/api/`
}
if (!base.endsWith('/')) base += '/'
const BASE = base

const api = axios.create({
  baseURL: BASE,
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

function handleForcedLogout(error) {
  const msg = error?.response?.data?.detail ||
              error?.response?.data?.error || ''
  localStorage.clear()
  if (msg.includes('deactivated')) {
    window.location.href = '/login?reason=deactivated'
  } else {
    // Generic session timeout / bad token — just redirect silently
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

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
        // No refresh token = session ended normally, don't show any warning
        localStorage.clear()
        window.location.href = '/login'
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

    // Handle 403 — only force logout for account-level issues (deactivated/expired)
    if (error.response?.status === 403) {
      const isLoginUrl = originalRequest?.url?.includes('auth/login')
      const msg = error?.response?.data?.detail || error?.response?.data?.error || ''
      const isAccountIssue = msg.includes('deactivated') || msg.includes('expired')
      if (!isLoginUrl && isAccountIssue) {
        handleForcedLogout(error)
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
