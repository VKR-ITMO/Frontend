import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, BookOpen, Users, Clock } from 'lucide-react'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi } from '../../api/courses'
import { sessionsApi } from '../../api/sessions'
import type { CourseWithStats, CompletedSession } from '../../api/types'

export default function TeacherProfilePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [sessionHistory, setSessionHistory] = useState<CompletedSession[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, historyData] = await Promise.all([
          coursesApi.getCourses('TEACHER').catch(() => []),
          sessionsApi.getSessionHistory().catch(() => []),
        ])
        setCourses(coursesData as CourseWithStats[])
        setSessionHistory(historyData)
      } catch (error) {
        console.error('Failed to load profile data:', error)
      }
    }
    loadData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const totalStudents = courses.reduce((sum, c) => sum + ((c as any).total_students || 0), 0)
  const totalHours = Math.round(sessionHistory.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 3600)

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-8 p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-bold text-zinc-600">
            {user ? getInitials(user.full_name) : '??'}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900">{user?.full_name || 'Загрузка...'}</h1>
            <p className="text-sm text-zinc-400">Преподаватель</p>
            <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
              <Mail className="w-4 h-4" />
              <span>{user?.email || '—'}</span>
            </div>
          </div>
        </div>
        <Link to="/teacher/profile/edit">
          <Button variant="secondary">Редактировать</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Курсы" value={String(courses.length)} icon={<BookOpen className="w-5 h-5 text-zinc-400" />} />
        <StatCard label="Студенты" value={String(totalStudents)} icon={<Users className="w-5 h-5 text-zinc-400" />} />
        <StatCard label="Сессий проведено" value={String(sessionHistory.length)} icon={<Clock className="w-5 h-5 text-zinc-400" />} />
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Мои курсы</h2>
        <div className="flex flex-col gap-3">
          {courses.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">Нет курсов</p>
          ) : courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
              <span className="text-sm font-medium text-zinc-900">{c.name}</span>
              <span className="text-xs text-zinc-400">{(c as any).total_students || 0} студентов</span>
            </div>
          ))}
        </div>
      </div>

      {sessionHistory.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Последние сессии</h2>
          <div className="flex flex-col gap-3">
            {sessionHistory.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                <span className="text-sm font-medium text-zinc-900">
                  {new Date(s.started_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400">{s.total_participants} участников</span>
                  <span className="text-xs text-zinc-400">{Math.round(s.duration_seconds / 60)} мин</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      <div className="flex items-center justify-center py-6">
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}
