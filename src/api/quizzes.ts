import api from './client'
import type { Quiz, QuizWithQuestions, SessionQuiz, QuizSubmission, QuizResult, LeaderboardEntry } from './types'

export const quizzesApi = {
  getQuizzes: (): Promise<Quiz[]> => {
    return api.get<Quiz[]>('/quizzes')
  },

  getQuiz: (quizId: string): Promise<QuizWithQuestions> => {
    return api.get<QuizWithQuestions>(`/quizzes/${quizId}`)
  },

  createQuiz: (data: { title: string; description?: string; course_id?: string }): Promise<Quiz> => {
    return api.post<Quiz>('/quizzes', data)
  },

  updateQuiz: (quizId: string, data: { title?: string; questions?: unknown[] }): Promise<Quiz> => {
    return api.put<Quiz>(`/quizzes/${quizId}`, data)
  },

  deleteQuiz: (quizId: string): Promise<void> => {
    return api.delete(`/quizzes/${quizId}`)
  },

  launchQuiz: (sessionId: string, quizId: string): Promise<SessionQuiz> => {
    return api.post<SessionQuiz>(`/sessions/${sessionId}/quiz/launch`, { quiz_id: quizId })
  },

  endQuiz: (sessionId: string): Promise<SessionQuiz & { stats: unknown }> => {
    return api.post(`/sessions/${sessionId}/quiz/end`)
  },

  submitQuizAnswers: (sessionQuizId: string, answers: { questionId: string; answerId: number }[]): Promise<QuizSubmission> => {
    return api.post<QuizSubmission>(`/session-quizzes/${sessionQuizId}/submit`, { answers })
  },

  getQuizResults: (sessionQuizId: string): Promise<QuizResult[]> => {
    return api.get<QuizResult[]>(`/session-quizzes/${sessionQuizId}/results`)
  },

  getQuizLeaderboard: (sessionQuizId: string): Promise<LeaderboardEntry[]> => {
    return api.get<LeaderboardEntry[]>(`/session-quizzes/${sessionQuizId}/leaderboard`)
  },
}
