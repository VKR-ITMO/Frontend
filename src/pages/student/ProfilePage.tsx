import { Link, useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import ActivityItem from '../../components/ui/ActivityItem'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentProfilePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const activities = [
    { subject: 'Информатика', date: '15 Мая, 10:00', score: '85 баллов' },
    { subject: 'Базы данных', date: '14 Мая, 14:00', score: '92 баллов' },
    { subject: 'Алгоритмы', date: '13 Мая, 12:00', score: '78 баллов' },
    { subject: 'Физра', date: '12 Мая, 16:00', score: '100 баллов' },
    { subject: 'Машинное обучение', date: '11 Мая, 10:00', score: '88 баллов' },
  ]

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-10 p-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-zinc-300" />
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Иван Петров</h1>
                <span className="text-sm text-zinc-400">Группа P3255</span>
              </div>
            </div>
            <div className="flex items-center gap-[75px]">
              <span className="text-xs text-zinc-400 tracking-wider">Email</span>
              <span className="text-sm text-zinc-900">ivan.petrov@student.itmo.ru</span>
            </div>
          </div>
          <Link to="/student/profile/edit" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Редактировать
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900">Статистика</h2>
          <div className="flex gap-8">
            <StatCard value={24} label="Посещено лекций" />
            <StatCard value={18} label="Всего курсов" />
            <StatCard value={1250} label="Баллов набрано" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900">История активности</h2>
          <div className="flex flex-col gap-2">
            {activities.map((activity, index) => (
              <ActivityItem
                key={index}
                subject={activity.subject}
                date={activity.date}
                score={activity.score}
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
