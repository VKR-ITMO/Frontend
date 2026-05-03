import { useState } from 'react'
import CourseCard from '../../components/ui/CourseCard'

export default function TeacherCoursesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')

  const filters = ['Все', 'Активные', 'Завершенные']

  const courses = [
    {
      id: 1,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      studentCount: '52 студентов',
    },
    {
      id: 2,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      studentCount: '52 студентов',
    },
    {
      id: 3,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      studentCount: '52 студентов',
    },
    {
      id: 4,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      studentCount: '52 студентов',
    },
    {
      id: 5,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      studentCount: '52 студентов',
    },
    {
      id: 6,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      studentCount: '52 студентов',
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50 min-h-screen">
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
          className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
        />
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 bg-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            teacher=""
            studentCount={course.studentCount}
            linkTo={`/teacher/courses/${course.id}`}
            buttonLabel="Открыть"
          />
        ))}
      </div>
    </div>
  )
}
