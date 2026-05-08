import { useState, useEffect } from 'react'
import CourseCard from '../../components/ui/CourseCard'
import { coursesApi } from '../../api/courses'
import type { Course } from '../../api/types'

export default function StudentCoursesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filters = ['Все', 'Активные', 'Завершенные']

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await coursesApi.getCourses()
      setCourses(data)
    } catch (err) {
      setError('Ошибка загрузки курсов')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Все' || 
      (filter === 'Активные' && course.status === 'ACTIVE') ||
      (filter === 'Завершенные' && course.status === 'ARCHIVED')
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Мои курсы</h1>
        <p className="text-base text-zinc-500 mt-1">Все курсы, на которые вы записаны</p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
        />
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Загрузка...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          {courses.length === 0 ? 'Вы пока не записаны ни на один курс' : 'Курсы не найдены'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.name}
              description={course.description || ''}
              teacher=""
              linkTo={`/student/courses/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
