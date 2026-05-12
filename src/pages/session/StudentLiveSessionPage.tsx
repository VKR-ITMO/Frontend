import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Clock, ThumbsUp, ThumbsDown, Lightbulb, Frown, GripVertical, Trophy, Users, Star } from 'lucide-react'
import Button from '../../components/ui/Button'
import { reactionsApi } from '../../api/reactions'
import { sessionsApi } from '../../api/sessions'
import { quizzesApi, type ActiveQuizQuestion } from '../../api/quizzes'
import { useAuth } from '../../contexts/AuthContext'
import type { SessionWithLecture, SessionParticipant, ReactionType } from '../../api/types'

interface ActiveQuiz {
  sessionQuizId: string
  quizId: string
  title: string
  questions: ActiveQuizQuestion[]
  currentQuestion: number
  selectedAnswers: Record<string, string[]>
  textAnswers: Record<string, string>
  orderingAnswers: Record<string, string[]>
  matchingAnswers: Record<string, Record<string, string>>
}

export default function StudentLiveSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [session, setSession] = useState<SessionWithLecture | null>(location.state?.session || null)
  const [elapsed, setElapsed] = useState('00:00')
  const [participantsList, setParticipantsList] = useState<SessionParticipant[]>([])
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [reactionCounts, setReactionCounts] = useState({ THUMBS_UP: 0, CONFUSED: 0, THINKING: 0, FIRE: 0 })
  const [lastReaction, setLastReaction] = useState<string | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const formatElapsed = useCallback((startTime: string) => {
    const start = new Date(startTime).getTime()
    const diff = Math.floor((Date.now() - start) / 1000)
    const mins = Math.floor(diff / 60).toString().padStart(2, '0')
    const secs = (diff % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }, [])

  useEffect(() => {
    if (!session) {
      navigate('/join')
      return
    }
    const timer = setInterval(() => {
      setElapsed(formatElapsed(session.started_at))
    }, 1000)
    return () => clearInterval(timer)
  }, [session, formatElapsed, navigate])

  // Poll session status + participants
  useEffect(() => {
    if (!session || !sessionId) return
    const poll = async () => {
      try {
        const sessionData = await sessionsApi.getSession(sessionId)
        if (sessionData.ended_at) {
          setSessionEnded(true)
          return
        }
        // Fetch real participants
        try {
          const parts = await sessionsApi.getSessionParticipants(sessionId)
          setParticipantsList(parts.filter(p => !p.left_at))
        } catch { /* ignore */ }
      } catch {
        // session might have ended
      }
    }
    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [session, sessionId])

  // Poll for active quiz
  useEffect(() => {
    if (!sessionId || sessionEnded || quiz || quizSubmitted) return
    const pollQuiz = async () => {
      try {
        const activeQuiz = await quizzesApi.getActiveQuiz(sessionId)
        if (activeQuiz && activeQuiz.questions.length > 0) {
          setQuiz({
            sessionQuizId: activeQuiz.session_quiz_id,
            quizId: activeQuiz.quiz_id,
            title: activeQuiz.title || 'Квиз',
            questions: activeQuiz.questions,
            currentQuestion: 0,
            selectedAnswers: {},
            textAnswers: {},
            orderingAnswers: {},
            matchingAnswers: {},
          })
        }
      } catch { /* no active quiz */ }
    }
    pollQuiz()
    const interval = setInterval(pollQuiz, 3000)
    return () => clearInterval(interval)
  }, [sessionId, sessionEnded, quiz, quizSubmitted])

  const sendReaction = async (type: ReactionType) => {
    if (!sessionId || lastReaction === type) return
    try {
      await reactionsApi.sendReaction(sessionId, type)
      setLastReaction(type)
      setReactionCounts(prev => ({ ...prev, [type]: prev[type as keyof typeof prev] + 1 }))
      setTimeout(() => setLastReaction(null), 5000)
    } catch (error) {
      console.error('Reaction failed:', error)
    }
  }

  const handleLeaveSession = async () => {
    // Call leave API to properly mark left_at in DB
    if (sessionId) {
      try {
        await sessionsApi.leaveSession(sessionId)
      } catch { /* ignore */ }
    }
    if (isAuthenticated && user) {
      const path = user.role === 'STUDENT' ? '/student' : user.role === 'TEACHER' ? '/teacher' : '/'
      navigate(path)
    } else {
      navigate('/')
    }
  }

  const selectSingleAnswer = (questionId: string, answerId: string) => {
    if (!quiz) return
    setQuiz({ ...quiz, selectedAnswers: { ...quiz.selectedAnswers, [questionId]: [answerId] } })
  }

  const toggleMultipleAnswer = (questionId: string, answerId: string) => {
    if (!quiz) return
    const current = quiz.selectedAnswers[questionId] || []
    const updated = current.includes(answerId)
      ? current.filter(id => id !== answerId)
      : [...current, answerId]
    setQuiz({ ...quiz, selectedAnswers: { ...quiz.selectedAnswers, [questionId]: updated } })
  }

  const setTextAnswer = (questionId: string, text: string) => {
    if (!quiz) return
    setQuiz({ ...quiz, textAnswers: { ...quiz.textAnswers, [questionId]: text } })
  }

  const submitQuiz = async () => {
    if (!quiz) return
    try {
      const answers: Record<string, string[]> = {}
      for (const q of quiz.questions) {
        if (q.type === 'TEXT' || q.type === 'FILE') {
          answers[q.id] = [quiz.textAnswers[q.id] || '']
        } else {
          answers[q.id] = quiz.selectedAnswers[q.id] || []
        }
      }
      try {
        const result = await quizzesApi.submitQuizAnswers(quiz.sessionQuizId, answers)
        setQuizResult({ score: result.score, correct: 0, total: quiz.questions.length })
      } catch {
        setQuizResult({ score: 0, correct: 0, total: quiz.questions.length })
      }
      setQuiz(null)
      setQuizSubmitted(true)
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  // End-of-session page
  if (sessionEnded) {
    const totalParticipants = participantsList.length
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Сессия завершена</h1>
          <p className="text-sm text-zinc-500 mb-6">Спасибо за участие в лекции!</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-500">Участников</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">{totalParticipants}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-500">Длительность</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">{elapsed}</p>
            </div>
          </div>

          {quizResult && (
            <div className="bg-zinc-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-500">Ваш результат за квиз</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{quizResult.score} баллов</p>
            </div>
          )}

          <Button fullWidth onClick={handleLeaveSession}>
            {isAuthenticated ? 'В личный кабинет' : 'На главную'}
          </Button>
        </div>
      </div>
    )
  }

  if (quiz) {
    const currentQ = quiz.questions[quiz.currentQuestion]
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-zinc-100 px-36 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-semibold text-zinc-900 truncate">{quiz.title || session?.lecture?.name || 'Квиз'}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-500">В эфире · {elapsed}</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-zinc-400">Вопрос {quiz.currentQuestion + 1} из {quiz.questions.length}</span>
        </div>
        <div className="px-36 py-8 max-w-[722px] mx-auto">
          <QuizQuestionView
            question={currentQ}
            selectedAnswers={quiz.selectedAnswers[currentQ.id] || []}
            textAnswer={quiz.textAnswers[currentQ.id] || ''}
            onSelectSingle={(aid) => selectSingleAnswer(currentQ.id, aid)}
            onToggleMultiple={(aid) => toggleMultipleAnswer(currentQ.id, aid)}
            onTextChange={(text) => setTextAnswer(currentQ.id, text)}
          />
          <div className="flex justify-between mt-8">
            {quiz.currentQuestion > 0 && (
              <Button variant="secondary" onClick={() => setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion - 1 })}>
                Назад
              </Button>
            )}
            {quiz.currentQuestion < quiz.questions.length - 1 ? (
              <Button onClick={() => setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion + 1 })} className="ml-auto">
                Далее
              </Button>
            ) : (
              <Button onClick={submitQuiz} className="ml-auto">Отправить</Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const reactions = [
    { type: 'THUMBS_UP' as ReactionType, label: 'Понятно', icon: <ThumbsUp className="w-6 h-6 text-zinc-400" /> },
    { type: 'CONFUSED' as ReactionType, label: 'Непонятно', icon: <ThumbsDown className="w-6 h-6 text-zinc-400" /> },
    { type: 'THINKING' as ReactionType, label: 'Интересно', icon: <Lightbulb className="w-6 h-6 text-zinc-400" /> },
    { type: 'FIRE' as ReactionType, label: 'Скучно', icon: <Frown className="w-6 h-6 text-zinc-400" /> },
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-36 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1 w-[216px]">
          <h1 className="text-sm font-semibold text-zinc-900 truncate">{session?.lecture?.name || 'Лекция'}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">В эфире · {elapsed}</span>
            </div>
            <span className="text-xs text-zinc-400">{participantsList.length} участников</span>
          </div>
        </div>
        <button
          onClick={handleLeaveSession}
          className="bg-zinc-100 px-3 py-1.5 rounded-full text-xs text-zinc-600 hover:bg-zinc-200 transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Main content */}
      <div className="px-36 py-8 flex gap-8">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Current topic */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
            <p className="text-xs font-medium text-zinc-400 tracking-wider mb-2">Текущая тема</p>
            <p className="text-base font-semibold text-zinc-900">{session?.lecture?.topic || session?.lecture?.name || '—'}</p>
          </div>

          {/* Quiz submitted result */}
          {quizSubmitted && quizResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
              <p className="text-sm font-medium text-emerald-800 mb-1">Ответы отправлены!</p>
              <p className="text-xs text-emerald-600">Баллов: {quizResult.score}</p>
            </div>
          )}

          {/* Waiting for quiz (show only if no quiz submitted yet) */}
          {!quizSubmitted && (
            <div className="bg-zinc-50 rounded-lg flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">Ожидание следующего вопроса</p>
              <p className="text-xs text-zinc-400">Преподаватель скоро запустит квиз</p>
            </div>
          )}

          {/* Reactions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-900">Ваша реакция</h3>
            <div className="grid grid-cols-2 gap-4">
              {reactions.map((r) => (
                <button
                  key={r.type}
                  onClick={() => sendReaction(r.type)}
                  className={`bg-white border rounded-lg px-3 py-3 flex items-center gap-3 transition-colors ${
                    lastReaction === r.type ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                    {r.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-zinc-900">{r.label}</span>
                    <span className="text-xs text-zinc-400">{reactionCounts[r.type as keyof typeof reactionCounts]} реакций</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Top participants (real data) */}
        <div className="w-[398px] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Участники ({participantsList.length})</h3>
          </div>
          <div className="flex flex-col gap-2">
            {participantsList.length === 0 ? (
              <p className="text-center py-4 text-xs text-zinc-400">Нет участников</p>
            ) : participantsList.slice(0, 10).map((p, i) => (
              <div key={p.id} className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-zinc-400 w-3">{i + 1}</span>
                  <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600">
                    {getInitials(p.student_name)}
                  </div>
                  <span className="text-sm font-medium text-zinc-900">{p.student_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuizQuestionView({
  question,
  selectedAnswers,
  textAnswer,
  onSelectSingle,
  onToggleMultiple,
  onTextChange,
}: {
  question: ActiveQuizQuestion
  selectedAnswers: string[]
  textAnswer: string
  onSelectSingle: (answerId: string) => void
  onToggleMultiple: (answerId: string) => void
  onTextChange: (text: string) => void
}) {
  const qType = question.type

  return (
    <div className="bg-zinc-50 rounded-lg p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-400">Вопрос {question.timer ? `· ${question.timer}с` : ''}</span>
        <h2 className="text-base font-semibold text-zinc-900">{question.text}</h2>
      </div>

      {/* SINGLE choice */}
      {qType === 'SINGLE' && (
        <div className="flex flex-col gap-2.5">
          {question.answers.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectSingle(a.id)}
              className={`bg-white border-2 rounded-xl px-4 py-3.5 flex items-center gap-3 transition-colors text-left ${
                selectedAnswers.includes(a.id) ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                selectedAnswers.includes(a.id) ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'
              }`}>
                {selectedAnswers.includes(a.id) && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium text-zinc-800">{a.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* MULTIPLE choice */}
      {qType === 'MULTIPLE' && (
        <div className="flex flex-col gap-2.5">
          {question.answers.map((a) => (
            <button
              key={a.id}
              onClick={() => onToggleMultiple(a.id)}
              className={`bg-white border-2 rounded-xl px-4 py-3.5 flex items-center gap-3 transition-colors text-left ${
                selectedAnswers.includes(a.id) ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${
                selectedAnswers.includes(a.id) ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'
              }`}>
                {selectedAnswers.includes(a.id) && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-sm font-medium text-zinc-800">{a.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* BOOLEAN (true/false) */}
      {qType === 'BOOLEAN' && (
        <div className="flex gap-4">
          {question.answers.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectSingle(a.id)}
              className={`flex-1 py-6 rounded-xl border-2 text-center font-semibold text-base transition-colors ${
                selectedAnswers.includes(a.id)
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
              }`}
            >
              {a.text}
            </button>
          ))}
        </div>
      )}

      {/* TEXT answer */}
      {qType === 'TEXT' && (
        <textarea
          value={textAnswer}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Введите ваш ответ..."
          className="w-full border border-zinc-200 rounded-xl p-4 text-sm text-zinc-900 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
        />
      )}

      {/* FILE upload - requires backend implementation */}
      {qType === 'FILE' && (
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-zinc-50">
          <p className="text-sm text-zinc-600 font-medium">Загрузка файлов не реализована</p>
          <p className="text-xs text-zinc-400">Требуется backend endpoint для загрузки файлов</p>
        </div>
      )}

      {/* ORDERING - basic implementation */}
      {qType === 'ORDERING' && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-zinc-400">Перетащите элементы для упорядочивания (не реализовано)</p>
          {question.answers.map((a, idx) => (
            <div
              key={a.id}
              className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-grab opacity-50"
            >
              <GripVertical className="w-4 h-4 text-zinc-300 shrink-0" />
              <span className="text-xs font-semibold text-zinc-400 w-4">{idx + 1}</span>
              <span className="text-sm font-medium text-zinc-800">{a.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* MATCHING - basic implementation */}
      {qType === 'MATCHING' && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-zinc-400">Сопоставление элементов (не реализовано)</p>
          {question.answers.map((a) => (
            <div key={a.id} className="flex items-center gap-4 opacity-50">
              <div className="flex-1 bg-white border-2 border-zinc-200 rounded-xl px-4 py-3.5">
                <span className="text-sm font-medium text-zinc-800">{a.text}</span>
              </div>
              <span className="text-zinc-300">↔</span>
              <select className="flex-1 bg-white border-2 border-zinc-200 rounded-xl px-4 py-3.5 text-sm text-zinc-800 focus:outline-none" disabled>
                <option value="">Выберите...</option>
                {question.answers.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.text}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
