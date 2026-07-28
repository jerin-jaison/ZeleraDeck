/**
 * ProAdminGuard
 * Wraps any admin page. Checks:
 *   1. hydrated (localStorage read complete)
 *   2. authenticated (token + shop present)
 *   3. isPro === true
 *   4. shop slug matches the URL param :slug
 * If any check fails → redirect to /login.
 */
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProAdminGuard({ children }) {
  const { hydrated, isAuthenticated, isPro, shop } = useAuth()
  const navigate = useNavigate()
  const { slug } = useParams()

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (!isPro) {
      navigate('/dashboard', { replace: true })
      return
    }
    // Prevent one shop owner from accessing another's admin panel — redirect to own Pro Admin panel
    if (slug && shop?.slug && shop.slug !== slug) {
      navigate(`/pro-admin/${shop.slug}/dashboard`, { replace: true })
    }
  }, [hydrated, isAuthenticated, isPro, shop, slug, navigate])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !isPro) return null

  return children
}
