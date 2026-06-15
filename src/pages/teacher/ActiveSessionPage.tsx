import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QrCode, Clock, Users, Copy, Check, Plus, Trash2, Play, Square, ChevronRight, Eye, ThumbsUp, HelpCircle, Lightbulb, Heart, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { sessionsApi } from '../../api/sessions'
import { reactionsApi } from '../../api/reactions'
import { quizzesApi, type ActiveQuizData, type SubmissionsDetailsResponse } from '../../api/quizzes'
import PollChart from '../../components/ui/PollChart'
import { API_BASE_URL } from '../../api/client'
import type { Session, SessionParticipant, ReactionStats, Quiz, SessionQuiz } from '../../api/types'

const FILES_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

interface NewQuestion {
  id: string
  text: string
  type: string
  timer: number
  points: number
  answers: { text: string; is_correct: boolean }[]
  orderingItems?: string[]
  matchingLeft?: string[]
  matchingRight?: string[]
}

export default function ActiveSessionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(location.state?.session || null)
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [reactions, setReactions] = useState<ReactionStats>({
    THUMBS_UP: 0, HEART: 0, CLAP: 0, THINKING: 0, CONFUSED: 0, FIRE: 0, total: 0
  })
  const [elapsed, setElapsed] = useState('00:00:00')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [endModalOpen, setEndModalOpen] = useState(false)
  const [createQuizOpen, setCreateQuizOpen] = useState(false)
  const [templateQuizOpen, setTemplateQuizOpen] = useState(false)
  const [quickPollOpen, setQuickPollOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [endingSession, setEndingSession] = useState(false)
  const [endError, setEndError] = useState('')
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [createQuizError, setCreateQuizError] = useState('')
  const [launchingTemplateId, setLaunchingTemplateId] = useState<string | null>(null)
  const [creatingPoll, setCreatingPoll] = useState(false)
  const [pollChartModalId, setPollChartModalId] = useState<string | null>(null)

  // Launched quizzes state
  const [launchedQuizzes, setLaunchedQuizzes] = useState<(SessionQuiz & { title?: string })[]>([])
  const [activeQuizData, setActiveQuizData] = useState<ActiveQuizData | null>(null)

  // View submissions modal
  const [submissionsOpen, setSubmissionsOpen] = useState(false)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsData, setSubmissionsData] = useState<SubmissionsDetailsResponse | null>(null)
  const [submissionsTitle, setSubmissionsTitle] = useState('')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  // Create quiz state
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [newQuizQuestions, setNewQuizQuestions] = useState<NewQuestion[]>([
    { id: Date.now().toString(), text: '', type: 'SINGLE', timer: 30, points: 1, answers: [{ text: '', is_correct: true }, { text: '', is_correct: false }], orderingItems: ['', '', ''], matchingLeft: ['', ''], matchingRight: ['', ''] }
  ])

  // Quick poll state
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollType, setPollType] = useState<'options' | 'open'>('options')
  const [pollOptions, setPollOptions] = useState(['', ''])

  const formatElapsed = useCallback((startTime: string) => {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const diff = Math.floor((now - start) / 1000)
    const hours = Math.floor(diff / 3600).toString().padStart(2, '0')
    const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
    const seconds = (diff % 60).toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }, [])

  useEffect(() => {
    const loadSession = async () => {
      if (!session) {
        try {
          const activeSession = await sessionsApi.getActiveSession()
          if (activeSession) {
            setSession(activeSession)
          } else {
            navigate('/teacher/live')
          }
        } catch {
          navigate('/teacher/live')
        }
      }
    }
    loadSession()
  }, [session, navigate])

  useEffect(() => {
    if (!session) return
    const timer = setInterval(() => {
      setElapsed(formatElapsed(session.started_at))
    }, 1000)
    return () => clearInterval(timer)
  }, [session, formatElapsed])

  useEffect(() => {
    if (!session) return
    const fetchData = async () => {
      try {
        const [participantsData, reactionsData] = await Promise.all([
          sessionsApi.getSessionParticipants(session.id),
          reactionsApi.getReactionStats(session.id)
        ])
        setParticipants(participantsData)
        setReactions(reactionsData)
      } catch (error) {
        console.error('Failed to fetch session data:', error)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [session])

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await quizzesApi.getQuizzes()
        setQuizzes(data)
      } catch (error) {
        console.error('Failed to load quizzes:', error)
      }
    }
    loadQuizzes()
  }, [])

  // Восстанавливаем список запущенных квизов из localStorage при загрузке сессии
  useEffect(() => {
    if (!session) return
    try {
      const stored = localStorage.getItem(`session_quizzes_${session.id}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) setLaunchedQuizzes(parsed)
      }
    } catch { /* ignore */ }
  }, [session?.id])

  // Синхронизируем список запущенных квизов в localStorage при каждом изменении
  useEffect(() => {
    if (!session || launchedQuizzes.length === 0) return
    try {
      localStorage.setItem(`session_quizzes_${session.id}`, JSON.stringify(launchedQuizzes))
    } catch { /* ignore */ }
  }, [launchedQuizzes, session])

  // Poll for active quiz data (questions) 
  useEffect(() => {
    if (!session) return
    const pollActiveQuiz = async () => {
      try {
        const data = await quizzesApi.getActiveQuiz(session.id)
        setActiveQuizData(data)
        if (data && !launchedQuizzes.find(q => q.quiz_id === data.quiz_id && !q.ended_at)) {
          setLaunchedQuizzes(prev => {
            const exists = prev.find(q => q.quiz_id === data.quiz_id)
            if (exists) return prev
            return [...prev, {
              id: data.session_quiz_id,
              session_id: session.id,
              quiz_id: data.quiz_id,
              launched_at: data.launched_at,
              started_at: data.launched_at,
              title: data.title,
            } as SessionQuiz & { title?: string }]
          })
        }
      } catch {
        setActiveQuizData(null)
      }
    }
    pollActiveQuiz()
    const interval = setInterval(pollActiveQuiz, 4000)
    return () => clearInterval(interval)
  }, [session])

  const handleEndSession = async () => {
    if (!session) return
    setEndingSession(true)
    setEndError('')
    try {
      await sessionsApi.endSession(session.id)
      setEndModalOpen(false)
      navigate('/teacher/live')
    } catch (error: any) {
      console.error('Failed to end session:', error)
      setEndError(error?.message || 'Не удалось завершить сессию. Попробуйте ещё раз.')
    } finally {
      setEndingSession(false)
    }
  }

  const copyAccessCode = () => {
    if (session?.access_code) {
      navigator.clipboard.writeText(session.access_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // --- Create Quiz with questions ---
  const addQuestion = () => {
    const newQuestion: NewQuestion = {
      id: Date.now().toString(),
      type: 'SINGLE',
      text: '',
      timer: 30,
      points: 1,
      answers: [{ text: '', is_correct: true }, { text: '', is_correct: false }],
      orderingItems: ['', '', ''],
      matchingLeft: ['', ''],
      matchingRight: ['', ''],
    }
    setNewQuizQuestions([...newQuizQuestions, newQuestion])
  }

  const removeQuestion = (idx: number) => {
    if (newQuizQuestions.length <= 1) return
    setNewQuizQuestions(newQuizQuestions.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx: number, field: string, value: unknown) => {
    const updated = [...newQuizQuestions]
    ;(updated[idx] as any)[field] = value
    if (field === 'type') {
      if (value === 'BOOLEAN') {
        updated[idx].answers = [{ text: 'Верно', is_correct: true }, { text: 'Неверно', is_correct: false }]
      } else if (value === 'SINGLE' || value === 'MULTIPLE') {
        if (!updated[idx].answers || updated[idx].answers.length < 2) {
          updated[idx].answers = [{ text: '', is_correct: true }, { text: '', is_correct: false }]
        }
      }
      if (value === 'ORDERING' && (!updated[idx].orderingItems || updated[idx].orderingItems.length === 0)) {
        updated[idx].orderingItems = ['', '', '']
      }
      if (value === 'MATCHING') {
        if (!updated[idx].matchingLeft || updated[idx].matchingLeft.length === 0) updated[idx].matchingLeft = ['', '']
        if (!updated[idx].matchingRight || updated[idx].matchingRight.length === 0) updated[idx].matchingRight = ['', '']
      }
    }
    setNewQuizQuestions(updated)
  }

  const updateOrderingItem = (qIdx: number, idx: number, value: string) => {
    const updated = [...newQuizQuestions]
    const items = [...(updated[qIdx].orderingItems || [])]
    items[idx] = value
    updated[qIdx].orderingItems = items
    setNewQuizQuestions(updated)
  }
  const addOrderingItem = (qIdx: number) => {
    const updated = [...newQuizQuestions]
    updated[qIdx].orderingItems = [...(updated[qIdx].orderingItems || []), '']
    setNewQuizQuestions(updated)
  }
  const updateMatchingLeft = (qIdx: number, idx: number, value: string) => {
    const updated = [...newQuizQuestions]
    const items = [...(updated[qIdx].matchingLeft || [])]
    items[idx] = value
    updated[qIdx].matchingLeft = items
    setNewQuizQuestions(updated)
  }
  const addMatchingLeft = (qIdx: number) => {
    const updated = [...newQuizQuestions]
    updated[qIdx].matchingLeft = [...(updated[qIdx].matchingLeft || []), '']
    setNewQuizQuestions(updated)
  }
  const updateMatchingRight = (qIdx: number, idx: number, value: string) => {
    const updated = [...newQuizQuestions]
    const items = [...(updated[qIdx].matchingRight || [])]
    items[idx] = value
    updated[qIdx].matchingRight = items
    setNewQuizQuestions(updated)
  }
  const addMatchingRight = (qIdx: number) => {
    const updated = [...newQuizQuestions]
    updated[qIdx].matchingRight = [...(updated[qIdx].matchingRight || []), '']
    setNewQuizQuestions(updated)
  }

  const addAnswer = (qIdx: number) => {
    const updated = [...newQuizQuestions]
    updated[qIdx].answers.push({ text: '', is_correct: false })
    setNewQuizQuestions(updated)
  }

  const removeAnswer = (qIdx: number, aIdx: number) => {
    const updated = [...newQuizQuestions]
    if (updated[qIdx].answers.length <= 2) return
    updated[qIdx].answers = updated[qIdx].answers.filter((_, i) => i !== aIdx)
    setNewQuizQuestions(updated)
  }

  const updateAnswer = (qIdx: number, aIdx: number, field: string, value: unknown) => {
    const updated = [...newQuizQuestions]
    ;(updated[qIdx].answers[aIdx] as any)[field] = value
    if (field === 'is_correct' && updated[qIdx].type === 'SINGLE' && value === true) {
      updated[qIdx].answers.forEach((a, i) => { if (i !== aIdx) a.is_correct = false })
    }
    setNewQuizQuestions(updated)
  }

  const handleCreateQuiz = async () => {
    if (!newQuizTitle || !session || creatingQuiz) return

    // Валидация: для ORDERING нужно минимум 2 непустых элемента,
    // для MATCHING — минимум по 2 в каждом столбце.
    for (let i = 0; i < newQuizQuestions.length; i++) {
      const q = newQuizQuestions[i]
      if (q.type === 'ORDERING') {
        const items = (q.orderingItems || []).filter(o => o.trim())
        if (items.length < 2) {
          setCreateQuizError(`Вопрос ${i + 1}: добавьте минимум 2 элемента для упорядочивания`)
          return
        }
      }
      if (q.type === 'MATCHING') {
        const left = (q.matchingLeft || []).filter(o => o.trim())
        const right = (q.matchingRight || []).filter(o => o.trim())
        if (left.length < 2 || right.length < 2 || left.length !== right.length) {
          setCreateQuizError(`Вопрос ${i + 1}: левый и правый столбцы должны содержать одинаковое число (минимум 2) непустых элементов`)
          return
        }
      }
      if ((q.type === 'SINGLE' || q.type === 'MULTIPLE') && (q.answers || []).filter(a => a.text.trim()).length < 2) {
        setCreateQuizError(`Вопрос ${i + 1}: добавьте минимум 2 непустых варианта ответа`)
        return
      }
    }

    setCreatingQuiz(true)
    setCreateQuizError('')
    try {
      const quiz = await quizzesApi.createQuiz({ title: newQuizTitle })
      await quizzesApi.updateQuiz(quiz.id, {
        title: newQuizTitle,
        questions: newQuizQuestions.map((q, idx) => {
          const base = {
            text: q.text,
            type: q.type,
            timer: q.timer,
            points: q.points,
            order_index: idx,
          }

          if (q.type === 'SINGLE' || q.type === 'MULTIPLE' || q.type === 'BOOLEAN') {
            return {
              ...base,
              answers: q.answers,
            }
          }

          if (q.type === 'ORDERING') {
            const items = (q.orderingItems || []).filter(o => o.trim())
            return {
              ...base,
              answers: items.map((item, i) => ({ text: item, is_correct: i === 0 })),
              extra_data: { correct_order: items },
            }
          }

          if (q.type === 'MATCHING') {
            const left = (q.matchingLeft || []).filter(o => o.trim())
            const right = (q.matchingRight || []).filter(o => o.trim())
            const correct_pairs: Record<string, string> = {}
            for (let i = 0; i < left.length && i < right.length; i++) {
              correct_pairs[left[i]] = right[i]
            }
            return {
              ...base,
              answers: [],
              extra_data: {
                left_column: left,
                right_column: right,
                correct_pairs,
              },
            }
          }

          return { ...base, answers: [] }
        }),
      })
      const sessionQuiz = await quizzesApi.launchQuiz(session.id, quiz.id)
      setLaunchedQuizzes(prev => [...prev, { ...sessionQuiz, title: newQuizTitle }])
      setCreateQuizOpen(false)
      setNewQuizTitle('')
      setNewQuizQuestions([{ id: Date.now().toString(), text: '', type: 'SINGLE', timer: 30, points: 1, answers: [{ text: '', is_correct: true }, { text: '', is_correct: false }], orderingItems: ['', '', ''], matchingLeft: ['', ''], matchingRight: ['', ''] }])
    } catch (error: any) {
      console.error('Failed to create quiz:', error)
      setCreateQuizError(error?.message || 'Не удалось создать квиз')
    } finally {
      setCreatingQuiz(false)
    }
  }

  const handleLaunchTemplateQuiz = async (quiz: Quiz) => {
    if (!session || launchingTemplateId) return
    setLaunchingTemplateId(quiz.id)
    try {
      const sessionQuiz = await quizzesApi.launchQuiz(session.id, quiz.id)
      setLaunchedQuizzes(prev => [...prev, { ...sessionQuiz, title: quiz.title }])
      setTemplateQuizOpen(false)
    } catch (error) {
      console.error('Failed to launch quiz:', error)
    } finally {
      setLaunchingTemplateId(null)
    }
  }

  const handleEndQuiz = async () => {
    if (!session) return
    try {
      await quizzesApi.endQuiz(session.id)
      setLaunchedQuizzes(prev => prev.map(q => q.ended_at ? q : { ...q, ended_at: new Date().toISOString() }))
      setActiveQuizData(null)
    } catch (error) {
      console.error('Failed to end quiz:', error)
    }
  }

  const handleViewSubmissions = async (sessionQuizId: string, title: string) => {
    setSubmissionsTitle(title)
    setSubmissionsOpen(true)
    setSubmissionsLoading(true)
    setSubmissionsData(null)
    setExpandedStudent(null)
    try {
      const data = await quizzesApi.getSubmissionsDetails(sessionQuizId)
      setSubmissionsData(data)
    } catch (error) {
      console.error('Failed to load submissions:', error)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const handleQuickPoll = async () => {
    if (!pollQuestion || !session || creatingPoll) return
    setCreatingPoll(true)
    try {
      const quiz = await quizzesApi.createQuiz({ title: pollQuestion, description: 'Быстрый опрос' })
      if (pollType === 'options' && pollOptions.some(o => o.trim())) {
        await quizzesApi.updateQuiz(quiz.id, {
          title: pollQuestion,
          questions: [{
            text: pollQuestion,
            type: 'SINGLE',
            timer: 60,
            points: 1,
            order_index: 0,
            answers: pollOptions.filter(o => o.trim()).map((o, i) => ({ text: o, is_correct: i === 0 })),
          }],
        })
      } else {
        await quizzesApi.updateQuiz(quiz.id, {
          title: pollQuestion,
          questions: [{
            text: pollQuestion,
            type: 'TEXT',
            timer: 120,
            points: 1,
            order_index: 0,
            answers: [],
          }],
        })
      }
      const sessionQuiz = await quizzesApi.launchQuiz(session.id, quiz.id)
      setLaunchedQuizzes(prev => [...prev, { ...sessionQuiz, title: pollQuestion }])
      setQuickPollOpen(false)
      setPollQuestion('')
      setPollOptions(['', ''])
      setPollType('options')
    } catch (error) {
      console.error('Failed to create poll:', error)
    } finally {
      setCreatingPoll(false)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Загрузка...</p>
      </div>
    )
  }

  const reactionsList = [
    { key: 'THUMBS_UP', name: 'Понятно', icon: <ThumbsUp className="w-5 h-5" />, count: reactions.THUMBS_UP },
    { key: 'CONFUSED', name: 'Непонятно', icon: <HelpCircle className="w-5 h-5" />, count: reactions.CONFUSED },
    { key: 'THINKING', name: 'Интересно', icon: <Lightbulb className="w-5 h-5" />, count: reactions.THINKING },
    { key: 'HEART', name: 'Нравится', icon: <Heart className="w-5 h-5" />, count: reactions.HEART },
  ]

  const activeQuiz = launchedQuizzes.find(q => !q.ended_at)

  return (
    <div className="flex gap-8 p-8 min-h-screen">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Активная сессия</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-500 font-mono">{elapsed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-500">{participants.length} участников</span>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                {session.access_code}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <QrCode className="w-4 h-4" /> QR / Ссылка
            </button>
            <button
              onClick={() => setEndModalOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Завершить сессию
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setCreateQuizOpen(true)}
            className="px-6 py-3 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Создать квиз
          </button>
          <button
            onClick={() => setTemplateQuizOpen(true)}
            className="px-6 py-3 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Квиз из шаблона
          </button>
          <button
            onClick={() => setQuickPollOpen(true)}
            className="px-6 py-3 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Быстрый опрос
          </button>
        </div>

        {/* Launched quizzes OR waiting message */}
        {launchedQuizzes.length > 0 ? (
          <div className="flex flex-col gap-4 flex-1">
            {activeQuiz && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">{activeQuiz.title || 'Квиз запущен'}</p>
                    <p className="text-xs text-emerald-600">Идёт прямо сейчас</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewSubmissions(activeQuiz.id, activeQuiz.title || 'Квиз')}
                    className="flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 bg-white rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Ответы
                  </button>
                  <button
                    onClick={handleEndQuiz}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <Square className="w-4 h-4" /> Завершить квиз
                  </button>
                </div>
              </div>
            )}

            {/* Show active quiz questions (teacher view) */}
            {activeQuizData && activeQuizData.questions.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-zinc-900">Вопросы квиза: {activeQuizData.title}</h3>
                {activeQuizData.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-zinc-400">Вопрос {idx + 1} · {q.type} · {q.points} б. · {q.timer}с</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 mb-2">{q.text}</p>
                    {q.answers.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {q.answers.map((a) => (
                          <div key={a.id} className={`text-xs px-3 py-2 rounded-lg ${a.is_correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-50 text-zinc-600 border border-zinc-100'}`}>
                            {a.is_correct && '✓ '}{a.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-900">Запущенные квизы ({launchedQuizzes.length})</h3>
              {launchedQuizzes.map((q, idx) => (
                <div key={q.id} className={`border rounded-lg p-4 flex items-center justify-between ${q.ended_at ? 'bg-zinc-50 border-zinc-100' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-400 w-4">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{q.title || `Квиз #${idx + 1}`}</p>
                      <p className="text-xs text-zinc-400">
                        {q.ended_at ? 'Завершён' : 'Активен'}
                        {' · '}{new Date(q.launched_at || q.started_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPollChartModalId(q.id)}
                      className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-2 py-1 rounded hover:bg-zinc-50 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" /> Диаграмма
                    </button>
                    <button
                      onClick={() => handleViewSubmissions(q.id, q.title || `Квиз #${idx + 1}`)}
                      className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-2 py-1 rounded hover:bg-zinc-50 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Ответы
                    </button>
                    {q.ended_at ? (
                      <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded">Завершён</span>
                    ) : (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium">Активен</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 rounded-lg flex-1 flex flex-col items-center justify-center gap-2 min-h-[300px]">
            <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">Ожидание следующего вопроса</p>
            <p className="text-xs text-zinc-400">Нажмите "Создать квиз" чтобы начать</p>
          </div>
        )}
      </div>

      <div className="w-[400px] flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Участники ({participants.length})</h3>
          </div>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            {participants.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">Пока нет участников</p>
            ) : (
              [...participants]
                .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
                .slice(0, 10)
                .map((p, idx) => (
                <div key={p.id} className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-zinc-400 w-4">{idx + 1}</span>
                    <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                      {getInitials(p.student_name)}
                    </div>
                    <span className="text-sm font-medium text-zinc-900 truncate">{p.student_name}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-full px-2.5 py-1 shrink-0">
                    {p.total_score ?? 0} б.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-900">Реакции</h3>
          <div className="grid grid-cols-2 gap-3">
            {reactionsList.map((r) => (
              <div key={r.key} className="bg-white border border-zinc-200 rounded-lg px-3 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-600">
                  {r.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500">{r.name}</span>
                  <span className="text-lg font-semibold text-zinc-900">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Код доступа">
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <QRCodeSVG
              value={`${window.location.origin}/join?code=${session.access_code}`}
              size={192}
              bgColor="#ffffff"
              fgColor="#18181b"
              level="M"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-2">Код доступа:</p>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-4xl font-bold text-zinc-900 tracking-wider">{session.access_code}</span>
              <button onClick={copyAccessCode} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-zinc-400" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-400 text-center">
            Студенты могут присоединиться по адресу {window.location.origin}/join
          </p>
        </div>
      </Modal>

      {/* End Session Modal */}
      <Modal open={endModalOpen} onClose={() => setEndModalOpen(false)} title="Завершить сессию?">
        <p className="text-sm text-zinc-600 mb-4">
          Вы уверены, что хотите завершить сессию? Все участники будут отключены.
        </p>
        {endError && <p className="text-sm text-red-500 mb-4">{endError}</p>}
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setEndModalOpen(false)} disabled={endingSession}>
            Отмена
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleEndSession} disabled={endingSession}>
            {endingSession ? 'Завершение...' : 'Завершить'}
          </Button>
        </div>
      </Modal>

      {/* Create Quiz Modal (mini constructor) */}
      <Modal open={createQuizOpen} onClose={() => { if (!creatingQuiz) { setCreateQuizOpen(false); setCreateQuizError('') } }} title="Создать квиз">
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {createQuizError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{createQuizError}</p>}
          <Input
            label="Название квиза"
            placeholder="Введите название"
            value={newQuizTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewQuizTitle(e.target.value)}
          />
          {newQuizQuestions.map((q, qIdx) => (
            <div key={qIdx} className="bg-zinc-50 rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">Вопрос {qIdx + 1}</span>
                {newQuizQuestions.length > 1 && (
                  <button onClick={() => removeQuestion(qIdx)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                placeholder="Текст вопроса"
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
              />
              <div className="flex gap-2 flex-wrap items-center">
                <select
                  className="flex-1 min-w-0 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none bg-white"
                  value={q.type}
                  onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                >
                  <option value="SINGLE">Один ответ</option>
                  <option value="MULTIPLE">Несколько ответов</option>
                  <option value="BOOLEAN">Верно/Неверно</option>
                  <option value="TEXT">Текстовый ответ</option>
                  <option value="FILE">Загрузка файла</option>
                  <option value="ORDERING">Упорядочивание</option>
                  <option value="MATCHING">Соответствие</option>
                </select>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-xs text-zinc-600 whitespace-nowrap">Таймер:</label>
                  <input
                    type="number"
                    min={0}
                    className="w-14 px-2 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none text-center"
                    placeholder="30"
                    value={q.timer}
                    onChange={(e) => updateQuestion(qIdx, 'timer', parseInt(e.target.value) || 30)}
                  />
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-xs text-zinc-600 whitespace-nowrap">Баллы:</label>
                  <input
                    type="number"
                    min={1}
                    className="w-14 px-2 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none text-center"
                    placeholder="1"
                    value={q.points}
                    onChange={(e) => updateQuestion(qIdx, 'points', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              {(q.type === 'SINGLE' || q.type === 'MULTIPLE') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-900 tracking-wide">Варианты ответа</label>
                  {q.answers.map((a, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2">
                      <input
                        type={q.type === 'SINGLE' ? 'radio' : 'checkbox'}
                        name={`correct_${qIdx}`}
                        checked={a.is_correct}
                        onChange={() => {
                          const updated = [...newQuizQuestions]
                          if (q.type === 'SINGLE') {
                            updated[qIdx].answers.forEach((ans, i) => ans.is_correct = i === aIdx)
                          } else {
                            updated[qIdx].answers[aIdx].is_correct = !updated[qIdx].answers[aIdx].is_correct
                          }
                          setNewQuizQuestions(updated)
                        }}
                        className="accent-zinc-900"
                      />
                      <input
                        className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder={`Вариант ${aIdx + 1}`}
                        value={a.text}
                        onChange={(e) => updateAnswer(qIdx, aIdx, 'text', e.target.value)}
                      />
                      {q.answers.length > 2 && (
                        <button onClick={() => removeAnswer(qIdx, aIdx)} className="text-zinc-400 hover:text-zinc-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAnswer(qIdx)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"
                  >
                    <Plus className="w-3 h-3" /> Добавить вариант
                  </button>
                </div>
              )}
              {q.type === 'BOOLEAN' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-900 tracking-wide">Правильный ответ</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`boolean_correct_${qIdx}`}
                        checked={q.answers[0]?.is_correct === true}
                        onChange={() => {
                          const updated = [...newQuizQuestions]
                          updated[qIdx].answers = [{ text: 'Верно', is_correct: true }, { text: 'Неверно', is_correct: false }]
                          setNewQuizQuestions(updated)
                        }}
                        className="accent-zinc-900"
                      />
                      <span className="text-sm text-zinc-700">Верно</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`boolean_correct_${qIdx}`}
                        checked={q.answers[1]?.is_correct === true}
                        onChange={() => {
                          const updated = [...newQuizQuestions]
                          updated[qIdx].answers = [{ text: 'Верно', is_correct: false }, { text: 'Неверно', is_correct: true }]
                          setNewQuizQuestions(updated)
                        }}
                        className="accent-zinc-900"
                      />
                      <span className="text-sm text-zinc-700">Неверно</span>
                    </label>
                  </div>
                </div>
              )}
              {q.type === 'MATCHING' && (
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-900">Левый столбец</label>
                    {(q.matchingLeft || []).map((v, i) => (
                      <input
                        key={i}
                        className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder={`Элемент ${i + 1}`}
                        value={v}
                        onChange={(e) => updateMatchingLeft(qIdx, i, e.target.value)}
                      />
                    ))}
                    <button
                      onClick={() => addMatchingLeft(qIdx)}
                      className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"
                    >
                      <Plus className="w-3 h-3" /> Добавить
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-900">Правый столбец</label>
                    {(q.matchingRight || []).map((v, i) => (
                      <input
                        key={i}
                        className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder={`Элемент ${i + 1}`}
                        value={v}
                        onChange={(e) => updateMatchingRight(qIdx, i, e.target.value)}
                      />
                    ))}
                    <button
                      onClick={() => addMatchingRight(qIdx)}
                      className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"
                    >
                      <Plus className="w-3 h-3" /> Добавить
                    </button>
                  </div>
                </div>
              )}
              {q.type === 'ORDERING' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-900">Элементы (в правильном порядке)</label>
                  {(q.orderingItems || []).map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 w-4">{i + 1}</span>
                      <input
                        className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder={`Элемент ${i + 1}`}
                        value={v}
                        onChange={(e) => updateOrderingItem(qIdx, i, e.target.value)}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addOrderingItem(qIdx)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"
                  >
                    <Plus className="w-3 h-3" /> Добавить
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 py-2 border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Добавить вопрос
          </button>
        </div>
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setCreateQuizOpen(false)} disabled={creatingQuiz}>
            Отмена
          </Button>
          <Button className="flex-1" onClick={handleCreateQuiz} disabled={creatingQuiz || !newQuizTitle.trim()}>
            {creatingQuiz ? 'Создание...' : 'Создать и запустить'}
          </Button>
        </div>
      </Modal>

      {/* Template Quiz Modal */}
      <Modal open={templateQuizOpen} onClose={() => setTemplateQuizOpen(false)} title="Квиз из шаблона">
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          {quizzes.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Нет сохранённых квизов</p>
          ) : quizzes.map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => handleLaunchTemplateQuiz(quiz)}
              disabled={launchingTemplateId !== null}
              className="border border-zinc-200 rounded-lg p-4 text-left hover:bg-zinc-50 transition-colors flex items-center justify-between group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900">{quiz.title}</p>
                <p className="text-xs text-zinc-400">{quiz.description || 'Без описания'}</p>
              </div>
              {launchingTemplateId === quiz.id ? (
                <span className="text-xs text-zinc-500">Запуск...</span>
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setTemplateQuizOpen(false)}>
            Закрыть
          </Button>
        </div>
      </Modal>

      {/* Quick Poll Modal */}
      <Modal open={quickPollOpen} onClose={() => setQuickPollOpen(false)} title="Быстрый опрос">
        <div className="flex flex-col gap-4">
          <Input
            label="Вопрос"
            placeholder="Введите вопрос для опроса"
            value={pollQuestion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollQuestion(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setPollType('options')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                pollType === 'options' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              С вариантами
            </button>
            <button
              onClick={() => setPollType('open')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                pollType === 'open' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              Открытый вопрос
            </button>
          </div>
          {pollType === 'options' && (
            <div className="flex flex-col gap-2">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-4">{idx + 1}.</span>
                  <input
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    placeholder={`Вариант ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions]
                      updated[idx] = e.target.value
                      setPollOptions(updated)
                    }}
                  />
                  {pollOptions.length > 2 && (
                    <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="text-zinc-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 py-1"
              >
                <Plus className="w-3 h-3" /> Добавить вариант
              </button>
            </div>
          )}
          {pollType === 'open' && (
            <p className="text-xs text-zinc-400">Студенты смогут ввести свой ответ в текстовое поле.</p>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setQuickPollOpen(false)} disabled={creatingPoll}>
            Отмена
          </Button>
          <Button className="flex-1" onClick={handleQuickPoll} disabled={creatingPoll || !pollQuestion.trim()}>
            {creatingPoll ? 'Запуск...' : 'Запустить опрос'}
          </Button>
        </div>
      </Modal>

      {/* Submissions Modal (Teacher view of student answers) */}
      <Modal
        open={submissionsOpen}
        onClose={() => setSubmissionsOpen(false)}
        title={`Ответы студентов: ${submissionsTitle}`}
        width="w-[760px]"
      >
        <div className="flex flex-col gap-3">
          {submissionsLoading ? (
            <p className="text-center py-8 text-zinc-500">Загрузка...</p>
          ) : !submissionsData || submissionsData.submissions.length === 0 ? (
            <p className="text-center py-8 text-zinc-500">Пока нет отправленных ответов</p>
          ) : (
            submissionsData.submissions.map((sub) => {
              const isExpanded = expandedStudent === sub.id
              return (
                <div key={sub.id} className="border border-zinc-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedStudent(isExpanded ? null : sub.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                        {getInitials(sub.student_name)}
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-medium text-zinc-900 truncate">{sub.student_name}</span>
                        <span className="text-xs text-zinc-400">{new Date(sub.submitted_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-zinc-900">{sub.score} б.</span>
                      <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-3 flex flex-col gap-3">
                      {sub.answers.map((a, idx) => (
                        <div key={a.question_id} className="bg-white border border-zinc-200 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs font-medium text-zinc-500">Вопрос {idx + 1} · {a.type}</p>
                            {a.is_correct === true && (
                              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Верно</span>
                            )}
                            {a.is_correct === false && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Неверно</span>
                            )}
                            {a.is_correct === null && (
                              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">Ручная проверка</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-zinc-900 mb-2">{a.question_text}</p>
                          {a.type === 'FILE' ? (
                            a.file_url ? (
                              <a
                                href={`${FILES_ORIGIN}${a.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded px-3 py-2 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                {a.file_name || 'Скачать файл'}
                              </a>
                            ) : (
                              <p className="text-xs text-zinc-400 italic">{a.file_name || 'Файл не загружен'}</p>
                            )
                          ) : a.answer_texts.length === 0 || (a.answer_texts.length === 1 && !a.answer_texts[0]) ? (
                            <p className="text-xs text-zinc-400 italic">Нет ответа</p>
                          ) : (
                            <ul className="flex flex-col gap-1">
                              {a.answer_texts.map((txt, i) => (
                                <li key={i} className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-100 rounded px-2 py-1">{txt || '—'}</li>
                              ))}
                            </ul>
                          )}
                          {a.type === 'ORDERING' && a.correct_order && a.correct_order.length > 0 && a.is_correct === false && (
                            <p className="text-xs text-zinc-500 mt-2">Правильный порядок: {a.correct_order.join(' → ')}</p>
                          )}
                          {a.type === 'MATCHING' && a.correct_pairs && Object.keys(a.correct_pairs).length > 0 && a.is_correct === false && (
                            <p className="text-xs text-zinc-500 mt-2">
                              Правильные пары: {Object.entries(a.correct_pairs).map(([k, v]) => `${k} → ${v}`).join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setSubmissionsOpen(false)}>
            Закрыть
          </Button>
        </div>
      </Modal>

      {/* Poll Chart Modal */}
      <Modal
        open={!!pollChartModalId}
        onClose={() => setPollChartModalId(null)}
        title="Диаграмма ответов"
      >
        {pollChartModalId && (
          <div className="py-2">
            <PollChart sessionQuizId={pollChartModalId} pollInterval={3000} />
          </div>
        )}
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setPollChartModalId(null)}>
            Закрыть
          </Button>
        </div>
      </Modal>
    </div>
  )
}
