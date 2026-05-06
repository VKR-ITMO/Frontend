import api from './client'
import type { TeacherAnalytics, CourseAnalytics, SessionAnalytics, StudentAnalytics, ScheduleItem, LeaderboardEntry } from './types'

export const analyticsApi = {
  getTeacherAnalytics: (): Promise<TeacherAnalytics> => {
    return api.get<TeacherAnalytics>('/analytics/teacher')
  },

  getCourseAnalytics: (courseId: string): Promise<CourseAnalytics> => {
    return api.get<CourseAnalytics>(`/analytics/courses/${courseId}`)
  },

  getSessionAnalytics: (sessionId: string): Promise<SessionAnalytics> => {
    return api.get<SessionAnalytics>(`/analytics/sessions/${sessionId}`)
  },

  getStudentAnalytics: (): Promise<StudentAnalytics> => {
    return api.get<StudentAnalytics>('/analytics/student')
  },

  getSchedule: (from?: string, to?: string): Promise<ScheduleItem[]> => {
    let query = ''
    if (from && to) {
      query = `?from=${from}&to=${to}`
    }
    return api.get<ScheduleItem[]>(`/schedule${query}`)
  },

  getLeaderboard: (): Promise<LeaderboardEntry[]> => {
    return api.get<LeaderboardEntry[]>('/leaderboard')
  },

  getCourseLeaderboard: (courseId: string): Promise<LeaderboardEntry[]> => {
    return api.get<LeaderboardEntry[]>(`/leaderboard/courses/${courseId}`)
  },
}
