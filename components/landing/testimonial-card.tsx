import { Quote } from "lucide-react"

type TestimonialCardProps = {
  quote: string
  name: string
  role: string
  clinic: string
}

export function TestimonialCard({ quote, name, role, clinic }: TestimonialCardProps) {
  return (
    <article className="landing-panel landing-testimonial-card h-full p-6">
      <Quote className="size-5 text-blue-700" />
      <p className="mt-4 text-sm leading-relaxed text-slate-700">&ldquo;{quote}&rdquo;</p>
      <div className="mt-5 border-t border-blue-100 pt-4">
        <p className="text-sm font-bold text-blue-950">{name}</p>
        <p className="text-xs text-slate-500">{role}</p>
        <p className="text-xs text-slate-500">{clinic}</p>
      </div>
    </article>
  )
}
