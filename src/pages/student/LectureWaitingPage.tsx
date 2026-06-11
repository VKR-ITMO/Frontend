import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lecturesApi } from '../../api/lectures'
import { sessionsApi } from '../../api/sessions'
import type { Lecture, SessionWithLecture } from '../../api/types'

export default function LectureWaitingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const lectureId = location.state?.lectureId
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!lectureId) {
      setError('Лекция не указана')
      setLoading(false)
      return
    }

    const loadLectureAndCheckSession = async () => {
      try {
        const lectureData = await lecturesApi.getLecture(lectureId)
        setLecture(lectureData)

        // Check for active session
        const activeSession = await sessionsApi.getActiveSessionForLecture(lectureId)
        if (activeSession) {
          // Session is active, join and redirect
          const session = await sessionsApi.joinSession(activeSession.access_code)
          navigate(`/session/${session.id}/live`, { state: { session } })
        }
      } catch (err: any) {
        console.error('Failed to load lecture:', err)
        const errorMsg = err?.message || 'Не удалось загрузить лекцию'
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          setError('Сессия истекла. Войдите снова.')
        } else if (errorMsg.includes('404')) {
          setError('Лекция не найдена.')
        } else if (errorMsg.includes('403')) {
          setError('Нет доступа к этой лекции.')
        } else {
          setError(errorMsg)
        }
      } finally {
        setLoading(false)
      }
    }

    loadLectureAndCheckSession()

    // Poll for session start every 3 seconds
    const pollInterval = setInterval(async () => {
      if (!lectureId) return
      try {
        const activeSession = await sessionsApi.getActiveSessionForLecture(lectureId)
        if (activeSession) {
          clearInterval(pollInterval)
          const session = await sessionsApi.joinSession(activeSession.access_code)
          navigate(`/session/${session.id}/live`, { state: { session } })
        }
      } catch (err: any) {
        const errorMsg = err?.message || ''
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          setJoinError('Сессия истекла. Войдите снова.')
        } else if (errorMsg.includes('already in this session')) {
          setJoinError('Вы уже присоединены к этой сессии.')
        }
        // Other errors are ignored during polling
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [lectureId, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Загрузка...</p>
      </div>
    )
  }

  if (error || !lecture) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-500">{error || 'Лекция не найдена'}</p>
          {joinError && <p className="text-sm text-red-500 mt-2">{joinError}</p>}
          <Link to="/student/courses" className="text-zinc-900 text-sm mt-4 inline-block">
            Вернуться к курсам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <Link 
        to="/student/courses" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад к курсам</span>
      </Link>

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Ожидание начала лекции</h1>
        <p className="text-sm text-zinc-500 text-center max-w-md">
          Преподаватель ещё не начал лекцию. Пожалуйста, подождите — вы автоматически будете подключены.
        </p>
      </div>

      <div className="bg-zinc-50 rounded-xl px-8 py-4 flex flex-col items-center gap-1">
        <p className="text-xs text-zinc-400">Лекция</p>
        <p className="text-sm font-semibold text-zinc-900">{lecture.name}</p>
        <p className="text-xs text-zinc-400 mt-2">Тема</p>
        <p className="text-sm font-medium text-zinc-700">{lecture.topic}</p>
        {lecture.description && (
          <>
            <p className="text-xs text-zinc-400 mt-2">Описание</p>
            <p className="text-sm text-zinc-600 text-center max-w-md">{lecture.description}</p>
          </>
        )}
        {joinError && <p className="text-sm text-red-500 mt-2">{joinError}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-zinc-400">Подключено</span>
      </div>
    </div>
  )
}
