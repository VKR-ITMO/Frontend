import { useState } from 'react'
import CourseCard from '../../components/ui/CourseCard'

export default function StudentCoursesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')

  const filters = ['Все', 'Активные', 'Завершенные']

  const courses = [
    {
      id: 1,
      title: 'Введение в программирование',
      description: 'Основы программирования на Python для начинающих',
      teacher: 'Иван Петров',
      nextLecture: 'Следующая лекция: Пн, 10:00',
    },
    {
      id: 2,
      title: 'Базы данных',
      description: 'Проектирование и управление базами данных',
      teacher: 'Мария Сидорова',
      nextLecture: 'Следующая лекция: Вт, 14:00',
    },
    {
      id: 3,
      title: 'Алгоритмы',
      description: 'Структуры данных и алгоритмы',
      teacher: 'Алексей Козлов',
      nextLecture: 'Следующая лекция: Ср, 12:00',
    },
    {
      id: 4,
      title: 'Физра',
      description: 'Физическая культура и спорт',
      teacher: 'Петр Смирнов',
      nextLecture: 'Следующая лекция: Чт, 16:00',
    },
    {
      id: 5,
      title: 'Машинное обучение',
      description: 'Введение в ML и нейронные сети',
      teacher: 'Елена Иванова',
      nextLecture: 'Следующая лекция: Пт, 10:00',
    },
    {
      id: 6,
      title: 'Веб-разработка',
      description: 'Полный стек веб-разработки',
      teacher: 'Дмитрий Волков',
      nextLecture: 'Следующая лекция: Сб, 09:00',
    },
  ]

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

      <div className="grid grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            teacher={course.teacher}
            nextLecture={course.nextLecture}
            linkTo={`/student/courses/${course.id}`}
          />
        ))}
      </div>
    </div>
  )
}
