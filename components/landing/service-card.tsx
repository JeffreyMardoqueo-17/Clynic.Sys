import { ReactNode } from "react"

type ServiceCardProps = {
  icon: ReactNode
  title: string
  description: string
  points: string[]
}

export function ServiceCard({ icon, title, description, points }: ServiceCardProps) {
  return (
    <article className="landing-panel landing-service-card h-full p-6">
      <div className="mb-4 inline-flex rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-700">{icon}</div>
      <h3 className="text-xl font-bold text-blue-950">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-blue-600" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
