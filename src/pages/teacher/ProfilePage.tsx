import { Link, useNavigate } from 'react-router-dom'
import { Mail, BookOpen, Users, Clock } from 'lucide-react'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../contexts/AuthContext'

export default function TeacherProfilePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-8 p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-zinc-200" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900">Иван Петров</h1>
            <p className="text-sm text-zinc-400">Преподаватель</p>
            <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
              <Mail className="w-4 h-4" />
              <span>petrov@university.ru</span>
            </div>
          </div>
        </div>
        <Link to="/teacher/profile/edit">
          <Button variant="secondary">Редактировать</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Курсы" value="4" icon={<BookOpen className="w-5 h-5 text-zinc-400" />} />
        <StatCard label="Студенты" value="208" icon={<Users className="w-5 h-5 text-zinc-400" />} />
        <StatCard label="Часы лекций" value="156" icon={<Clock className="w-5 h-5 text-zinc-400" />} />
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">О себе</h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Кандидат технических наук, доцент кафедры информатики. Специализация: алгоритмы, структуры данных, машинное обучение. Опыт преподавания — 12 лет.
        </p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Мои курсы</h2>
        <div className="flex flex-col gap-3">
          {['Основы программирования на Python', 'Алгоритмы и структуры данных', 'Базы данных', 'Машинное обучение'].map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
              <span className="text-sm font-medium text-zinc-900">{c}</span>
              <span className="text-xs text-zinc-400">52 студента</span>
            </div>
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
