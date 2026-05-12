import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function LectureResultsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <Link 
        to="/student/courses" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад к курсам</span>
      </Link>

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Результаты лекции</h1>
        <p className="text-sm text-zinc-500 text-center max-w-md">
          Страница результатов лекции не реализована. Используйте страницу результатов сессии.
        </p>
      </div>

      <div className="bg-zinc-50 rounded-xl px-8 py-4">
        <p className="text-xs text-zinc-400">Для просмотра результатов перейдите на страницу сессии</p>
      </div>
    </div>
  )
}
