import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import ActivityItem from '../../components/ui/ActivityItem'
import { useAuth } from '../../contexts/AuthContext'
import { usersApi } from '../../api/users'
import { coursesApi } from '../../api/courses'
import type { StudentStats, Course } from '../../api/types'

export default function StudentProfilePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const [statsData, coursesData] = await Promise.all([
          usersApi.getStudentStats(user.id).catch(() => null),
          coursesApi.getCourses('STUDENT').catch(() => []),
        ])
        setStats(statsData)
        setCourses(coursesData)
      } catch (error) {
        console.error('Failed to load profile data:', error)
      }
    }
    loadData()
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-10 p-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-xl font-semibold text-zinc-600">
                {user ? getInitials(user.full_name) : '??'}
              </div>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">{user?.full_name || 'Загрузка...'}</h1>
                <span className="text-sm text-zinc-400">Студент</span>
              </div>
            </div>
            <div className="flex items-center gap-[75px]">
              <span className="text-xs text-zinc-400 tracking-wider">Email</span>
              <span className="text-sm text-zinc-900">{user?.email || '—'}</span>
            </div>
          </div>
          <Link to="/student/profile/edit" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Редактировать
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900">Статистика</h2>
          <div className="flex gap-8">
            <StatCard value={stats?.total_lectures_attended ?? 0} label="Посещено лекций" />
            <StatCard value={stats?.total_courses ?? courses.length} label="Всего курсов" />
            <StatCard value={stats?.total_quizzes_taken ?? 0} label="Квизов пройдено" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900">Мои курсы</h2>
          <div className="flex flex-col gap-2">
            {courses.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">Нет курсов</p>
            ) : courses.map((course) => (
              <ActivityItem
                key={course.id}
                subject={course.name}
                date={course.semester}
                score={course.status === 'ACTIVE' ? 'Активен' : 'Архив'}
              />
            ))}
          </div>
        </div>
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
