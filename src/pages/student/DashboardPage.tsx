import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi } from '../../api/courses'
import type { Course } from '../../api/types'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const coursesData = await coursesApi.getCourses()
      setCourses(coursesData.slice(0, 4))
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
          Добро пожаловать, {user?.full_name || 'Студент'}
        </h1>
        <p className="text-base text-zinc-500 mt-1">
          Вот что происходит с вашими курсами сегодня
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Мои курсы</h2>
          <Link to="/student/courses" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            Все курсы →
          </Link>
        </div>
        {loading ? (
          <p className="text-center py-4 text-zinc-500">Загрузка...</p>
        ) : courses.length === 0 ? (
          <p className="text-center py-4 text-zinc-500">Нет курсов</p>
        ) : courses.map((course) => (
          <Link
            key={course.id}
            to={`/student/courses/${course.id}`}
            className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between hover:border-zinc-200 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-zinc-900 truncate">{course.name}</span>
              <span className="text-xs text-zinc-400">{course.description || 'Без описания'}</span>
            </div>
            <Button variant="secondary" size="sm">Перейти</Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
