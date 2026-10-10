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
import { Machine } from '../ui/Machines'
import { RobotAvatar } from '../ui/RobotAvatar'
import { audio } from '../audio/AudioManager'

/** Adds `.in` to every `.reveal` once it scrolls into view. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -40px 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    // safety net: nothing stays invisible if the observer never fires
    const t = window.setTimeout(() => els.forEach((el) => el.classList.add('in')), 6000)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])
}

const STATUS: Record<string, { chip: string; led: string; word: string }> = {
  Active: { chip: 'text-volt border-volt/60', led: 'text-volt led-active', word: 'moving this week' },
  Shipped: { chip: 'text-steel border-steel/60', led: 'text-steel', word: 'done and demoed' },
  Archived: { chip: 'text-white/40 border-white/20', led: 'text-white/30', word: 'taught us something' },
}
const LEVEL: Record<string, string> = { Beginner: 'text-volt', Intermediate: 'text-steel', Advanced: 'text-[#ff7a3d]' }
const PLACE_SCORE: Record<string, number> = { '1st': 100, Best: 100, '2nd': 80, '3rd': 65, Finalist: 55 }

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

function Section({ id, n, title, blurb, children, className = '' }: { id: string; n: number; title: string; blurb: string; children: React.ReactNode; className?: string }) {
  const meta = site.stations.find((s) => s.id === id)!
  return (
    <section id={id} className={`px-5 sm:px-8 py-16 sm:py-24 border-t border-white/5 ${className}`}>
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

/** Sparks fly out of wherever you click on a result row. */
function useSparks() {
  return (e: React.MouseEvent<HTMLElement>) => {
    const host = e.currentTarget
    const r = host.getBoundingClientRect()
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span')
      s.className = 'spark'
      s.style.left = `${e.clientX - r.left}px`
      s.style.top = `${e.clientY - r.top}px`
      const a = (i / 10) * Math.PI * 2
      s.style.setProperty('--sx', `${Math.cos(a) * (30 + Math.random() * 30)}px`)
      s.style.setProperty('--sy', `${Math.sin(a) * (30 + Math.random() * 30)}px`)
      host.appendChild(s)
      setTimeout(() => s.remove(), 750)
    }
  }
}

function Locker({ m, i }: { m: (typeof team)[number]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className={`reveal locker text-left min-h-[190px] relative overflow-hidden focus:outline-none ${open ? 'open' : ''}`}
      style={{ transitionDelay: `${(i % 4) * 50}ms`, perspective: '600px' }}
      aria-expanded={open}
    >
      {/* what's inside */}
      <div className="locker-inner absolute inset-0 p-4 flex flex-col">
        <div className="label text-volt">building</div>
        <div className="mt-2 text-sm leading-snug text-white/85">{m.building}</div>
        <div className="mt-auto flex items-end justify-between">
          <RobotAvatar seed={m.id} size={44} />
          <span className="label">tap to close</span>
        </div>
      </div>
      {/* the door */}
      <div className="locker-door absolute inset-0 p-4 pr-8 flex flex-col" style={{ background: 'linear-gradient(180deg, #2f3744 0%, #242a35 100%)' }}>
        <div className="flex items-start justify-between">
          <div className="bg-volt text-ink text-[10px] tracking-[0.18em] uppercase px-2 py-1">{m.name}</div>
          <RobotAvatar seed={m.id} size={40} />
        </div>
        <div className="mt-4 text-sm font-medium leading-tight">{m.name}</div>
        <div className="label mt-1">{m.role} · {m.year}</div>
        <div className="mt-auto label opacity-60">{'▸'} open locker</div>
        {/* vents */}
        <div className="absolute right-4 bottom-4 space-y-1 opacity-60">
          {[0, 1, 2].map((v) => <div key={v} className="w-6 h-[2px] bg-black/60" />)}
        </div>
      </div>
    </button>
  )
}

/** The whole site as one scrollable page, with BOLT-7 tagging along. */
export function Fallback({ notice, canReturn }: { notice?: string; canReturn: boolean }) {
  useReveal()
  useEffect(() => {
    audio.setMotor(0)
    audio.setAmbience(false)
    return () => audio.setAmbience(true)
  }, [])
  const [bubble, setBubble] = useState(0)
  const [happy, setHappy] = useState(false)
  const beepTimer = useRef(0)
  const sparks = useSparks()
  const poke = () => {
    setBubble((b) => (b + 1) % BUBBLES.length)
    setHappy(true)
    clearTimeout(beepTimer.current)
    beepTimer.current = window.setTimeout(() => setHappy(false), 1200)
  }
  const drive = () => bayStore.getState().setFallback(false)
  const advisor = team.find((m) => m.advisor)
  const crew = team.filter((m) => !m.advisor)
  const sortedComps = [...competitions].sort((a, b) => b.year - a.year)
  const wins = competitions.filter((c) => /1st|Best|Finalist/.test(c.placement)).length
  const score = (placement: string) => Object.entries(PLACE_SCORE).find(([k]) => placement.includes(k))?.[1] ?? 40

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
              <div className="font-display font-bold text-4xl sm:text-5xl text-volt tabular-nums"><span className="roll inline-block">{n}</span></div>
              <div className="label mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 01 workshop */}
      <Section id="workshop" n={1} title="Six machines, one bench." blurb="Some drive, some walk, one is a hand. The LED tells the truth: a blinking one moved this week, a steady one is finished, a dim one taught us something and then stopped.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => {
            const st = STATUS[p.status]
            return (
              <article key={p.id} className="reveal card-machine border border-white/8 flex flex-col hover:border-volt/40 transition-colors group" style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="relative aspect-[5/3] border-b border-white/5 overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-60" />
                  <div className="absolute inset-4 sm:inset-6"><Machine id={p.id} /></div>
                  <div className="absolute top-3 left-3 flex items-center gap-2 label">
                    <span className={`led ${st.led}`} />
                    <span>{st.word}</span>
                  </div>
                  <div className="absolute top-3 right-3 label opacity-60">unit 0{i + 1}</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-bold text-2xl leading-tight">{p.name}</h3>
                    <span className={`chip ${st.chip}`}>{p.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-white/65 leading-relaxed flex-1">{p.blurb}</p>
                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-x-3 gap-y-1">
                    {p.tags.map((t) => (
                      <span key={t} className="label flex items-center gap-2"><span className="w-1 h-1 bg-volt/70" />{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </Section>

      {/* 02 crew */}
      <Section id="crew" n={2} title="The crew quarters." blurb="Every member gets a locker and a little robot. Open a locker to see what's being built behind the door.">
        {advisor && (
          <div className="reveal mb-6 border border-volt/40 bg-volt/5 p-5 sm:p-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <RobotAvatar seed={advisor.id} size={48} />
            <span className="label">faculty advisor</span>
            <span className="font-display font-bold text-2xl">{advisor.name}</span>
            <span className="text-sm text-white/65">{advisor.building}</span>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {crew.map((m, i) => <Locker key={m.id} m={m} i={i} />)}
        </div>
      </Section>

      {/* 03 arena */}
      <Section id="arena" n={3} title="Where it got loud." blurb="The scoreboard on the wall of the bay is fake. These results are not. Click a row if you want sparks." className="relative overflow-hidden">
        {/* ticker */}
        <div className="reveal overflow-hidden border-y border-white/5 py-2 mb-10 -mx-5 sm:-mx-8">
          <div className="ticker flex w-max gap-10 whitespace-nowrap">
            {[...sortedComps, ...sortedComps].map((c, i) => (
              <span key={i} className="label flex items-center gap-3">
                <span className="text-volt">{c.year}</span>{c.event}<span className="text-steel">{c.placement}</span><span className="text-white/20">//</span>
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {sortedComps.map((c, i) => (
            <div key={c.id} onClick={sparks} className="reveal relative overflow-hidden border border-white/8 bg-ink/70 grid md:grid-cols-[110px_1fr_220px] gap-4 md:gap-8 p-5 items-center hover:border-volt/40 transition-colors cursor-pointer" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="font-display font-bold text-4xl md:text-5xl text-volt tabular-nums flicker" style={{ animationDelay: `${i * 0.7}s` }}>
                <span className="roll inline-block">{c.year}</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl leading-tight">{c.event}</h3>
                <p className="text-sm text-white/65 leading-relaxed mt-2 max-w-xl">{c.story}</p>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-steel text-xs tracking-[0.2em] uppercase">{c.placement}</span>
                  <span className="label">{score(c.placement)}%</span>
                </div>
                <div className="mt-2 h-2 bg-white/5 overflow-hidden">
                  <div className="bar h-full" style={{ width: `${score(c.placement)}%`, background: 'linear-gradient(90deg, var(--steel), var(--volt))', animationDelay: `${i * 80}ms` }} />
                </div>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 10 }).map((_, k) => (
                    <span key={k} className="h-1 flex-1" style={{ background: k < score(c.placement) / 10 ? 'var(--volt)' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 04 lab */}
      <Section id="lab" n={4} title="Learn by soldering." blurb="Five tracks, Saturday mornings. Start wherever you are. Finish with a robot and a locker.">
        <div className="divide-y divide-white/5 border-y border-white/5">
          {courses.map((c, i) => (
            <div key={c.id} className="reveal grid sm:grid-cols-[48px_1fr_auto] gap-4 py-5 items-start" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="font-display font-bold text-3xl text-white/20 tabular-nums">0{i + 1}</div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
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
