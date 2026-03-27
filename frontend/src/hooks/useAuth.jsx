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

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [shop, setShop] = useState(() => getStoredShop())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const isAuthenticated = Boolean(token && shop)

  const login = useCallback((accessToken, refreshToken, shopName, slug) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('shop_name', shopName)
    localStorage.setItem('slug', slug)
    setToken(accessToken)
    setShop({ name: shopName, slug })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('shop_name')
    localStorage.removeItem('slug')
    setToken(null)
    setShop(null)
  }, [])

  // Sync token changes from axios interceptor (silent refresh)
  useEffect(() => {
    const handleStorageSync = () => {
      const t = localStorage.getItem('access_token')
      if (t !== token) setToken(t)
    }
    window.addEventListener('storage', handleStorageSync)
    return () => window.removeEventListener('storage', handleStorageSync)
  }, [token])

  return (
    <AuthContext.Provider value={{ token, shop, isAuthenticated, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
