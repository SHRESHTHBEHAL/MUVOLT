import { competitions } from '../content/competitions'

export function CompetitionsPanel() {
  const sorted = [...competitions].sort((a, b) => b.year - a.year)
  return (
    <div className="stagger">
      <p className="text-sm text-white/70 leading-relaxed mb-4">The scoreboard on the wall is fake. These are not.</p>
      <ol className="relative border-l border-volt/30 ml-2">
        {sorted.map((c) => (
          <li key={c.id} className="pl-5 pb-6 relative">
            <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] bg-volt rotate-45" />
            <div className="label">{c.year}</div>
            <h3 className="font-display font-bold text-lg text-white leading-tight mt-0.5">{c.event}</h3>
            <div className="text-steel text-xs tracking-[0.15em] uppercase mt-1">{c.placement}</div>
            <p className="text-[13px] text-white/65 leading-relaxed mt-2">{c.story}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
