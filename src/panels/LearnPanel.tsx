import { courses } from '../content/learn'

const LEVEL: Record<string, string> = {
  Beginner: 'text-volt',
  Intermediate: 'text-steel',
  Advanced: 'text-[#ff7a3d]',
}

export function LearnPanel() {
  return (
    <div className="stagger space-y-3">
      <p className="text-sm text-white/70 leading-relaxed">Five tracks, Saturday mornings. Start wherever you are. Finish with a robot.</p>
      {courses.map((c) => (
        <article key={c.id} className="border border-white/8 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-bold text-lg text-white leading-tight">{c.title}</h3>
            <span className={`chip ${LEVEL[c.level]}`}>{c.level}</span>
          </div>
          <p className="mt-2 text-[13px] text-white/65 leading-relaxed">{c.blurb}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="label">next session</span>
            <span className="text-xs text-white tabular-nums">{c.nextSession}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
