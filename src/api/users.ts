import api from './client'
import type { User, StudentStats, Achievement } from './types'

export const usersApi = {
  getUser: (userId: string): Promise<User> => {
    return api.get<User>(`/users/${userId}`)
  },

  updateUser: (userId: string, data: { full_name?: string; avatar_url?: string }): Promise<User> => {
    return api.patch<User>(`/users/${userId}`, data)
  },

  getStudentStats: (userId: string): Promise<StudentStats> => {
    return api.get<StudentStats>(`/users/${userId}/stats`)
  },

  changePassword: (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    return api.post<void>(`/users/${userId}/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  getAchievements: (userId: string): Promise<Achievement[]> => {
    return api.get<Achievement[]>(`/users/${userId}/achievements`)
  },
}
