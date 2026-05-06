import type { ReactionType, QuizQuestion, LeaderboardEntry } from './types'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

type SessionEventType =
  | 'session:join'
  | 'session:joined'
  | 'session:participant_joined'
  | 'session:leave'
  | 'session:ended'
  | 'quiz:launched'
  | 'quiz:submit'
  | 'quiz:result'
  | 'quiz:leaderboard'
  | 'quiz:ended'
  | 'reaction:send'
  | 'reaction:update'
  | 'ping'
  | 'pong'
  | 'error'

interface SessionJoinedPayload {
  session: {
    id: string
    lecture_id: string
    access_code: string
  }
  lecture: {
    id: string
    topic: string
    name: string
  }
  teacher: {
    id: string
    full_name: string
  }
}

interface ParticipantJoinedPayload {
  student_id: string
  count: number
}

interface SessionEndedPayload {
  session_id: string
  summary: {
    duration_seconds: number
    total_participants: number
    total_reactions: number
    total_quizzes: number
  }
}

interface QuizLaunchedPayload {
  quiz_id: string
  title: string
  questions: QuizQuestion[]
  timer: number
}

interface QuizResultPayload {
  score: number
  correct: number
  total: number
}

interface ReactionUpdatePayload {
  thumbsUp: number
  heart: number
  clap: number
  thinking: number
  confused: number
  fire: number
}

interface ErrorPayload {
  code: string
  message: string
}

type EventPayload = {
  'session:join': { access_code: string; student_id: string }
  'session:joined': SessionJoinedPayload
  'session:participant_joined': ParticipantJoinedPayload
  'session:leave': { session_id: string }
  'session:ended': SessionEndedPayload
  'quiz:launched': QuizLaunchedPayload
  'quiz:submit': { session_quiz_id: string; answers: { questionId: string; answerId: number }[] }
  'quiz:result': QuizResultPayload
  'quiz:leaderboard': LeaderboardEntry[]
  'quiz:ended': { session_quiz_id: string; stats: unknown }
  'reaction:send': { session_id: string; type: ReactionType }
  'reaction:update': ReactionUpdatePayload
  'ping': { ts: number }
  'pong': { ts: number }
  'error': ErrorPayload
}

type EventHandler<T extends SessionEventType> = (payload: EventPayload[T]) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private handlers: Map<SessionEventType, Set<EventHandler<SessionEventType>>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pingInterval: number | null = null
  private accessCode: string | null = null
  private studentId: string | null = null

  connect(accessCode: string, studentId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.accessCode = accessCode
      this.studentId = studentId || null

      const token = localStorage.getItem('access_token')
      const url = `${WS_URL}?token=${token}`

      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.startPing()

        if (studentId) {
          this.send('session:join', { access_code: accessCode, student_id: studentId })
        }

        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const { type, payload } = data
          this.emit(type, payload)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }

      this.ws.onclose = () => {
        this.stopPing()
        this.attemptReconnect()
      }
    })
  }

  private startPing() {
    this.pingInterval = window.setInterval(() => {
      this.send('pong', { ts: Date.now() })
    }, 30000)
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      if (this.accessCode) {
        this.connect(this.accessCode, this.studentId || undefined)
      }
    }, delay)
  }

  disconnect() {
    this.stopPing()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.accessCode = null
    this.studentId = null
  }

  send<T extends SessionEventType>(type: T, payload: EventPayload[T]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    }
  }

  on<T extends SessionEventType>(type: T, handler: EventHandler<T>) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler as EventHandler<SessionEventType>)
  }

  off<T extends SessionEventType>(type: T, handler: EventHandler<T>) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.delete(handler as EventHandler<SessionEventType>)
    }
  }

  private emit<T extends SessionEventType>(type: T, payload: EventPayload[T]) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.forEach((handler) => handler(payload))
    }
  }

  sendReaction(sessionId: string, type: ReactionType) {
    this.send('reaction:send', { session_id: sessionId, type })
  }

  submitQuizAnswers(sessionQuizId: string, answers: { questionId: string; answerId: number }[]) {
    this.send('quiz:submit', { session_quiz_id: sessionQuizId, answers })
  }

  leaveSession(sessionId: string) {
    this.send('session:leave', { session_id: sessionId })
    this.disconnect()
  }
}

export const wsClient = new WebSocketClient()
export default wsClient
