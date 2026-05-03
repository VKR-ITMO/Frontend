import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const students = [
  { id: 1, name: 'Иванов Иван', score: 45, total: 50, percent: 90 },
  { id: 2, name: 'Петров Пётр', score: 38, total: 50, percent: 76 },
  { id: 3, name: 'Сидорова Анна', score: 50, total: 50, percent: 100 },
  { id: 4, name: 'Козлов Дмитрий', score: 30, total: 50, percent: 60 },
  { id: 5, name: 'Михайлова Елена', score: 42, total: 50, percent: 84 },
]

export default function GradesDetailPage() {
  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50 min-h-screen">
      <Link to="/teacher/courses/1" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Квиз: Введение</h1>
        <p className="text-sm text-zinc-400 mt-1">3 / 5 сдали · 5 вопросов · 50 баллов</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="grid grid-cols-4 px-6 py-3 border-b border-zinc-100 text-xs font-medium text-zinc-400 uppercase tracking-wider">
          <span>Студент</span>
          <span>Баллы</span>
          <span>Процент</span>
          <span>Статус</span>
        </div>
        {students.map((s) => (
          <div key={s.id} className="grid grid-cols-4 px-6 py-4 border-b border-zinc-50 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                {s.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className="text-sm font-medium text-zinc-900">{s.name}</span>
            </div>
            <span className="text-sm text-zinc-700">{s.score} / {s.total}</span>
            <span className="text-sm text-zinc-700">{s.percent}%</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${s.percent >= 70 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {s.percent >= 70 ? 'Сдал' : 'Не сдал'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
