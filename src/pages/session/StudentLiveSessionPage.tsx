import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Clock, ThumbsUp, ThumbsDown, Lightbulb, Frown, GripVertical } from 'lucide-react'
import Button from '../../components/ui/Button'
import { reactionsApi } from '../../api/reactions'
import { sessionsApi } from '../../api/sessions'
import { useAuth } from '../../contexts/AuthContext'
import type { SessionWithLecture, ReactionType } from '../../api/types'

interface QuizQuestion {
  id: string
  text: string
  type: string
  points: number
  timer: number
  answers: { id: string; text: string; is_correct: boolean }[]
  extra_data?: Record<string, unknown>
}

interface ActiveQuiz {
  sessionQuizId: string
  quizId: string
  title: string
  questions: QuizQuestion[]
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
  const [participants, setParticipants] = useState(0)
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [reactionCounts, setReactionCounts] = useState({ THUMBS_UP: 0, CONFUSED: 0, THINKING: 0, FIRE: 0 })
  const [lastReaction, setLastReaction] = useState<string | null>(null)
  const [activeQuizPolling, setActiveQuizPolling] = useState(true)

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

  useEffect(() => {
    if (!session || !sessionId) return
    const poll = async () => {
      try {
        const sessionData = await sessionsApi.getSession(sessionId)
        if (sessionData.ended_at) {
          setSessionEnded(true)
          return
        }
        setParticipants(sessionData.total_participants)
      } catch {
        // session might have ended
      }
    }
    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [session, sessionId])

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

  const leaveSession = () => {
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
      // submit via REST
      setQuizResult({ score: 0, correct: 0, total: quiz.questions.length })
      setQuiz(null)
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  if (sessionEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Лекция завершена</h1>
          <p className="text-zinc-500 mb-6">Спасибо за участие!</p>
          {quizResult && (
            <div className="bg-zinc-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-500">Ваш результат</p>
              <p className="text-3xl font-bold text-zinc-900">{quizResult.correct} / {quizResult.total}</p>
              <p className="text-sm text-zinc-400">Баллов: {quizResult.score}</p>
            </div>
          )}
          <Button onClick={leaveSession}>
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
            <h1 className="text-sm font-semibold text-zinc-900 truncate">{session?.lecture?.name || 'Лекция'}</h1>
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
            <span className="text-xs text-zinc-400">{participants} участников</span>
          </div>
        </div>
        <button
          onClick={leaveSession}
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
            <p className="text-sm text-zinc-400 mt-1">{session?.lecture?.name ? `Проф. ${session.lecture.name}` : ''}</p>
          </div>

          {/* Waiting for quiz */}
          <div className="bg-zinc-50 rounded-lg flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">Ожидание следующего вопроса</p>
            <p className="text-xs text-zinc-400">Преподаватель скоро запустит квиз</p>
          </div>

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

        {/* Right column - Top participants */}
        <div className="w-[398px] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Топ участников</h3>
            <span className="text-xs text-zinc-400 cursor-pointer">Полный рейтинг →</span>
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-zinc-400 w-3">{i}</span>
                  <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600">
                    ИФ
                  </div>
                  <span className="text-sm font-medium text-zinc-900">Имя Фамилия</span>
                </div>
                <span className="text-sm font-semibold text-zinc-900">—</span>
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
  question: QuizQuestion
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

      {/* FILE upload */}
      {qType === 'FILE' && (
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          </div>
          <p className="text-sm text-zinc-600 font-medium">Нажмите для загрузки файла</p>
          <p className="text-xs text-zinc-400">PDF, PNG, JPG до 10 МБ</p>
          <input type="file" className="hidden" />
        </div>
      )}

      {/* ORDERING */}
      {qType === 'ORDERING' && (
        <div className="flex flex-col gap-2.5">
          {question.answers.map((a, idx) => (
            <div
              key={a.id}
              className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-grab"
            >
              <GripVertical className="w-4 h-4 text-zinc-300 shrink-0" />
              <span className="text-xs font-semibold text-zinc-400 w-4">{idx + 1}</span>
              <span className="text-sm font-medium text-zinc-800">{a.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* MATCHING */}
      {qType === 'MATCHING' && (
        <div className="flex flex-col gap-2.5">
          {question.answers.map((a) => (
            <div key={a.id} className="flex items-center gap-4">
              <div className="flex-1 bg-white border-2 border-zinc-200 rounded-xl px-4 py-3.5">
                <span className="text-sm font-medium text-zinc-800">{a.text}</span>
              </div>
              <span className="text-zinc-300">↔</span>
              <select className="flex-1 bg-white border-2 border-zinc-200 rounded-xl px-4 py-3.5 text-sm text-zinc-800 focus:outline-none">
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
