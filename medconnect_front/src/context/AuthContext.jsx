import { createContext, useContext, useState } from 'react'
import { supabase } from '../lib/supabase'

// user state is mirrored to localStorage so a page refresh keeps you
// signed in without waiting on a network round-trip.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medconnect_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('medconnect_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('medconnect_user')
    // Also clears the real Supabase session (the auth token in the
    // browser) — without this, refreshing could silently restore it.
    supabase.auth.signOut()
  }

  // Used after a successful PUT /users/{id} — res.data is already the
  // full merged profile (same shape as login), so just drop it in.
  const updateProfile = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem('medconnect_user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// handy hook so any component can do: const { user, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
