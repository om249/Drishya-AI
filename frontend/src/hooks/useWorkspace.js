
import { useEffect, useState } from 'react'

function useWorkspace(setSigned) {
  const [page, setPage] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [theme, setTheme] = useState(
    () => localStorage.getItem('drishya_theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('drishya_theme', theme)
  }, [theme])

  function navigate(destination) {
    setPage(destination)
    setSidebarOpen(false)

    if (destination !== 'interview') {
      setSession(null)
    }

    if (destination !== 'results') {
      setResult(null)
    }
  }

  function logout() {
    localStorage.removeItem('drishya_token')
    setSigned(false)
    setPage('dashboard')
    setSession(null)
    setResult(null)
    setSidebarOpen(false)
  }

  return {
    page,
    setPage,
    session,
    setSession,
    result,
    setResult,
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    navigate,
    logout,
  }
}

export default useWorkspace
