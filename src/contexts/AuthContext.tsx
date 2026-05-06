import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../api/auth'
import { api } from '../api/client'
import type { User, UserRole } from '../api/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        api.setToken(token)
        try {
          const currentUser = await authApi.me()
          setUser(currentUser)
        } catch {
          api.setToken(null)
          localStorage.removeItem('access_token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password)
      setUser(response.user)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'STUDENT':
      return '/student'
    case 'TEACHER':
      return '/teacher'
    case 'ADMIN':
      return '/admin'
    default:
      return '/'
  }
}

export type { User, UserRole }
