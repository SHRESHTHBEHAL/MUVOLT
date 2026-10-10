import { projects } from '../content/projects'

const STATUS: Record<string, string> = {
  Active: 'text-volt',
  Shipped: 'text-steel',
  Archived: 'text-white/40',
}

export function ProjectsPanel() {
  return (
    <div className="stagger space-y-3">
      <p className="text-sm text-white/70 leading-relaxed">Six machines on the bench right now. Some drive, some walk, one is a hand.</p>
      {projects.map((p) => (
        <article key={p.id} className="border border-white/8 p-4 hover:border-volt/40 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-bold text-lg text-white leading-tight">{p.name}</h3>
            <span className={`chip ${STATUS[p.status]}`}>{p.status}</span>
          </div>
          <p className="mt-2 text-[13px] text-white/65 leading-relaxed">{p.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {p.tags.map((t) => (
              <span key={t} className="label">{t}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
