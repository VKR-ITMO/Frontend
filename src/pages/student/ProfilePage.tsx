import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Layers, GraduationCap, Users, BookMarked,
  Trophy, FileCheck, Target, Award, Lock, ChevronLeft, ChevronRight,
} from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import ActivityItem from '../../components/ui/ActivityItem'
import { useAuth } from '../../contexts/AuthContext'
import { usersApi } from '../../api/users'
import { coursesApi } from '../../api/courses'
import type { StudentStats, Course, Achievement } from '../../api/types'

const ACHIEVEMENT_DEFS: {
  type: string
  title: string
  description: string
  Icon: React.ElementType
}[] = [
  { type: 'first_course',  title: 'Студент',          description: 'Записался на первый курс',       Icon: BookOpen      },
  { type: 'courses_3',     title: 'Многозадачность',   description: 'Записался на 3 курса',           Icon: Layers        },
  { type: 'first_lecture', title: 'Первый шаг',        description: 'Посетил первую лекцию',          Icon: GraduationCap },
  { type: 'lectures_5',    title: 'Постоянный гость',  description: 'Посетил 5 лекций',              Icon: Users         },
  { type: 'lectures_10',   title: 'Завсегдатай',       description: 'Посетил 10 лекций',             Icon: BookMarked    },
  { type: 'lectures_25',   title: 'Ветеран',           description: 'Посетил 25 лекций',             Icon: Trophy        },
  { type: 'first_quiz',    title: 'Первый квиз',       description: 'Прошёл первый квиз',            Icon: FileCheck     },
  { type: 'quizzes_5',     title: 'Опытный',           description: 'Прошёл 5 квизов',              Icon: Target        },
  { type: 'quizzes_10',    title: 'Профессионал',      description: 'Прошёл 10 квизов',             Icon: Award         },
]

export default function StudentProfilePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const [statsData, coursesData, achievementsData] = await Promise.all([
          usersApi.getStudentStats(user.id).catch(() => null),
          coursesApi.getCourses('STUDENT').catch(() => []),
          usersApi.getAchievements(user.id).catch(() => []),
        ])
        setStats(statsData)
        setCourses(coursesData)
        setAchievements(achievementsData)
      } catch (error) {
        console.error('Failed to load profile data:', error)
      }
    }
    loadData()
  }, [user])

  const earnedTypes = new Set(achievements.map(a => a.type))

  const scroll = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' })
  }

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

        {/* Achievements carousel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Достижения</h2>
            <span className="text-xs text-zinc-400">{achievements.length} / {ACHIEVEMENT_DEFS.length}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </button>
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {ACHIEVEMENT_DEFS.map((def) => {
                const earned = earnedTypes.has(def.type)
                const earnedAt = achievements.find(a => a.type === def.type)?.earned_at
                return (
                  <div
                    key={def.type}
                    className={`flex-none w-40 rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                      earned
                        ? 'bg-white border-zinc-200 shadow-sm'
                        : 'bg-zinc-50 border-zinc-100 opacity-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      earned ? 'bg-zinc-900' : 'bg-zinc-200'
                    }`}>
                      {earned
                        ? <def.Icon className="w-4 h-4 text-white" />
                        : <Lock className="w-4 h-4 text-zinc-400" />
                      }
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-zinc-900 leading-tight">{def.title}</p>
                      <p className="text-[11px] text-zinc-400 leading-snug">{def.description}</p>
                    </div>
                    {earned && earnedAt && (
                      <p className="text-[10px] text-zinc-300 mt-auto">
                        {new Date(earnedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
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
