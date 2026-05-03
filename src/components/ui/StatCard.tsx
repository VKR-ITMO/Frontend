interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
}

export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4 flex-1 flex flex-col gap-1">
      {icon && <div className="mb-1">{icon}</div>}
      <span className="text-2xl font-semibold text-zinc-900">{value}</span>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  )
}
