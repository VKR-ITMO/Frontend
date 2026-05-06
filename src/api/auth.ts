import api from './client'
import type { User, TokenResponse } from './types'
import { usersApi } from './users'

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: TokenResponse; user: User }> => {
    const tokenResponse = await api.post<TokenResponse>(
      `/auth/token?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    )
    api.setToken(tokenResponse.access_token)
    
    const meResponse = await api.get<{ username: string; id: string }>('/auth/me')
    const user = await usersApi.getUser(meResponse.id)
    
    return { token: tokenResponse, user }
  },

  logout: (): void => {
    api.setToken(null)
  },

  me: async (): Promise<User> => {
    const meResponse = await api.get<{ username: string; id: string }>('/auth/me')
    return usersApi.getUser(meResponse.id)
  },
}
