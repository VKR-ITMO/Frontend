interface FeatureCardProps {
  title: string
  description: string
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="border border-zinc-100 px-8 py-14 flex flex-col gap-2">
      <h3 className="font-semibold text-base text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  )
}
