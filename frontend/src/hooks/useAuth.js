import { useState, useCallback } from 'react'
import api from '../api/axios'

const KEYS = { access: 'access_token', refresh: 'refresh_token', shop: 'shop_info' }

function getShop() {
  try { return JSON.parse(localStorage.getItem(KEYS.shop)) } catch { return null }
}

export function useAuth() {
  const [shop, setShop] = useState(getShop)
  const [token, setToken] = useState(() => localStorage.getItem(KEYS.access))

  const login = useCallback(async (phone, password) => {
    const { data } = await api.post('auth/login/', { phone, password })
    localStorage.setItem(KEYS.access, data.access)
    localStorage.setItem(KEYS.refresh, data.refresh)
    const shopInfo = { id: data.shop_id, name: data.shop_name, slug: data.slug }
    localStorage.setItem(KEYS.shop, JSON.stringify(shopInfo))
    setToken(data.access)
    setShop(shopInfo)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEYS.access)
    localStorage.removeItem(KEYS.refresh)
    localStorage.removeItem(KEYS.shop)
    setToken(null)
    setShop(null)
    window.location.href = '/login'
  }, [])

  return {
    shop,
    token,
    isAuthenticated: Boolean(token && shop),
    login,
    logout,
  }
}
