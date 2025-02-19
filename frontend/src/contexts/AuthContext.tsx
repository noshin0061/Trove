// contexts/AuthContext.tsx
'use client'

import { createContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  getAuthHeader: () => Record<string, string>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        setIsAuthenticated(!!token)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (token: string) => {
    try {
      localStorage.setItem('token', token)
      setIsAuthenticated(true)
      console.log('Token saved:', token)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('token')
      setIsAuthenticated(false)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [router])

  const getAuthHeader = useCallback(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No token found')
        return {}
      }
      return { 'Authorization': `Bearer ${token}` }
    } catch (error) {
      console.error('Error in getAuthHeader:', error)
      return {}
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        getAuthHeader
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}