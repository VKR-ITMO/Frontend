import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function StudentDashboardPage() {
  const courses = [
    { id: 1, name: 'Информатика', nextLecture: 'Пн, 10:00' },
    { id: 2, name: 'Базы данных', nextLecture: 'Вт, 14:00' },
    { id: 3, name: 'Алгоритмы', nextLecture: 'Ср, 12:00' },
    { id: 4, name: 'Физра', nextLecture: 'Чт, 16:00' },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Добро пожаловать, Иван Петров
        </h1>
        <p className="text-base text-zinc-500 mt-1">
          Вот что происходит с вашими курсами сегодня
        </p>
      </div>

      {/* Active Session Banner */}
      <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-sm text-green-400 font-medium">Идёт сейчас</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Алгоритмы и структуры данных</h2>
          <p className="text-sm text-zinc-400">Сортировка слиянием</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">47 участников</span>
          </div>
          <Link to="/student/qr">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Перейти к отметке →
            </Button>
          </Link>
        </div>
      </div>

      {/* Courses List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Мои курсы</h2>
          <Link to="/student/courses" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            Все курсы →
          </Link>
        </div>
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/student/courses/${course.id}`}
            className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between hover:border-zinc-200 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-zinc-900 truncate">{course.name}</span>
              <span className="text-xs text-zinc-400">{course.nextLecture}</span>
            </div>
            <Button variant="secondary" size="sm">Перейти</Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
