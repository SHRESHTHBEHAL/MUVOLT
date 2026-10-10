import { useEffect, useRef, useState } from 'react'
import { site } from '../content/site'
import { projects } from '../content/projects'
import { team } from '../content/team'
import { competitions } from '../content/competitions'
import { courses } from '../content/learn'
import { join } from '../content/join'
import { bayStore } from '../store/useStore'
import { JoinPanel } from '../panels/JoinPanel'
import { Bolt } from '../ui/Bolt'

/** Adds `.in` to every `.reveal` once it scrolls into view. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { rootMargin: '-60px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const STATUS: Record<string, string> = { Active: 'text-volt border-volt/60', Shipped: 'text-steel border-steel/60', Archived: 'text-white/40 border-white/20' }
const LEVEL: Record<string, string> = { Beginner: 'text-volt', Intermediate: 'text-steel', Advanced: 'text-[#ff7a3d]' }

const BUBBLES = ['beep. I’m BOLT-7.', 'Scroll. I’ll keep up.', 'Six of my siblings didn’t make it.', 'Join us. We have a reflow oven.', 'Click me. Go on.']

function Eyebrow({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-3 label">
      <span className="text-volt">st-0{n}</span>
      <span className="h-px w-8 bg-volt/40" />
      <span>{text}</span>
    </div>
  )
}

function Section({ id, n, title, blurb, children }: { id: string; n: number; title: string; blurb: string; children: React.ReactNode }) {
  const meta = site.stations.find((s) => s.id === id)!
  return (
    <section id={id} className="px-5 sm:px-8 py-16 sm:py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="reveal grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 items-end mb-10">
          <div>
            <Eyebrow n={n} text={meta.subtitle} />
            <h2 className="font-display font-bold text-[clamp(36px,6vw,72px)] leading-[0.95] tracking-tight mt-3">{title}</h2>
          </div>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-lg md:justify-self-end">{blurb}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

/** The whole site as one scrollable page, with BOLT-7 tagging along. */
export function Fallback({ notice, canReturn }: { notice?: string; canReturn: boolean }) {
  useReveal()
  const [bubble, setBubble] = useState(0)
  const [happy, setHappy] = useState(false)
  const beepTimer = useRef(0)
  const poke = () => {
    setBubble((b) => (b + 1) % BUBBLES.length)
    setHappy(true)
    clearTimeout(beepTimer.current)
    beepTimer.current = window.setTimeout(() => setHappy(false), 1200)
  }
  const drive = () => bayStore.getState().setFallback(false)
  const advisor = team.find((m) => m.advisor)
  const crew = team.filter((m) => !m.advisor)
  const wins = competitions.filter((c) => /1st|Best|Finalist/.test(c.placement)).length

  return (
    <main className="min-h-full bg-ink text-white grid-bg">
      <header className="sticky top-0 z-20 console border-x-0 border-t-0 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3">
          <Bolt size={44} />
          <span className="font-display font-bold tracking-tight">MU<span className="text-volt">VOLT</span></span>
        </a>
        <nav className="hidden md:flex gap-6">
          {site.stations.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="label hover:text-volt transition-colors">{s.subtitle}</a>
          ))}
        </nav>
        {canReturn ? (
          <button onClick={drive} className="press label border border-volt/60 text-volt px-3 py-2 hover:bg-volt hover:text-ink whitespace-nowrap">
            Drive {site.robot} →
          </button>
        ) : (
          <span className="label">bay 7</span>
        )}
      </header>

      {/* hero */}
      <section id="top" className="px-5 sm:px-8 pt-14 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div className="reveal in">
            {notice && <p className="label mb-5 text-volt">{notice}</p>}
            <div className="label mb-4">Masters Union · Robotics Club</div>
            <h1 className="font-display font-bold text-[clamp(64px,14vw,168px)] leading-[0.85] tracking-[-0.04em]">
              MU<span className="text-volt">VOLT</span>
            </h1>
            <p className="mt-6 text-lg sm:text-2xl text-white/80 max-w-xl font-display font-bold tracking-tight">{site.tagline}</p>
            <p className="mt-4 text-white/55 max-w-lg leading-relaxed text-sm sm:text-base">
              A student club that builds real machines: rovers, walkers, a soft hand, a swarm. This is the reading version of our bay. The other version has a steering wheel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#dock" className="relative bracket press px-6 py-3.5 border border-volt text-volt text-xs tracking-[0.3em] uppercase hover:bg-volt hover:text-ink">Join the crew</a>
              <a href="#workshop" className="press px-6 py-3.5 border border-white/10 text-white/70 text-xs tracking-[0.3em] uppercase hover:text-white">See the robots</a>
            </div>
          </div>
          <div className="reveal in justify-self-center relative">
            <button onClick={poke} className="bolt-bob block focus:outline-none" aria-label="Poke BOLT-7">
              <Bolt size={300} track mood={happy ? 'happy' : 'idle'} className="w-[min(300px,72vw)] h-auto" />
            </button>
            <div key={bubble} className="bubble rise absolute -top-6 left-[62%] px-3 py-2 text-xs font-medium whitespace-nowrap">{BUBBLES[bubble]}</div>
          </div>
        </div>

        {/* stats strip */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {[
            [projects.length, 'machines on the bench'],
            [team.length, 'crew, one adult'],
            [wins, 'podiums and finals'],
            [6, 'previous attempts at BOLT'],
          ].map(([n, l], i) => (
            <div key={i} className="reveal bg-ink p-5 sm:p-6" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="font-display font-bold text-4xl sm:text-5xl text-volt tabular-nums">{n}</div>
              <div className="label mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 01 workshop */}
      <Section id="workshop" n={1} title="Six machines, one bench." blurb="Some drive, some walk, one is a hand. Status is honest: Active means it moved this week, Archived means it taught us something and then stopped.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <article key={p.id} className="reveal border border-white/8 bg-ink/60 p-5 flex flex-col hover:border-volt/40 transition-colors" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-bold text-2xl leading-tight">{p.name}</h3>
                <span className={`chip ${STATUS[p.status]}`}>{p.status}</span>
              </div>
              <p className="mt-3 text-sm text-white/65 leading-relaxed flex-1">{p.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">{p.tags.map((t) => <span key={t} className="label">{t}</span>)}</div>
            </article>
          ))}
        </div>
      </Section>

      {/* 02 crew */}
      <Section id="crew" n={2} title="The crew quarters." blurb="Every member gets a locker. Every locker has a half-finished project behind it. Here's what's on the name tags right now.">
        {advisor && (
          <div className="reveal mb-6 border border-volt/40 bg-volt/5 p-5 sm:p-6 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="label">faculty advisor</span>
            <span className="font-display font-bold text-2xl">{advisor.name}</span>
            <span className="text-sm text-white/65">{advisor.building}</span>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {crew.map((m, i) => (
            <div key={m.id} className="reveal locker p-4 pr-7 min-h-[150px] flex flex-col" style={{ transitionDelay: `${(i % 4) * 50}ms` }}>
              <div className="bg-volt text-ink text-[10px] tracking-[0.18em] uppercase px-2 py-1 self-start">{m.name.split(' ')[0]}</div>
              <div className="mt-3 text-sm font-medium leading-tight">{m.name}</div>
              <div className="label mt-1">{m.role} · {m.year}</div>
              <div className="mt-auto pt-3 text-xs text-white/55 leading-snug">{m.building}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 03 arena */}
      <Section id="arena" n={3} title="Where it got loud." blurb="The scoreboard on the wall of the bay is fake. These results are not.">
        <ol className="relative border-l border-volt/30 ml-2 sm:ml-4">
          {[...competitions].sort((a, b) => b.year - a.year).map((c, i) => (
            <li key={c.id} className="reveal pl-6 sm:pl-10 pb-10 relative" style={{ transitionDelay: `${i * 60}ms` }}>
              <span className="absolute -left-[6px] top-2 w-[11px] h-[11px] bg-volt rotate-45" />
              <div className="grid sm:grid-cols-[90px_1fr] gap-2 sm:gap-8">
                <div className="font-display font-bold text-2xl text-volt tabular-nums">{c.year}</div>
                <div>
                  <h3 className="font-display font-bold text-2xl leading-tight">{c.event}</h3>
                  <div className="text-steel text-xs tracking-[0.2em] uppercase mt-1">{c.placement}</div>
                  <p className="text-sm text-white/65 leading-relaxed mt-2 max-w-xl">{c.story}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 04 lab */}
      <Section id="lab" n={4} title="Learn by soldering." blurb="Five tracks, Saturday mornings. Start wherever you are. Finish with a robot and a locker.">
        <div className="divide-y divide-white/5 border-y border-white/5">
          {courses.map((c, i) => (
            <div key={c.id} className="reveal grid sm:grid-cols-[1fr_auto] gap-3 py-5 items-start" style={{ transitionDelay: `${i * 50}ms` }}>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-xl leading-tight">{c.title}</h3>
                  <span className={`chip ${LEVEL[c.level]}`}>{c.level}</span>
                </div>
                <p className="text-sm text-white/65 leading-relaxed mt-2 max-w-xl">{c.blurb}</p>
              </div>
              <div className="sm:text-right">
                <div className="label">next session</div>
                <div className="text-sm tabular-nums mt-0.5">{c.nextSession}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 05 dock */}
      <Section id="dock" n={5} title="Dock with us." blurb={join.schedule}>
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-start">
          <div className="reveal">
            <JoinPanel />
          </div>
          <div className="reveal md:justify-self-center flex flex-col items-center gap-4">
            <Bolt size={260} mood="happy" className="w-[min(260px,70vw)] h-auto bolt-bob" />
            <p className="label text-center max-w-xs">BOLT-7 personally reads every form. Slowly. It is a robot.</p>
          </div>
        </div>
      </Section>

      <footer className="px-5 sm:px-8 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="font-display font-bold text-2xl">MU<span className="text-volt">VOLT</span></div>
            <div className="label mt-1">Masters Union · Robotics Club · bay 7</div>
          </div>
          <div className="label sm:text-right">
            <div>In memory of BOLT-1 through BOLT-6.</div>
            <div className="mt-1 opacity-60">Pool · rain · wiring · brakes · a bet · parts</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
