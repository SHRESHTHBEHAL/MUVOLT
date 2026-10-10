import { site } from '../content/site'
import { bayStore } from '../store/useStore'
import { ProjectsPanel } from '../panels/ProjectsPanel'
import { TeamPanel } from '../panels/TeamPanel'
import { CompetitionsPanel } from '../panels/CompetitionsPanel'
import { LearnPanel } from '../panels/LearnPanel'
import { JoinPanel } from '../panels/JoinPanel'

const SECTIONS = [
  { id: 'workshop', Panel: ProjectsPanel },
  { id: 'crew', Panel: TeamPanel },
  { id: 'arena', Panel: CompetitionsPanel },
  { id: 'lab', Panel: LearnPanel },
  { id: 'dock', Panel: JoinPanel },
] as const

/** The whole site as one scrollable page. Same content files, no WebGL. */
export function Fallback({ notice, canReturn }: { notice?: string; canReturn: boolean }) {
  return (
    <main className="min-h-full bg-ink text-white">
      <header className="sticky top-0 z-10 console border-x-0 border-t-0 px-5 py-3 flex items-center justify-between gap-4">
        <span className="font-display font-bold tracking-tight">MU<span className="text-volt">VOLT</span></span>
        <nav className="hidden sm:flex gap-5">
          {site.stations.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="label hover:text-volt transition-colors">{s.subtitle}</a>
          ))}
        </nav>
        {canReturn && (
          <button onClick={() => bayStore.getState().setFallback(false)} className="press label border border-volt/50 text-volt px-3 py-2 hover:bg-volt hover:text-ink">
            Take control of {site.robot} instead
          </button>
        )}
      </header>

      <section className="px-5 pt-20 pb-16 max-w-3xl mx-auto">
        {notice && <p className="label mb-6 text-volt">{notice}</p>}
        <div className="label mb-3">{site.bootLine}</div>
        <h1 className="font-display font-bold text-[clamp(40px,8vw,88px)] leading-[0.95] tracking-tight">
          We build robots.<br />
          <span className="text-volt">Sometimes they build back.</span>
        </h1>
        <p className="mt-6 text-white/65 max-w-xl leading-relaxed text-sm">
          {site.club} is a student robotics club. This is the flat version of our bay. The real one has a rover named {site.robot} and four secrets.
        </p>
      </section>

      {SECTIONS.map(({ id, Panel }, i) => {
        const meta = site.stations.find((s) => s.id === id)!
        return (
          <section key={id} id={id} className="px-5 py-14 border-t border-white/5">
            <div className="max-w-3xl mx-auto">
              <div className="label mb-1">st-0{i + 1} // {meta.subtitle}</div>
              <h2 className="font-display font-bold text-3xl tracking-tight mb-6">{meta.label}</h2>
              <div className="max-w-xl">
                <Panel />
              </div>
            </div>
          </section>
        )
      })}

      <footer className="px-5 py-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto label flex justify-between">
          <span>{site.club} · bay 7</span>
          <span>attempts: 6 · survivors: 1</span>
        </div>
      </footer>
    </main>
  )
}
