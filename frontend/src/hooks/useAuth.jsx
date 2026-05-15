import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

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

  useEffect(() => {
    setHydrated(true)
  }, [])

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
  }, [])

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

  // Allow external updates to isPro (e.g. from shop/me refresh)
  const updateIsPro = useCallback((value) => {
    const bool = Boolean(value)
    localStorage.setItem('is_pro', String(bool))
    setIsPro(bool)
  }, [])

  // Sync token changes from axios interceptor (silent refresh)
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
    <AuthContext.Provider value={{ token, shop, isPro, isAuthenticated, hydrated, login, logout, updateIsPro }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
