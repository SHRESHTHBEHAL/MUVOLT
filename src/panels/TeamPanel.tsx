import { team } from '../content/team'

export function TeamPanel() {
  const advisor = team.find((m) => m.advisor)
  const crew = team.filter((m) => !m.advisor)
  return (
    <div className="stagger space-y-3">
      <p className="text-sm text-white/70 leading-relaxed">Twelve people and one adult. Every locker has a name tag and a half-finished project behind it.</p>
      {advisor && (
        <div className="border border-volt/40 bg-volt/5 p-4">
          <div className="label mb-1">faculty advisor</div>
          <div className="font-display font-bold text-lg text-white">{advisor.name}</div>
          <div className="text-[13px] text-white/65 mt-1">{advisor.building}</div>
        </div>
      )}
      <ul className="divide-y divide-white/5 border-y border-white/5">
        {crew.map((m) => (
          <li key={m.id} className="py-3 flex gap-4 items-baseline">
            <div className="w-[128px] shrink-0">
              <div className="text-white text-sm font-medium">{m.name}</div>
              <div className="label mt-0.5">{m.role} · {m.year}</div>
            </div>
            <div className="text-[13px] text-white/65 leading-snug">{m.building}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
