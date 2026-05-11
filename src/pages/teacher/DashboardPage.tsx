import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi } from '../../api/courses'
import { sessionsApi } from '../../api/sessions'
import type { Course, Session } from '../../api/types'

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, session] = await Promise.all([
        coursesApi.getCourses('teacher'),
        sessionsApi.getActiveSession().catch(() => null)
      ])
      setCourses(coursesData.slice(0, 4))
      setActiveSession(session)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Добро пожаловать, {user?.full_name || 'Преподаватель'}
        </h1>
        <p className="text-base text-zinc-500 mt-1">
          Вот что происходит с вашими курсами сегодня
        </p>
      </div>

      {activeSession && (
        <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm text-green-400 font-medium">Идёт сейчас</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Активная сессия</h2>
            <p className="text-sm text-zinc-400">Код: {activeSession.access_code}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{activeSession.total_participants} участников</span>
            </div>
            <Link to="/teacher/live">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Перейти к управлению →
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Мои курсы</h2>
          <Link to="/teacher/courses" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            Все курсы →
          </Link>
        </div>
        {loading ? (
          <p className="text-center py-4 text-zinc-500">Загрузка...</p>
        ) : courses.length === 0 ? (
          <p className="text-center py-4 text-zinc-500">У вас пока нет курсов</p>
        ) : courses.map((course) => (
          <Link
            key={course.id}
            to={`/teacher/courses/${course.id}`}
            className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between hover:border-zinc-200 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-zinc-900 truncate">{course.name}</span>
              <span className="text-xs text-zinc-400">{course.description || course.code}</span>
            </div>
            <Button variant="secondary" size="sm">Перейти</Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
