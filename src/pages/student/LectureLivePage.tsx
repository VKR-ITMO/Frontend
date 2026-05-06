import { useState } from 'react'
import { Clock, ThumbsUp, HelpCircle, Star, Frown } from 'lucide-react'

const reactionButtons = [
  { key: 'clear', label: 'Понятно', icon: ThumbsUp },
  { key: 'unclear', label: 'Непонятно', icon: HelpCircle },
  { key: 'interesting', label: 'Интересно', icon: Star },
  { key: 'boring', label: 'Скучно', icon: Frown },
]

export default function LectureLivePage() {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [elapsed] = useState('00:42:18')

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-zinc-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Основы программирования на Python</h1>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-500 font-mono">{elapsed}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-red-600">Прямой эфир</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600">Ожидание следующего вопроса</p>
          <p className="text-xs text-zinc-400">Преподаватель скоро запустит квиз</p>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-8 py-4 flex items-center justify-center gap-6">
        {reactionButtons.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedReaction(selectedReaction === key ? null : key)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              selectedReaction === key ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
