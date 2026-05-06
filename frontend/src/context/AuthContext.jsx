import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('wk_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wk_token')
      localStorage.removeItem('wk_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wk_user')
    const token  = localStorage.getItem('wk_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) }
      catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const persist = (userData) => {
    const { token, ...rest } = userData
    localStorage.setItem('wk_user',  JSON.stringify(rest))
    localStorage.setItem('wk_token', token)
    setUser(rest)
  }

  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password })
    persist(data)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await API.post('/auth/register', payload)
    persist(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('wk_user')
    localStorage.removeItem('wk_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => {
    const merged = { ...user, ...updated }
    localStorage.setItem('wk_user', JSON.stringify(merged))
    setUser(merged)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, API }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { API }
