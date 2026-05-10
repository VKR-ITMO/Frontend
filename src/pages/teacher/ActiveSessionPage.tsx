import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QrCode, Clock, Users, Copy, Check } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { sessionsApi } from '../../api/sessions'
import { reactionsApi } from '../../api/reactions'
import { quizzesApi } from '../../api/quizzes'
import type { Session, SessionParticipant, ReactionStats, Quiz } from '../../api/types'

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
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [pollQuestion, setPollQuestion] = useState('')

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
    const interval = setInterval(fetchData, 5000)
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

  const handleEndSession = async () => {
    if (!session) return
    try {
      await sessionsApi.endSession(session.id)
      navigate('/teacher/live')
    } catch (error) {
      console.error('Failed to end session:', error)
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

  const handleCreateQuiz = async () => {
    if (!newQuizTitle || !session) return
    try {
      const quiz = await quizzesApi.createQuiz({ title: newQuizTitle })
      await quizzesApi.launchQuiz(session.id, quiz.id)
      setCreateQuizOpen(false)
      setNewQuizTitle('')
    } catch (error) {
      console.error('Failed to create quiz:', error)
    }
  }

  const handleLaunchTemplateQuiz = async (quizId: string) => {
    if (!session) return
    try {
      await quizzesApi.launchQuiz(session.id, quizId)
      setTemplateQuizOpen(false)
    } catch (error) {
      console.error('Failed to launch quiz:', error)
    }
  }

  const handleQuickPoll = async () => {
    if (!pollQuestion || !session) return
    try {
      const quiz = await quizzesApi.createQuiz({ title: pollQuestion, description: 'Быстрый опрос' })
      await quizzesApi.launchQuiz(session.id, quiz.id)
      setQuickPollOpen(false)
      setPollQuestion('')
    } catch (error) {
      console.error('Failed to create poll:', error)
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
    { key: 'THUMBS_UP', name: 'Понятно', emoji: '👍', count: reactions.THUMBS_UP },
    { key: 'CONFUSED', name: 'Непонятно', emoji: '😕', count: reactions.CONFUSED },
    { key: 'THINKING', name: 'Интересно', emoji: '💡', count: reactions.THINKING },
    { key: 'HEART', name: 'Нравится', emoji: '❤️', count: reactions.HEART },
    { key: 'FIRE', name: 'Огонь', emoji: '🔥', count: reactions.FIRE },
    { key: 'CLAP', name: 'Круто', emoji: '👏', count: reactions.CLAP },
  ]

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

        <div className="bg-zinc-50 rounded-lg flex-1 flex flex-col items-center justify-center gap-2 min-h-[300px]">
          <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600">Ожидание следующего вопроса</p>
          <p className="text-xs text-zinc-400">Нажмите "Создать квиз" чтобы начать</p>
        </div>
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
              participants.slice(0, 10).map((p, idx) => (
                <div key={p.id} className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-400 w-4">{idx + 1}</span>
                    <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600">
                      {getInitials(p.student_name)}
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{p.student_name}</span>
                  </div>
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
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-lg">
                  {r.emoji}
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

      <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Код доступа">
        <div className="flex flex-col items-center gap-6">
          <div className="w-48 h-48 bg-zinc-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-32 h-32 text-zinc-400" />
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
            Студенты могут присоединиться по адресу lecturehub.app/join
          </p>
        </div>
      </Modal>

      <Modal open={endModalOpen} onClose={() => setEndModalOpen(false)} title="Завершить сессию?">
        <p className="text-sm text-zinc-600 mb-4">
          Вы уверены, что хотите завершить сессию? Все участники будут отключены.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setEndModalOpen(false)}>
            Отмена
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleEndSession}>
            Завершить
          </Button>
        </div>
      </Modal>

      <Modal open={createQuizOpen} onClose={() => setCreateQuizOpen(false)} title="Создать квиз">
        <Input 
          label="Название квиза" 
          placeholder="Введите название"
          value={newQuizTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewQuizTitle(e.target.value)}
        />
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setCreateQuizOpen(false)}>
            Отмена
          </Button>
          <Button className="flex-1" onClick={handleCreateQuiz}>
            Создать и запустить
          </Button>
        </div>
      </Modal>

      <Modal open={templateQuizOpen} onClose={() => setTemplateQuizOpen(false)} title="Квиз из шаблона">
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {quizzes.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Нет сохранённых квизов</p>
          ) : quizzes.map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => handleLaunchTemplateQuiz(quiz.id)}
              className="border border-zinc-200 rounded-lg p-4 text-left hover:bg-zinc-50 transition-colors"
            >
              <p className="text-sm font-medium text-zinc-900">{quiz.title}</p>
              <p className="text-xs text-zinc-400">{quiz.description || 'Без описания'}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setTemplateQuizOpen(false)}>
            Закрыть
          </Button>
        </div>
      </Modal>

      <Modal open={quickPollOpen} onClose={() => setQuickPollOpen(false)} title="Быстрый опрос">
        <Input 
          label="Вопрос" 
          placeholder="Введите вопрос для опроса"
          value={pollQuestion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollQuestion(e.target.value)}
        />
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setQuickPollOpen(false)}>
            Отмена
          </Button>
          <Button className="flex-1" onClick={handleQuickPoll}>
            Запустить опрос
          </Button>
        </div>
      </Modal>
    </div>
  )
}
