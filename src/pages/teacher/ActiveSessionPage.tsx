import { useState } from 'react'
import { QrCode, Link as LinkIcon, Clock } from 'lucide-react'
import Button from '../../components/ui/Button'

const topParticipants = [
  { rank: 1, initials: 'ИФ', name: 'Имя Фамилия', score: 850 },
  { rank: 2, initials: 'ИФ', name: 'Имя Фамилия', score: 850 },
  { rank: 3, initials: 'ИФ', name: 'Имя Фамилия', score: 850 },
  { rank: 4, initials: 'ИФ', name: 'Имя Фамилия', score: 850 },
  { rank: 5, initials: 'ИФ', name: 'Имя Фамилия', score: 850 },
]

const reactions = [
  { name: 'Понятно', count: 24 },
  { name: 'Непонятно', count: 24 },
  { name: 'Интересно', count: 24 },
  { name: 'Скучно', count: 24 },
]

export default function ActiveSessionPage() {
  const [elapsed] = useState('00:42:18')

  return (
    <div className="flex gap-8 p-8 min-h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Основы программирования на Python</h1>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-500 font-mono">{elapsed}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <QrCode className="w-4 h-4" /> QR / Ссылка
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
              Завершить сессию
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            Создать квиз
          </button>
          <button className="px-6 py-3 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            Квиз из шаблона
          </button>
          <button className="px-6 py-3 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            Быстрый опрос
          </button>
        </div>

        {/* Waiting Area */}
        <div className="bg-zinc-50 rounded-lg flex-1 flex flex-col items-center justify-center gap-2 min-h-[300px]">
          <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600">Ожидание следующего вопроса</p>
          <p className="text-xs text-zinc-400">Преподаватель скоро запустит квиз</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[400px] flex flex-col gap-6">
        {/* Top Participants */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Топ участников</h3>
            <button className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">Полный рейтинг →</button>
          </div>
          <div className="flex flex-col gap-3">
            {topParticipants.map((p) => (
              <div key={p.rank} className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400 w-4">{p.rank}</span>
                  <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600">{p.initials}</div>
                  <span className="text-sm font-medium text-zinc-900">{p.name}</span>
                </div>
                <span className="text-sm font-semibold text-zinc-900">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        {/* Reactions */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-900">Реакции</h3>
          <div className="flex flex-col gap-4">
            {reactions.map((r) => (
              <div key={r.name} className="bg-white border border-zinc-200 rounded-lg px-3 py-3 flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center text-lg">
                  {r.name === 'Понятно' && '👍'}
                  {r.name === 'Непонятно' && '😕'}
                  {r.name === 'Интересно' && '⭐'}
                  {r.name === 'Скучно' && '😴'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">{r.name}</span>
                  <span className="text-xs text-zinc-400">{r.count} реакций</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
