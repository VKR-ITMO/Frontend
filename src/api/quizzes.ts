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

  updateQuiz: (quizId: string, data: { title?: string; description?: string; questions?: unknown[] }): Promise<Quiz> => {
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

  submitQuizAnswers: (sessionQuizId: string, answers: Record<string, string[]>): Promise<QuizSubmission> => {
    return api.post<QuizSubmission>(`/session-quizzes/${sessionQuizId}/submit`, { answers })
  },

  getQuizResults: (sessionQuizId: string): Promise<QuizResult[]> => {
    return api.get<QuizResult[]>(`/session-quizzes/${sessionQuizId}/results`)
  },

  getQuizLeaderboard: (sessionQuizId: string): Promise<LeaderboardEntry[]> => {
    return api.get<LeaderboardEntry[]>(`/session-quizzes/${sessionQuizId}/leaderboard`)
  },

  getActiveQuiz: (sessionId: string): Promise<ActiveQuizData | null> => {
    return api.get<ActiveQuizData | null>(`/sessions/${sessionId}/quiz/active`)
  },

  getSessionQuiz: (sessionQuizId: string): Promise<SessionQuizWithStats> => {
    return api.get<SessionQuizWithStats>(`/session-quizzes/${sessionQuizId}`)
  },

  getQuizSessionQuizzes: (quizId: string): Promise<SessionQuizWithStats[]> => {
    return api.get<SessionQuizWithStats[]>(`/quizzes/${quizId}/session-quizzes`)
  },

  getSubmissionsDetails: (sessionQuizId: string): Promise<SubmissionsDetailsResponse> => {
    return api.get<SubmissionsDetailsResponse>(`/session-quizzes/${sessionQuizId}/submissions`)
  },
}

export interface SubmissionAnswerView {
  question_id: string
  question_text: string
  type: string
  answer_texts: string[]
  correct_order?: string[]
  pairs?: Record<string, string>
  correct_pairs?: Record<string, string>
  is_correct: boolean | null
  raw: unknown
}

export interface StudentSubmission {
  id: string
  student_id: string
  student_name: string
  student_email: string
  score: number
  submitted_at: string
  answers: SubmissionAnswerView[]
}

export interface SubmissionsDetailsResponse {
  session_quiz_id: string
  questions: ActiveQuizQuestion[]
  submissions: StudentSubmission[]
}

export interface SessionQuizWithStats {
  id: string
  session_id: string
  quiz_id: string
  launched_at: string
  ended_at: string | null
  title: string
  total_submissions: number
  average_score: number
}

export interface ActiveQuizAnswer {
  id: string
  text: string
  is_correct: boolean
}

export interface ActiveQuizQuestion {
  id: string
  text: string
  type: string
  points: number
  timer: number
  order_index: number
  extra_data?: Record<string, unknown> | null
  answers: ActiveQuizAnswer[]
}

export interface ActiveQuizData {
  session_quiz_id: string
  quiz_id: string
  title: string
  description?: string | null
  launched_at: string
  questions: ActiveQuizQuestion[]
}
