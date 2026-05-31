import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Clock, ThumbsUp, ThumbsDown, Lightbulb, Frown, GripVertical, Trophy, Users, Star, Check, X, Upload } from 'lucide-react'
import Button from '../../components/ui/Button'
import { reactionsApi } from '../../api/reactions'
import { sessionsApi } from '../../api/sessions'
import { api, API_BASE_URL } from '../../api/client'
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
  fileAnswers: Record<string, { file_id: string; filename: string; url: string }>
}

export default function StudentLiveSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [session, setSession] = useState<SessionWithLecture | null>(location.state?.session || null)
  const [elapsed, setElapsed] = useState('00:00')
  const [participantsList, setParticipantsList] = useState<SessionParticipant[]>([])
  const [error, setError] = useState('')
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [reactionCounts, setReactionCounts] = useState({ THUMBS_UP: 0, CONFUSED: 0, THINKING: 0, FIRE: 0 })
  // Кулдаун по каждому типу реакции (timestamp окончания в мс) — совпадает с серверным лимитом 5с
  const [reactionCooldowns, setReactionCooldowns] = useState<Record<string, number>>({})
  const [nowTick, setNowTick] = useState(Date.now())
  const REACTION_COOLDOWN_MS = 5000
  const [submittedQuizIds, setSubmittedQuizIds] = useState<Set<string>>(new Set())
  const [lastScore, setLastScore] = useState<number | null>(null)
  // Дедлайн текущего вопроса (timestamp в мс). null — вопрос без таймера
  const [questionDeadline, setQuestionDeadline] = useState<number | null>(null)

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

  // Poll for active quiz — continues after submission to pick up new quizzes
  useEffect(() => {
    if (!sessionId || sessionEnded || quiz) return
    const pollQuiz = async () => {
      try {
        const activeQuiz = await quizzesApi.getActiveQuiz(sessionId)
        if (
          activeQuiz &&
          activeQuiz.questions.length > 0 &&
          !submittedQuizIds.has(activeQuiz.session_quiz_id)
        ) {
          // Initialize ordering state from questions so drag-and-drop has an initial order
          const initialOrdering: Record<string, string[]> = {}
          activeQuiz.questions.forEach((q) => {
            if (q.type === 'ORDERING') {
              initialOrdering[q.id] = q.answers.map((a) => a.id)
            }
          })
          setQuiz({
            sessionQuizId: activeQuiz.session_quiz_id,
            quizId: activeQuiz.quiz_id,
            title: activeQuiz.title || 'Квиз',
            questions: activeQuiz.questions,
            currentQuestion: 0,
            selectedAnswers: {},
            textAnswers: {},
            orderingAnswers: initialOrdering,
            matchingAnswers: {},
            fileAnswers: {},
          })
          setQuizResult(null)
        }
      } catch { /* no active quiz */ }
    }
    pollQuiz()
    const interval = setInterval(pollQuiz, 3000)
    return () => clearInterval(interval)
  }, [sessionId, sessionEnded, quiz, submittedQuizIds])

  // Тик для обратного отсчёта кулдауна реакций (только когда есть активный кулдаун)
  useEffect(() => {
    const hasActiveCooldown = Object.values(reactionCooldowns).some(t => t > Date.now())
    if (!hasActiveCooldown) return
    const t = setInterval(() => setNowTick(Date.now()), 500)
    return () => clearInterval(t)
  }, [reactionCooldowns, nowTick])

  const sendReaction = async (type: ReactionType) => {
    if (!sessionId) return
    // Блокируем повторную отправку того же типа в течение кулдауна (как на бэкенде)
    if ((reactionCooldowns[type] || 0) > Date.now()) return
    // Сразу ставим кулдаун, чтобы исключить лишние запросы при быстрых кликах
    setReactionCooldowns(prev => ({ ...prev, [type]: Date.now() + REACTION_COOLDOWN_MS }))
    try {
      await reactionsApi.sendReaction(sessionId, type)
      setReactionCounts(prev => ({ ...prev, [type]: prev[type as keyof typeof prev] + 1 }))
    } catch (error: any) {
      console.error('Reaction failed:', error)
      const errorMsg = error?.message || 'Не удалось отправить реакцию'
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        setError('Сессия истекла. Войдите снова.')
      } else if (errorMsg.includes('404')) {
        setError('Сессия не найдена.')
      } else if (errorMsg.includes('Too many') || errorMsg.includes('wait')) {
        // Серверный лимит — кулдаун уже выставлен, тихо игнорируем
      } else {
        setError('Не удалось отправить реакцию.')
      }
    }
  }

  const handleLeaveSession = async () => {
    // Call leave API to properly mark left_at in DB
    if (sessionId) {
      try {
        await sessionsApi.leaveSession(sessionId)
      } catch { /* ignore */ }
    }
    // Гость: очищаем временный токен и флаг, возвращаем на главную
    const isGuest = localStorage.getItem('is_guest') === 'true'
    if (isGuest) {
      localStorage.removeItem('is_guest')
      api.setToken(null)
      navigate('/')
      return
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

  const handleFileUpload = async (questionId: string, file: File) => {
    if (!quiz) return
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${API_BASE_URL}/quizzes/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      setQuiz({
        ...quiz,
        fileAnswers: {
          ...quiz.fileAnswers,
          [questionId]: { file_id: data.file_id, filename: data.filename, url: data.file_url }
        }
      })
    } catch (error) {
      console.error('File upload failed:', error)
      setError('Не удалось загрузить файл')
    }
  }

  const setOrderingAnswer = (questionId: string, orderedIds: string[]) => {
    if (!quiz) return
    setQuiz({ ...quiz, orderingAnswers: { ...quiz.orderingAnswers, [questionId]: orderedIds } })
  }

  const setMatchingAnswer = (questionId: string, leftId: string, rightId: string) => {
    if (!quiz) return
    setQuiz({
      ...quiz,
      matchingAnswers: {
        ...quiz.matchingAnswers,
        [questionId]: { ...quiz.matchingAnswers[questionId], [leftId]: rightId }
      }
    })
  }

  const submitQuiz = async () => {
    if (!quiz) return
    const submittedId = quiz.sessionQuizId
    try {
      const answers: Record<string, string[]> = {}
      for (const q of quiz.questions) {
        if (q.type === 'TEXT') {
          answers[q.id] = [quiz.textAnswers[q.id] || '']
        } else if (q.type === 'FILE') {
          const fa = quiz.fileAnswers[q.id]
          answers[q.id] = fa ? [JSON.stringify({ url: fa.url, filename: fa.filename })] : ['']
        } else if (q.type === 'ORDERING') {
          // State holds ordered answer ids — convert to texts for scoring
          const orderedIds = quiz.orderingAnswers[q.id] || q.answers.map((a) => a.id)
          answers[q.id] = orderedIds.map((aid) => {
            const a = q.answers.find((x) => x.id === aid)
            return a ? a.text : aid
          })
        } else if (q.type === 'MATCHING') {
          const pairs = quiz.matchingAnswers[q.id] || {}
          answers[q.id] = [JSON.stringify(pairs)]
        } else {
          answers[q.id] = quiz.selectedAnswers[q.id] || []
        }
      }
      try {
        const result = await quizzesApi.submitQuizAnswers(submittedId, answers)
        setQuizResult({ score: result.score, correct: 0, total: quiz.questions.length })
        setLastScore(result.score)
      } catch (error: any) {
        console.error('Submit failed:', error)
        const errorMsg = error?.message || 'Не удалось отправить ответы'
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          setError('Сессия истекла. Войдите снова.')
        } else if (errorMsg.includes('404')) {
          setError('Квиз не найден.')
        } else if (errorMsg.includes('already submitted')) {
          setError('Вы уже отправили ответы на этот квиз.')
        } else {
          setError('Не удалось отправить ответы.')
        }
        setQuizResult({ score: 0, correct: 0, total: quiz.questions.length })
      }
      setQuiz(null)
      setSubmittedQuizIds((prev) => {
        const next = new Set(prev)
        next.add(submittedId)
        return next
      })
    } catch (error: any) {
      console.error('Submit failed:', error)
      setError('Не удалось отправить ответы.')
    }
  }

  // Рефы на актуальные значения, чтобы таймер-интервал не пересоздавался
  // при каждом выборе ответа, но всегда работал с последним состоянием
  const quizRef = useRef(quiz)
  quizRef.current = quiz
  const submitQuizRef = useRef(submitQuiz)
  submitQuizRef.current = submitQuiz

  // Запускаем/сбрасываем таймер при смене вопроса или старте квиза
  useEffect(() => {
    if (!quiz) {
      setQuestionDeadline(null)
      return
    }
    const q = quiz.questions[quiz.currentQuestion]
    setQuestionDeadline(q && q.timer && q.timer > 0 ? Date.now() + q.timer * 1000 : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.sessionQuizId, quiz?.currentQuestion])

  // Тик обратного отсчёта + авто-переход/авто-сабмит по истечении времени
  useEffect(() => {
    if (questionDeadline === null) return
    const tick = () => {
      if (Date.now() < questionDeadline) {
        setNowTick(Date.now())
        return
      }
      setQuestionDeadline(null)
      const cur = quizRef.current
      if (!cur) return
      if (cur.currentQuestion < cur.questions.length - 1) {
        setQuiz((prev) => (prev ? { ...prev, currentQuestion: prev.currentQuestion + 1 } : prev))
      } else {
        submitQuizRef.current()
      }
    }
    const t = setInterval(tick, 250)
    return () => clearInterval(t)
  }, [questionDeadline])

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
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

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

  const reactions = [
    { type: 'THUMBS_UP' as ReactionType, label: 'Понятно', icon: <ThumbsUp className="w-6 h-6 text-zinc-400" /> },
    { type: 'CONFUSED' as ReactionType, label: 'Непонятно', icon: <ThumbsDown className="w-6 h-6 text-zinc-400" /> },
    { type: 'THINKING' as ReactionType, label: 'Интересно', icon: <Lightbulb className="w-6 h-6 text-zinc-400" /> },
    { type: 'FIRE' as ReactionType, label: 'Скучно', icon: <Frown className="w-6 h-6 text-zinc-400" /> },
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const currentQ = quiz ? quiz.questions[quiz.currentQuestion] : null
  const timeLeft =
    questionDeadline !== null ? Math.max(0, Math.ceil((questionDeadline - nowTick) / 1000)) : null

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

          {/* Quiz submitted result (for the last submitted quiz) */}
          {quizResult && lastScore !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
              <p className="text-sm font-medium text-emerald-800 mb-1">Ответы отправлены!</p>
              <p className="text-xs text-emerald-600">Баллов за последний квиз: {quizResult.score}</p>
            </div>
          )}

          {/* Активный квиз — проходит прямо здесь, на месте блока ожидания */}
          {quiz && currentQ ? (
            <div className="bg-zinc-50 rounded-lg p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  Вопрос {quiz.currentQuestion + 1} из {quiz.questions.length}
                </span>
                {timeLeft !== null && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      timeLeft <= 5 ? 'bg-red-100 text-red-700' : 'bg-white border border-zinc-200 text-zinc-600'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {timeLeft}с
                  </span>
                )}
              </div>
              {timeLeft !== null && currentQ.timer > 0 && (
                <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-zinc-900'}`}
                    style={{ width: `${Math.min(100, (timeLeft / currentQ.timer) * 100)}%` }}
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
                <QuizQuestionView
                  question={currentQ}
                  selectedAnswers={quiz.selectedAnswers[currentQ.id] || []}
                  textAnswer={quiz.textAnswers[currentQ.id] || ''}
                  onSelectSingle={(aid) => selectSingleAnswer(currentQ.id, aid)}
                  onToggleMultiple={(aid) => toggleMultipleAnswer(currentQ.id, aid)}
                  onTextChange={(text) => setTextAnswer(currentQ.id, text)}
                  quiz={quiz}
                  handleFileUpload={handleFileUpload}
                  setMatchingAnswer={setMatchingAnswer}
                  setOrderingAnswer={setOrderingAnswer}
                />
              </div>
              <div className="flex justify-between">
                {quiz.currentQuestion > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion - 1 })}
                  >
                    Назад
                  </Button>
                )}
                {quiz.currentQuestion < quiz.questions.length - 1 ? (
                  <Button
                    onClick={() => setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion + 1 })}
                    className="ml-auto"
                  >
                    Далее
                  </Button>
                ) : (
                  <Button onClick={submitQuiz} className="ml-auto">
                    Отправить
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Waiting for next quiz */
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
              {reactions.map((r) => {
                const remaining = Math.max(0, Math.ceil(((reactionCooldowns[r.type] || 0) - nowTick) / 1000))
                const onCooldown = remaining > 0
                return (
                <button
                  key={r.type}
                  onClick={() => sendReaction(r.type)}
                  disabled={onCooldown}
                  className={`bg-white border rounded-lg px-3 py-3 flex items-center gap-3 transition-colors ${
                    onCooldown
                      ? 'border-zinc-200 opacity-50 cursor-not-allowed'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                    {r.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-zinc-900">{r.label}</span>
                    <span className="text-xs text-zinc-400">
                      {onCooldown ? `Подождите ${remaining}с` : `${reactionCounts[r.type as keyof typeof reactionCounts]} реакций`}
                    </span>
                  </div>
                </button>
                )
              })}
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
            ) : [...participantsList]
              .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
              .slice(0, 10)
              .map((p, i) => (
              <div key={p.id} className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-semibold text-zinc-400 w-3">{i + 1}</span>
                  <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                    {getInitials(p.student_name)}
                  </div>
                  <span className="text-sm font-medium text-zinc-900 truncate">{p.student_name}</span>
                </div>
                <span className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-full px-2.5 py-1 shrink-0">
                  {p.total_score ?? 0} б.
                </span>
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
  quiz,
  handleFileUpload,
  setMatchingAnswer,
  setOrderingAnswer,
}: {
  question: ActiveQuizQuestion
  selectedAnswers: string[]
  textAnswer: string
  onSelectSingle: (answerId: string) => void
  onToggleMultiple: (answerId: string) => void
  onTextChange: (text: string) => void
  quiz: ActiveQuiz
  handleFileUpload: (questionId: string, file: File) => void
  setMatchingAnswer: (questionId: string, leftId: string, rightId: string) => void
  setOrderingAnswer: (questionId: string, orderedIds: string[]) => void
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
              className={`flex-1 py-6 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors ${
                selectedAnswers.includes(a.id)
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                {a.text === 'Верно' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </div>
              <span className="font-semibold text-base">{a.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* TEXT answer */}
      {qType === 'TEXT' && (
        <div className="flex flex-col gap-2">
          <textarea
            value={textAnswer}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Введите ваш развёрнутый ответ здесь..."
            maxLength={500}
            className="w-full border border-zinc-200 rounded-xl p-4 text-sm text-zinc-900 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
          />
          <div className="text-xs text-zinc-400 text-right">{textAnswer.length}/500 символов</div>
        </div>
      )}

      {/* FILE upload */}
      {qType === 'FILE' && (
        <div className="flex flex-col gap-2">
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
              quiz.fileAnswers[question.id]
                ? 'border-zinc-900 bg-zinc-50'
                : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) handleFileUpload(question.id, file)
            }}
          >
            {quiz.fileAnswers[question.id] ? (
              <>
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-zinc-900" />
                </div>
                <p className="text-sm font-medium text-zinc-900">{quiz.fileAnswers[question.id].filename}</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600">Нажмите или перетащите файл</p>
                <p className="text-xs text-zinc-400">PDF, DOC, DOCX, JPG, PNG · до 10 МБ</p>
              </>
            )}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(question.id, file)
              }}
              className="hidden"
              id={`file-upload-${question.id}`}
            />
            {!quiz.fileAnswers[question.id] && (
              <label
                htmlFor={`file-upload-${question.id}`}
                className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                Выбрать файл
              </label>
            )}
          </div>
        </div>
      )}

      {/* ORDERING - drag and drop */}
      {qType === 'ORDERING' && (
        <OrderingQuestion
          question={question}
          orderedIds={quiz.orderingAnswers[question.id] || question.answers.map((a) => a.id)}
          onReorder={(ids) => setOrderingAnswer(question.id, ids)}
        />
      )}

      {/* MATCHING - dropdown matching from extra_data.left_column / right_column */}
      {qType === 'MATCHING' && (
        <MatchingQuestion
          question={question}
          pairs={quiz.matchingAnswers[question.id] || {}}
          onSetPair={(leftId, rightId) => setMatchingAnswer(question.id, leftId, rightId)}
        />
      )}
    </div>
  )
}

function OrderingQuestion({
  question,
  orderedIds,
  onReorder,
}: {
  question: ActiveQuizQuestion
  orderedIds: string[]
  onReorder: (ids: string[]) => void
}) {
  // Build a map id -> text
  const textById = new Map(question.answers.map((a) => [a.id, a.text]))
  // Ensure all answer ids are present in order (in case of stale state)
  const effectiveOrder = orderedIds.length === question.answers.length
    ? orderedIds
    : question.answers.map((a) => a.id)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIndex(idx)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault()
    setOverIndex(idx)
  }
  const onDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const next = [...effectiveOrder]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(idx, 0, moved)
    onReorder(next)
    setDragIndex(null)
    setOverIndex(null)
  }
  const onDragEnd = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {effectiveOrder.map((id, idx) => (
        <div
          key={id}
          draggable
          onDragStart={onDragStart(idx)}
          onDragOver={onDragOver(idx)}
          onDrop={onDrop(idx)}
          onDragEnd={onDragEnd}
          className={`bg-white border-2 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-colors ${
            overIndex === idx && dragIndex !== idx ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="bg-zinc-900 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{idx + 1}</span>
          </div>
          <span className="text-sm font-medium text-zinc-800 flex-1">{textById.get(id) ?? id}</span>
          <GripVertical className="w-4 h-4 text-zinc-300 shrink-0" />
        </div>
      ))}
      <p className="text-xs text-zinc-400 text-center mt-1">Перетащите элементы в правильном порядке</p>
    </div>
  )
}

function MatchingQuestion({
  question,
  pairs,
  onSetPair,
}: {
  question: ActiveQuizQuestion
  pairs: Record<string, string>
  onSetPair: (leftId: string, rightId: string) => void
}) {
  const extra = (question.extra_data || {}) as { left_column?: string[]; right_column?: string[] }
  const left = extra.left_column || []
  const right = extra.right_column || []

  // If extra_data is empty but answers have text (legacy fallback), split them
  const leftItems = left.length > 0 ? left : question.answers.map((a) => a.text)
  const rightItems = right.length > 0 ? right : question.answers.map((a) => a.text)

  return (
    <div className="flex flex-col gap-3">
      {leftItems.map((leftText) => (
        <div key={leftText} className="flex items-center gap-3">
          <div className="flex-1 bg-zinc-100 border border-zinc-200 rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-zinc-900">{leftText}</span>
          </div>
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-zinc-300">→</span>
          </div>
          <select
            className="flex-1 bg-white border-2 border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
            value={pairs[leftText] || ''}
            onChange={(e) => onSetPair(leftText, e.target.value)}
          >
            <option value="">— выберите —</option>
            {rightItems.map((rightText) => (
              <option key={rightText} value={rightText}>{rightText}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
