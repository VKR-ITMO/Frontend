import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'

interface QuizResult {
  id: string
  title: string
  date: string
  attended: boolean
  score: number
  maxScore: number
}

interface ActiveLecture {
  title: string
  scheduledAt: string
}

export default function StudentCourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Обзор')
  const tabs = ['Обзор', 'Материалы', 'Прогресс']

  const courseDescription = 'Изучение основ программирования на языке Python. Курс охватывает базовые концепции, структуры данных, алгоритмы и объектно-ориентированное программирование.'

  const activeLecture: ActiveLecture | null = {
    title: 'Следующая лекция',
    scheduledAt: '20 декабря в 10:00'
  }

  const materials = [
    { id: 1, title: 'Лекция 1: Введение', size: '2.4 MB', date: '15 Мая' },
    { id: 2, title: 'Лекция 2: Переменные', size: '1.8 MB', date: '17 Мая' },
    { id: 3, title: 'Лекция 3: Циклы', size: '3.1 MB', date: '20 Мая' },
  ]

  const quizResults: QuizResult[] = [
    { id: '1', title: 'Введение в курс', date: '1 сентября 2024 г.', attended: true, score: 50, maxScore: 50 },
    { id: '2', title: 'Переменные и типы данных', date: '8 сентября 2024 г.', attended: true, score: 45, maxScore: 50 },
    { id: '3', title: 'Циклы и условия', date: '15 сентября 2024 г.', attended: true, score: 48, maxScore: 50 },
  ]

  const handleJoinLecture = () => {
    navigate(`/student/courses/${courseId}/lecture/waiting`)
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-zinc-200 px-8 py-4">
        <Link to="/student/courses" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Назад к курсам</span>
        </Link>
      </div>

      <div className="p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Введение в программирование</h1>
            <p className="text-sm text-zinc-500 mt-1">Основы программирования на Python</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-300" />
            <div>
              <p className="text-sm font-medium text-zinc-900">Иван Петров</p>
              <p className="text-xs text-zinc-400">Преподаватель</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl">
          <div className="flex border-b border-zinc-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors min-w-[120px] justify-center ${
                  activeTab === tab
                    ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-[1px]'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Обзор' && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">О курсе</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{courseDescription}</p>
              </div>

              {activeLecture && (
                <div className="bg-zinc-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-zinc-900">{activeLecture.title}</span>
                    <span className="text-sm text-zinc-600">{activeLecture.scheduledAt}</span>
                  </div>
                  <Button onClick={handleJoinLecture}>Присоединиться</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Материалы' && (
            <div className="p-8 flex flex-col gap-3">
              {materials.map((material) => (
                <div key={material.id} className="border border-zinc-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900">{material.title}</span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{material.size}</span>
                      <span>•</span>
                      <span>{material.date}</span>
                    </div>
                  </div>
                  <button className="text-sm text-zinc-900 hover:underline">Открыть</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Прогресс' && (
            <div className="p-8 flex flex-col gap-3">
              {quizResults.map((quiz) => (
                <div key={quiz.id} className="border border-zinc-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex flex-col w-40">
                    <span className="text-sm font-medium text-zinc-900 truncate">{quiz.title}</span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{quiz.date}</span>
                      <span>•</span>
                      <span>{quiz.attended ? 'Присутствовал' : 'Отсутствовал'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-900">{quiz.score}/{quiz.maxScore}</span>
                    <span className="text-xs text-zinc-500">баллов</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
