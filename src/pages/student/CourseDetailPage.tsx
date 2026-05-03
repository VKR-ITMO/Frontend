import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'

export default function StudentCourseDetailPage() {
  const { courseId } = useParams()
  const [activeTab, setActiveTab] = useState('Материалы')
  const tabs = ['Материалы', 'Прогресс']

  const materials = [
    { id: 1, title: 'Лекция 1: Введение', description: 'Основные концепции', date: '15 Мая' },
    { id: 2, title: 'Лекция 2: Переменные', description: 'Типы данных и переменные', date: '17 Мая' },
    { id: 3, title: 'Лекция 3: Циклы', description: 'Циклы и итерации', date: '20 Мая' },
  ]

  return (
    <div className="flex flex-col">
      {/* Header with back button */}
      <div className="border-b border-zinc-200 px-8 py-4">
        <Link to="/student/courses" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Назад к курсам</span>
        </Link>
      </div>

      <div className="p-8 flex flex-col gap-8">
        {/* Course Info */}
        <div className="flex flex-col gap-4">
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

          <div className="flex gap-6">
            <StatCard value="24" label="Посещено лекций" />
            <StatCard value="18" label="Всего лекций" />
            <StatCard value="85%" label="Средний балл" />
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-6 border-b border-zinc-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-zinc-900 border-b-2 border-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Materials Tab */}
          {activeTab === 'Материалы' && (
            <div className="flex flex-col gap-3 mt-6">
              {materials.map((material) => (
                <div key={material.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between hover:border-zinc-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-zinc-900">{material.title}</span>
                      <span className="text-xs text-zinc-400">{material.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400">{material.date}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'Прогресс' && (
            <div className="flex flex-col gap-6 mt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Общий прогресс</span>
                  <span className="font-medium text-zinc-900">75%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div className="bg-zinc-900 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="flex gap-6">
                <StatCard value="18/24" label="Лекций посещено" />
                <StatCard value="85%" label="Средний балл" />
                <StatCard value="1250" label="Баллов набрано" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
