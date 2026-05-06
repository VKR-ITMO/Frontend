import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ThumbsUp, Heart, Flame, HelpCircle, Lightbulb, HandMetal, LogOut } from 'lucide-react'
import Button from '../../components/ui/Button'
import { wsClient } from '../../api/websocket'
import type { SessionWithLecture, ReactionType, QuizQuestion } from '../../api/types'

interface QuizState {
  quizId: string
  title: string
  questions: QuizQuestion[]
  currentQuestion: number
  timer: number
  answers: Record<string, number>
}

export default function StudentLiveSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionWithLecture | null>(location.state?.session || null)
  const [isConnected, setIsConnected] = useState(false)
  const [quiz, setQuiz] = useState<QuizState | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [sessionEnded, setSessionEnded] = useState(false)

  useEffect(() => {
    if (!session?.access_code) {
      navigate('/join')
      return
    }

    const connectWs = async () => {
      try {
        await wsClient.connect(session.access_code, undefined)
        setIsConnected(true)

        wsClient.on('session:ended', (payload) => {
          setSessionEnded(true)
          console.log('Session ended:', payload)
        })

        wsClient.on('quiz:launched', (payload) => {
          setQuiz({
            quizId: payload.quiz_id,
            title: payload.title,
            questions: payload.questions,
            currentQuestion: 0,
            timer: payload.timer,
            answers: {},
          })
          setQuizResult(null)
        })

        wsClient.on('quiz:result', (payload) => {
          setQuizResult(payload)
          setQuiz(null)
        })

        wsClient.on('quiz:ended', () => {
          setQuiz(null)
        })
      } catch (error) {
        console.error('WebSocket connection failed:', error)
      }
    }

    connectWs()

    return () => {
      wsClient.disconnect()
    }
  }, [session, navigate])

  const sendReaction = (type: ReactionType) => {
    if (sessionId) {
      wsClient.sendReaction(sessionId, type)
    }
  }

  const selectAnswer = (questionId: string, answerId: number) => {
    if (!quiz) return
    setQuiz({
      ...quiz,
      answers: { ...quiz.answers, [questionId]: answerId },
    })
  }

  const submitQuizAnswers = () => {
    if (!quiz) return
    const answers = Object.entries(quiz.answers).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }))
    wsClient.submitQuizAnswers(quiz.quizId, answers)
  }

  const leaveSession = () => {
    if (sessionId) {
      wsClient.leaveSession(sessionId)
    }
    navigate('/')
  }

  if (sessionEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Лекция завершена</h1>
          <p className="text-zinc-500 mb-6">Спасибо за участие!</p>
          {quizResult && (
            <div className="bg-zinc-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-500">Ваш результат</p>
              <p className="text-3xl font-bold text-zinc-900">{quizResult.correct} / {quizResult.total}</p>
              <p className="text-sm text-zinc-400">Баллов: {quizResult.score}</p>
            </div>
          )}
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    )
  }

  if (quiz) {
    const currentQ = quiz.questions[quiz.currentQuestion]
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col">
        <div className="bg-zinc-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-white font-semibold">{quiz.title}</h1>
          <span className="text-zinc-400 text-sm">
            Вопрос {quiz.currentQuestion + 1} из {quiz.questions.length}
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">{currentQ.question}</h2>
            <div className="flex flex-col gap-3">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQ.id, idx)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    quiz.answers[currentQ.id] === idx
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              {quiz.currentQuestion > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion - 1 })}
                >
                  Назад
                </Button>
              )}
              {quiz.currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion + 1 })}
                  className="ml-auto"
                >
                  Далее
                </Button>
              ) : (
                <Button onClick={submitQuizAnswers} className="ml-auto">
                  Отправить
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      <div className="bg-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold">{session?.lecture?.name || 'Лекция'}</h1>
          <p className="text-zinc-400 text-sm">{session?.lecture?.topic}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <button onClick={leaveSession} className="text-zinc-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <p className="text-zinc-400 text-lg">Лекция идёт</p>
          <p className="text-white text-sm mt-2">Отправьте реакцию, чтобы дать обратную связь</p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md">
          <ReactionButton icon={<ThumbsUp />} label="Понятно" onClick={() => sendReaction('thumbsUp')} />
          <ReactionButton icon={<Heart />} label="Нравится" onClick={() => sendReaction('heart')} />
          <ReactionButton icon={<HandMetal />} label="Круто" onClick={() => sendReaction('clap')} />
          <ReactionButton icon={<Lightbulb />} label="Интересно" onClick={() => sendReaction('thinking')} />
          <ReactionButton icon={<HelpCircle />} label="Не понял" onClick={() => sendReaction('confused')} />
          <ReactionButton icon={<Flame />} label="Огонь" onClick={() => sendReaction('fire')} />
        </div>
      </div>

      {quizResult && (
        <div className="bg-zinc-800 px-6 py-4">
          <div className="bg-zinc-700 rounded-lg p-4 text-center">
            <p className="text-zinc-400 text-sm">Результат квиза</p>
            <p className="text-white text-2xl font-bold">{quizResult.correct} / {quizResult.total}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ReactionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-6 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
    >
      <span className="text-white text-2xl">{icon}</span>
      <span className="text-zinc-400 text-xs">{label}</span>
    </button>
  )
}
