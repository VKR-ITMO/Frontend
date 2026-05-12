import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, Download } from 'lucide-react'
import Button from '../../components/ui/Button'
import { coursesApi } from '../../api/courses'
import { lecturesApi } from '../../api/lectures'
import { sessionsApi } from '../../api/sessions'
import { materialsApi, type Material } from '../../api/materials'
import type { CourseWithStats, Lecture } from '../../api/types'

export default function StudentCourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Обзор')
  const tabs = ['Обзор', 'Материалы', 'Прогресс']

  const [course, setCourse] = useState<CourseWithStats | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [error, setError] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joiningLecture, setJoiningLecture] = useState<string | null>(null)
  const [activeSessionLectures, setActiveSessionLectures] = useState<Set<string>>(new Set())
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    if (courseId) {
      loadCourseAndEnroll()
    }
  }, [courseId])

  const loadCourseAndEnroll = async () => {
    if (!courseId) return
    try {
      setLoading(true)
      // Try to enroll first (will succeed if not already enrolled)
      setEnrolling(true)
      try {
        await coursesApi.enrollToCourse(courseId)
        setEnrolled(true)
      } catch {
        // Already enrolled or other error - that's fine
        setEnrolled(true)
      }
      setEnrolling(false)

      // Load course data
      const courseData = await coursesApi.getCourse(courseId)
      setCourse(courseData)

      // Load lectures and materials
      try {
        const [lecturesData, materialsData] = await Promise.all([
          lecturesApi.getCourseLectures(courseId),
          materialsApi.getMaterials(courseId).catch(() => [] as Material[])
        ])
        setLectures(lecturesData)
        setMaterials(materialsData)

        // Check which lectures have active sessions
        const activeLectures = new Set<string>()
        await Promise.all(
          lecturesData.map(async (lecture) => {
            try {
              const activeSession = await sessionsApi.getActiveSessionForLecture(lecture.id)
              if (activeSession) {
                activeLectures.add(lecture.id)
              }
            } catch {
              // No active session or error
            }
          })
        )
        setActiveSessionLectures(activeLectures)
      } catch {
        // Student might not have access to lectures list
      }
    } catch (err) {
      console.error('Failed to load course:', err)
      setError('Не удалось загрузить курс')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLecture = async (lectureId: string) => {
    setJoiningLecture(lectureId)
    setJoinError('')
    try {
      const activeSession = await sessionsApi.getActiveSessionForLecture(lectureId)
      if (activeSession) {
        // Session is active, join it directly
        const session = await sessionsApi.joinSession(activeSession.access_code)
        navigate(`/session/${session.id}/live`, { state: { session } })
      } else {
        // No active session, go to waiting page
        navigate(`/student/courses/${courseId}/lecture/waiting`, { state: { lectureId } })
      }
    } catch (error: any) {
      console.error('Failed to join lecture:', error)
      const errorMsg = error?.message || 'Не удалось присоединиться к лекции'
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        setJoinError('Сессия истекла. Войдите снова.')
      } else if (errorMsg.includes('404')) {
        setJoinError('Лекция или сессия не найдена.')
      } else if (errorMsg.includes('403')) {
        setJoinError('Нет доступа к этой лекции.')
      } else if (errorMsg.includes('already in this session')) {
        setJoinError('Вы уже присоединены к этой сессии.')
      } else {
        setJoinError(errorMsg)
      }
    } finally {
      setJoiningLecture(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">{enrolling ? 'Записываемся на курс...' : 'Загрузка...'}</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">{error || 'Курс не найден'}</p>
      </div>
    )
  }

  const upcomingLectures = lectures.filter(l => l.status === 'PUBLISHED')

  return (
    <div className="flex flex-col">
      <div className="border-b border-zinc-200 px-8 py-4">
        <Link to="/student/courses" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Назад к курсам</span>
        </Link>
      </div>

      <div className="p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{course.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{course.description || 'Без описания'}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>{course.total_students} студентов</span>
            <span>{course.total_lectures} лекций</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl">
          <div className="flex border-b border-zinc-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors min-w-[120px] justify-center ${
                  activeTab === tab
                    ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-[1px]'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Обзор' && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">О курсе</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{course.description || 'Описание курса не указано.'}</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>Семестр: {course.semester}</span>
                  <span>Код: {course.code}</span>
                </div>
              </div>

              {upcomingLectures.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-zinc-900">Лекции</h3>
                  {joinError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{joinError}</p>}
                  {upcomingLectures.map((lec) => (
                    <div key={lec.id} className="bg-zinc-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-zinc-900">{lec.name}</span>
                        <span className="text-sm text-zinc-600">{lec.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeSessionLectures.has(lec.id) && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <Clock className="w-3.5 h-3.5" />
                            <span>В эфире</span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleJoinLecture(lec.id)}
                          disabled={joiningLecture === lec.id}
                        >
                          {joiningLecture === lec.id ? 'Подключение...' : 'Присоединиться'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Материалы' && (
            <div className="p-8 flex flex-col gap-3">
              {materials.length === 0 ? (
                <p className="text-center py-4 text-zinc-500">Материалы пока не добавлены</p>
              ) : materials.map((m) => (
                <div key={m.id} className="bg-zinc-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-zinc-900">{m.name}</span>
                    <span className="text-xs text-zinc-500">{m.description || ''}{m.file_size ? ` • ${m.file_size}` : ''}</span>
                  </div>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                      <Download className="w-4 h-4 text-zinc-600" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Прогресс' && (
            <div className="p-8 flex flex-col gap-3">
              <p className="text-center py-4 text-zinc-500">Данные о прогрессе пока отсутствуют</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
