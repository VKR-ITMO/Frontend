import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'

const results = [
  { id: 1, question: 'Что такое переменная?', correct: true, answer: 'Именованная область памяти', points: 10 },
  { id: 2, question: 'Что такое цикл?', correct: true, answer: 'Конструкция для повторения', points: 10 },
  { id: 3, question: 'Что такое массив?', correct: false, answer: 'Неверный ответ', points: 0 },
  { id: 4, question: 'Что такое функция?', correct: true, answer: 'Блок кода', points: 10 },
  { id: 5, question: 'Что такое класс?', correct: false, answer: 'Неверный ответ', points: 0 },
]

const totalPoints = results.reduce((s, r) => s + r.points, 0)
const maxPoints = results.length * 10

export default function LectureResultsPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto">
      <Link to="/student/courses/1" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${totalPoints / maxPoints >= 0.7 ? 'bg-green-50' : 'bg-red-50'}`}>
          {totalPoints / maxPoints >= 0.7 ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : (
            <XCircle className="w-10 h-10 text-red-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Результаты квиза</h1>
        <p className="text-lg font-semibold text-zinc-700">{totalPoints} / {maxPoints} баллов</p>
        <p className="text-sm text-zinc-500">
          Правильных ответов: {results.filter((r) => r.correct).length} из {results.length}
        </p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl">
        {results.map((r, idx) => (
          <div key={r.id} className={`px-6 py-4 flex items-center justify-between ${idx < results.length - 1 ? 'border-b border-zinc-50' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                {r.correct ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900">{r.question}</span>
                <span className="text-xs text-zinc-400">{r.answer}</span>
              </div>
            </div>
            <span className={`text-sm font-semibold ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
              +{r.points}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Link to="/student/courses/1"><Button>Вернуться к курсу</Button></Link>
      </div>
    </div>
  )
}
