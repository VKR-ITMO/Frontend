import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../api/client'

interface LeaderboardEntry {
  student_id: string
  student_name: string
  score: number
  submitted_at: string
}

interface SessionQuiz {
  quiz_id: string
  title: string
  total_submissions: number
  average_score: number
}

export default function GradesDetailPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [sessionQuiz, setSessionQuiz] = useState<SessionQuiz | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizId) {
      loadGrades()
    }
  }, [quizId])

  const loadGrades = async () => {
    try {
      setLoading(true)
      const [leaderboardData, sessionQuizData] = await Promise.all([
        api.get<LeaderboardEntry[]>(`/session-quizzes/${quizId}/leaderboard`),
        api.get<SessionQuiz>(`/session-quizzes/${quizId}`)
      ])
      setLeaderboard(leaderboardData)
      setSessionQuiz(sessionQuizData)
    } catch (error) {
      console.error('Failed to load grades:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50 min-h-screen">
      <Link to="/teacher/courses" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Загрузка...</div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Квиз: {sessionQuiz?.title || 'Результаты'}</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {sessionQuiz?.total_submissions || 0} сдали · Средний балл: {Math.round(sessionQuiz?.average_score || 0)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl">
            {leaderboard.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-500">Пока нет результатов</div>
            ) : (
              <>
                <div className="grid grid-cols-4 px-6 py-3 border-b border-zinc-100 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  <span>Студент</span>
                  <span>Баллы</span>
                  <span>Процент</span>
                  <span>Статус</span>
                </div>
                {leaderboard.map((s) => (
                  <div key={s.student_id} className="grid grid-cols-4 px-6 py-4 border-b border-zinc-50 items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                        {s.student_name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{s.student_name}</span>
                    </div>
                    <span className="text-sm text-zinc-700">{s.score} баллов</span>
                    <span className="text-sm text-zinc-700">{Math.min(100, Math.round(s.score))}%</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${s.score >= 70 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {s.score >= 70 ? 'Сдал' : 'Не сдал'}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
