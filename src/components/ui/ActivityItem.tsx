interface ActivityItemProps {
  subject: string
  date: string
  score?: string
}

export default function ActivityItem({ subject, date, score }: ActivityItemProps) {
  return (
    <div className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-zinc-900 truncate">{subject}</span>
        <span className="text-xs text-zinc-400">{date}</span>
      </div>
      {score && (
        <span className="text-sm font-medium text-zinc-900">{score}</span>
      )}
    </div>
  )
}
