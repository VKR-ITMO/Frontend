import { useEffect, useState } from 'react'
import { quizzesApi, type PollStats } from '../../api/quizzes'

const COLORS = [
  '#18181b', '#52525b', '#a1a1aa', '#d4d4d8',
  '#71717a', '#3f3f46', '#e4e4e7', '#27272a',
]

function PieChart({ options, total }: { options: PollStats['options']; total: number }) {
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 68
  const innerR = 38

  if (total === 0 || options.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="#f4f4f5" />
          <circle cx={cx} cy={cy} r={innerR} fill="white" />
        </svg>
        <p className="text-xs text-zinc-400">Нет голосов</p>
      </div>
    )
  }

  let cumulativeAngle = -Math.PI / 2
  const slices = options.map((opt, i) => {
    const fraction = opt.count / total
    const angle = fraction * 2 * Math.PI
    const startAngle = cumulativeAngle
    cumulativeAngle += angle
    const endAngle = cumulativeAngle

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const ix1 = cx + innerR * Math.cos(endAngle)
    const iy1 = cy + innerR * Math.sin(endAngle)
    const ix2 = cx + innerR * Math.cos(startAngle)
    const iy2 = cy + innerR * Math.sin(startAngle)

    const largeArc = angle > Math.PI ? 1 : 0
    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')

    return { d, color: COLORS[i % COLORS.length], opt }
  })

  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} />
      ))}
      <circle cx={cx} cy={cy} r={innerR} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#18181b">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#71717a">голосов</text>
    </svg>
  )
}

interface Props {
  sessionQuizId: string
  pollInterval?: number
}

export default function PollChart({ sessionQuizId, pollInterval = 3000 }: Props) {
  const [stats, setStats] = useState<PollStats | null>(null)

  useEffect(() => {
    let active = true
    const fetch = async () => {
      try {
        const data = await quizzesApi.getPollStats(sessionQuizId)
        if (active) setStats(data)
      } catch { /* ignore */ }
    }
    fetch()
    const interval = setInterval(fetch, pollInterval)
    return () => { active = false; clearInterval(interval) }
  }, [sessionQuizId, pollInterval])

  if (!stats) {
    return <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" /></div>
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <PieChart options={stats.options} total={stats.total_votes} />
      <div className="w-full flex flex-col gap-2">
        {stats.options.map((opt, i) => (
          <div key={opt.answer_id} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-900">{opt.text}</span>
                <span className="text-xs text-zinc-400">{opt.count} ({opt.percent}%)</span>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${opt.percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
