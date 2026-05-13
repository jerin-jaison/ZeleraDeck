import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const { pathname } = useLocation()
  const [theme, setTheme] = useState(() => {
    // 1. Prefer saved preference
    const saved = localStorage.getItem('zdeck-theme')
    if (saved === 'dark' || saved === 'light') return saved
    // 2. Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  useEffect(() => {
    // List of paths that support dark mode
    const darkModeSupportedPaths = ['/', '/about', '/contact', '/why-us']
    
    // If current path is not in the list, force light mode visually
    const effectiveTheme = darkModeSupportedPaths.includes(pathname) ? theme : 'light'
    
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    localStorage.setItem('zdeck-theme', theme)
  }, [theme, pathname])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
