import { Clock } from 'lucide-react'

export default function LectureWaitingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Ожидание начала лекции</h1>
        <p className="text-sm text-zinc-500 text-center max-w-md">
          Преподаватель ещё не начал лекцию. Пожалуйста, подождите — вы автоматически будете подключены.
        </p>
      </div>
      <div className="bg-zinc-50 rounded-xl px-8 py-4 flex flex-col items-center gap-1">
        <p className="text-xs text-zinc-400">Курс</p>
        <p className="text-sm font-semibold text-zinc-900">Основы программирования на Python</p>
        <p className="text-xs text-zinc-400 mt-2">Лекция</p>
        <p className="text-sm font-medium text-zinc-700">Введение в алгоритмы</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-zinc-400">Подключено</span>
      </div>
    </div>
  )
}
