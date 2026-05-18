import { useState } from 'react'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'

const AUTH_STORAGE_KEY = 'wbd_auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_STORAGE_KEY) === '1',
  )

  if (!isAuthenticated) {
    return (
      <Login
        onSuccess={() => {
          localStorage.setItem(AUTH_STORAGE_KEY, '1')
          setIsAuthenticated(true)
        }}
      />
    )
  }

  return (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setIsAuthenticated(false)
      }}
    />
  )
}

export default App
