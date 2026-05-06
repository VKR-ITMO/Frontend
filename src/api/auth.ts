import api from './client'
import type { User, AuthResponse } from './types'

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(`/auth/token?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
    api.setToken(response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    return response
  },

  register: async (email: string, password: string, full_name: string, role: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      full_name,
      role,
    })
    api.setToken(response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    return response
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      api.setToken(null)
      localStorage.removeItem('refresh_token')
    }
  },

  me: (): Promise<User> => {
    return api.get<User>('/auth/me')
  },

  forgotPassword: (email: string): Promise<void> => {
    return api.post('/auth/forgot-password', { email })
  },

  resetPassword: (token: string, new_password: string): Promise<void> => {
    return api.post('/auth/reset-password', { token, new_password })
  },
}
