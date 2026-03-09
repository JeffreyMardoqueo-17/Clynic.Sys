type ImpactCardProps = {
  value: string
  title: string
  description: string
}

export function ImpactCard({ value, title, description }: ImpactCardProps) {
  return (
    <article className="landing-panel landing-impact-card p-6">
      <p className="text-3xl font-black tracking-tight text-blue-700">{value}</p>
      <h3 className="mt-3 text-lg font-bold text-blue-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  )
}
