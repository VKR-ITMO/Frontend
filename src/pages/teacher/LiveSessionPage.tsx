import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { coursesApi } from '../../api/courses'
import { lecturesApi } from '../../api/lectures'
import { sessionsApi } from '../../api/sessions'
import type { Course, Lecture } from '../../api/types'

interface CourseWithLectures extends Course {
  lectures: Lecture[]
}

export default function LiveSessionPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseWithLectures[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startingSession, setStartingSession] = useState<string | null>(null)
  const [startError, setStartError] = useState('')
  const [freeLectureModal, setFreeLectureModal] = useState(false)
  const [freeLectureTopic, setFreeLectureTopic] = useState('')
  const [creatingFreeLecture, setCreatingFreeLecture] = useState(false)

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const activeSession = await sessionsApi.getActiveSession()
        if (activeSession) {
          navigate('/teacher/live/active', { state: { session: activeSession } })
          return
        }
      } catch {
        // No active session
      }
    }
    checkActiveSession()
  }, [navigate])

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await coursesApi.getCourses('teacher')
        const coursesWithLectures: CourseWithLectures[] = await Promise.all(
          coursesData.map(async (course) => {
            const lectures = await lecturesApi.getCourseLectures(course.id)
            return { ...course, lectures }
          })
        )
        setCourses(coursesWithLectures)
      } catch (error) {
        console.error('Failed to load courses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCourses()
  }, [])

  const startSession = async (lectureId: string, lectureStatus?: string) => {
    setStartingSession(lectureId)
    setStartError('')
    try {
      if (lectureStatus !== 'PUBLISHED') {
        await lecturesApi.publishLecture(lectureId)
      }
      const session = await sessionsApi.startSession(lectureId)
      navigate('/teacher/live/active', { state: { session } })
    } catch (error: any) {
      console.error('Failed to start session:', error)
      const errorMsg = error?.message || 'Не удалось начать лекцию'
      if (errorMsg.includes('already have an active session')) {
        setStartError('У вас уже есть активная сессия. Сначала завершите её.')
      } else if (errorMsg.includes('not found')) {
        setStartError('Лекция не найдена.')
      } else if (errorMsg.includes('Only teachers')) {
        setStartError('Только преподаватели могут начинать лекции.')
      } else if (errorMsg.includes('own lectures')) {
        setStartError('Вы можете начинать только свои лекции.')
      } else {
        setStartError(errorMsg)
      }
    } finally {
      setStartingSession(null)
    }
  }

  const createFreeLecture = async () => {
    if (!freeLectureTopic.trim()) return
    setCreatingFreeLecture(true)
    setStartError('')
    try {
      const lecture = await lecturesApi.createFreeLecture(freeLectureTopic)
      const session = await sessionsApi.startSession(lecture.id)
      navigate('/teacher/live/active', { state: { session } })
    } catch (error: any) {
      console.error('Failed to create free lecture:', error)
      const errorMsg = error?.message || 'Не удалось создать быструю лекцию'
      if (errorMsg.includes('already have an active session')) {
        setStartError('У вас уже есть активная сессия. Сначала завершите её.')
      } else if (errorMsg.includes('Only teachers')) {
        setStartError('Только преподаватели могут создавать лекции.')
      } else {
        setStartError(errorMsg)
      }
    } finally {
      setCreatingFreeLecture(false)
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-10 w-full max-w-3xl px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Нет активной сессии</h1>
          <p className="text-sm text-zinc-500">Выберите лекцию из одного из ваших курсов или начните быструю лекцию без привязки к курсу</p>
        </div>
        {startError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{startError}</p>}

        <div className="w-full bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-zinc-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900">Быстрая лекция</span>
              <span className="text-xs text-zinc-500">Начать лекцию без привязки к курсу</span>
            </div>
          </div>
          <Button onClick={() => { setStartError(''); setFreeLectureModal(true) }}>Создать</Button>
        </div>

        <div className="h-px bg-zinc-100 w-full" />

        {courses.length === 0 ? (
          <p className="text-sm text-zinc-400">У вас пока нет курсов с лекциями</p>
        ) : (
          <div className="flex flex-col gap-7 w-full">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-col gap-4">
                <button onClick={() => setExpanded(expanded === course.id ? null : course.id)} className="flex items-center justify-between w-full text-left">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-900">{course.name}</span>
                    <div className="flex gap-6 text-xs text-zinc-400">
                      <span>{course.code}</span>
                      <span>{course.lectures.length} лекций</span>
                    </div>
                  </div>
                  {expanded === course.id ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                {expanded === course.id && (
                  <>
                    <div className="h-px bg-zinc-100" />
                    {course.lectures.length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-2">Нет лекций</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {course.lectures.filter(l => l.status === 'PUBLISHED' || l.status === 'DRAFT').map((lec, idx) => (
                          <div key={lec.id} className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-zinc-900 truncate">{lec.topic}</span>
                              <div className="flex gap-4 text-xs text-zinc-400">
                                <span>Лекция {idx + 1}</span>
                                {lec.scheduled_at && (
                                  <>
                                    <span>{formatDate(lec.scheduled_at)}</span>
                                    <span>{formatTime(lec.scheduled_at)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => startSession(lec.id, lec.status)}
                              disabled={startingSession === lec.id}
                            >
                              {startingSession === lec.id ? 'Запуск...' : 'Начать'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={freeLectureModal} onClose={() => { setFreeLectureModal(false); setStartError('') }} title="Быстрая лекция">
        <div className="flex flex-col gap-4">
          {startError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{startError}</p>}
          <Input
            label="Тема лекции"
            placeholder="Введите тему"
            value={freeLectureTopic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeLectureTopic(e.target.value)}
          />
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setFreeLectureModal(false); setStartError('') }}>
              Отмена
            </Button>
            <Button
              className="flex-1"
              onClick={createFreeLecture}
              disabled={creatingFreeLecture || !freeLectureTopic.trim()}
            >
              {creatingFreeLecture ? 'Создание...' : 'Начать'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
