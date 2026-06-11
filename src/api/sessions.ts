import api from './client'
import type { Session, SessionWithLecture, SessionParticipant, CompletedSession, GuestJoinResponse } from './types'

export const sessionsApi = {
  startSession: (lectureId: string): Promise<Session> => {
    return api.post<Session>('/sessions/start', { lecture_id: lectureId })
  },

  joinSession: (accessCode: string): Promise<SessionWithLecture> => {
    return api.post<SessionWithLecture>('/sessions/join', { access_code: accessCode })
  },

  joinSessionAsGuest: (accessCode: string, fullName: string): Promise<GuestJoinResponse> => {
    return api.post<GuestJoinResponse>('/sessions/join/guest', {
      access_code: accessCode,
      full_name: fullName,
    })
  },

  getActiveSession: (): Promise<Session | null> => {
    return api.get<Session | null>('/sessions/active')
  },

  getActiveSessionForLecture: (lectureId: string): Promise<SessionWithLecture | null> => {
    return api.get<SessionWithLecture | null>(`/sessions/lecture/${lectureId}/active`)
  },

  getSession: (sessionId: string): Promise<Session> => {
    return api.get<Session>(`/sessions/${sessionId}`)
  },

  endSession: (sessionId: string): Promise<CompletedSession> => {
    return api.post<CompletedSession>(`/sessions/${sessionId}/end`)
  },

  getSessionHistory: (): Promise<CompletedSession[]> => {
    return api.get<CompletedSession[]>('/sessions/history')
  },

  leaveSession: (sessionId: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/sessions/${sessionId}/leave`)
  },

  getSessionParticipants: (sessionId: string): Promise<SessionParticipant[]> => {
    return api.get<SessionParticipant[]>(`/sessions/${sessionId}/participants`)
  },
}
