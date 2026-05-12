import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { quizzesApi, type SessionQuizWithStats } from '../../api/quizzes'
import type { LeaderboardEntry } from '../../api/types'

export default function GradesDetailPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [sessionQuizzes, setSessionQuizzes] = useState<SessionQuizWithStats[]>([])
  const [selectedSessionQuiz, setSelectedSessionQuiz] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizId) {
      loadSessionQuizzes()
    }
  }, [quizId])

  useEffect(() => {
    if (selectedSessionQuiz) {
      loadLeaderboard(selectedSessionQuiz)
    }
  }, [selectedSessionQuiz])

  const loadSessionQuizzes = async () => {
    if (!quizId) return
    try {
      setLoading(true)
      const data = await quizzesApi.getQuizSessionQuizzes(quizId)
      setSessionQuizzes(data)
      if (data.length > 0) {
        setSelectedSessionQuiz(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load session quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async (sessionQuizId: string) => {
    try {
      const data = await quizzesApi.getQuizLeaderboard(sessionQuizId)
      setLeaderboard(data)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
      setLeaderboard([])
    }
  }

  const currentSQ = sessionQuizzes.find(sq => sq.id === selectedSessionQuiz)

  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50 min-h-screen">
      <Link to={courseId ? `/teacher/courses/${courseId}` : '/teacher/courses'} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Загрузка...</div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Квиз: {currentSQ?.title || 'Результаты'}</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {currentSQ?.total_submissions || 0} сдали · Средний балл: {Math.round(currentSQ?.average_score || 0)}
            </p>
          </div>

          {sessionQuizzes.length > 1 && (
            <div className="flex gap-2">
              {sessionQuizzes.map((sq) => (
                <button
                  key={sq.id}
                  onClick={() => setSelectedSessionQuiz(sq.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSessionQuiz === sq.id
                      ? 'bg-zinc-900 text-white'
                      : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {new Date(sq.launched_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          )}

          {sessionQuizzes.length === 0 && (
            <div className="text-center py-12 text-zinc-500">Квиз ещё не запускался в сессиях</div>
          )}

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
