import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const getStoredToken = () => localStorage.getItem('access_token')
const getStoredShop = () => {
  try {
    const name = localStorage.getItem('shop_name')
    const slug = localStorage.getItem('slug')
    return name ? { name, slug } : null
  } catch { return null }
}
const getStoredIsPro = () => {
  try { return localStorage.getItem('is_pro') === 'true' }
  catch { return false }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [shop, setShop] = useState(() => getStoredShop())
  const [isPro, setIsPro] = useState(() => getStoredIsPro())
  const [hydrated, setHydrated] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('shop_name')
    localStorage.removeItem('slug')
    localStorage.removeItem('is_pro')
    setToken(null)
    setShop(null)
    setIsPro(false)
  }, [])

  // Sync latest shop details and is_pro status from backend
  const refreshAuth = useCallback(async () => {
    const currentToken = localStorage.getItem('access_token')
    if (!currentToken) {
      setHydrated(true)
      return
    }
    try {
      const res = await api.get('shop/me/')
      if (res?.data) {
        const { name, slug, is_pro } = res.data
        const boolPro = Boolean(is_pro)
        localStorage.setItem('shop_name', name)
        localStorage.setItem('slug', slug)
        localStorage.setItem('is_pro', String(boolPro))
        setShop({ name, slug })
        setIsPro(boolPro)
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        logout()
      }
    } finally {
      setHydrated(true)
    }
  }, [logout])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const isAuthenticated = Boolean(token && shop)

  const login = useCallback((accessToken, refreshToken, shopName, slug, isProValue = false) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('shop_name', shopName)
    localStorage.setItem('slug', slug)
    localStorage.setItem('is_pro', String(isProValue))
    setToken(accessToken)
    setShop({ name: shopName, slug })
    setIsPro(Boolean(isProValue))
    setHydrated(true)
  }, [])

  const updateIsPro = useCallback((value) => {
    const bool = Boolean(value)
    localStorage.setItem('is_pro', String(bool))
    setIsPro(bool)
  }, [])

  // Sync token changes from storage events
  useEffect(() => {
    const handleStorageSync = () => {
      const t = localStorage.getItem('access_token')
      if (t !== token) setToken(t)
      setIsPro(getStoredIsPro())
    }
    window.addEventListener('storage', handleStorageSync)
    return () => window.removeEventListener('storage', handleStorageSync)
  }, [token])

  return (
    <AuthContext.Provider value={{ token, shop, isPro, isAuthenticated, hydrated, login, logout, updateIsPro, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

