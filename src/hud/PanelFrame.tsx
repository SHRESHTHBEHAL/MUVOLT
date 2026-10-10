import { useEffect, useRef, useState } from 'react'
import { useStore, bayStore } from '../store/useStore'
import { site } from '../content/site'
import type { StationId } from '../content/types'
import { ProjectsPanel } from '../panels/ProjectsPanel'
import { TeamPanel } from '../panels/TeamPanel'
import { CompetitionsPanel } from '../panels/CompetitionsPanel'
import { LearnPanel } from '../panels/LearnPanel'
import { JoinPanel } from '../panels/JoinPanel'
import { audio } from '../audio/AudioManager'

const PANELS: Record<StationId, () => React.ReactElement> = {
  workshop: ProjectsPanel,
  crew: TeamPanel,
  arena: CompetitionsPanel,
  lab: LearnPanel,
  dock: JoinPanel,
}

/** Right-side drawer on desktop, bottom sheet on mobile. Esc or driving out closes it. */
export function PanelFrame() {
  const active = useStore((s) => s.activeStation)
  const [shown, setShown] = useState<StationId | null>(null)

  useEffect(() => {
    if (active) setShown(active)
    else {
      const t = window.setTimeout(() => setShown(null), 260)
      return () => clearTimeout(t)
    }
  }, [active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bayStore.getState().activeStation) {
        audio.play('click')
        bayStore.getState().setActiveStation(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (active) closeRef.current?.focus()
  }, [active])

  const id = active ?? shown
  if (!id) return null
  const meta = site.stations.find((s) => s.id === id)!
  const index = site.stations.findIndex((s) => s.id === id) + 1
  const Panel = PANELS[id]

  return (
    <section
      data-open={active !== null}
      className="drawer fixed z-40 right-0 bottom-0 md:top-[76px] md:bottom-5 md:right-5 w-full md:w-[460px] max-h-[64vh] md:max-h-none console flex flex-col"
      style={{ borderLeft: '3px solid var(--volt)' }}
      aria-label={`${meta.label} panel`}
    >
      <header className="flex items-start justify-between p-5 pb-3 border-b border-white/5">
        <div>
          <div className="label mb-1">st-0{index} // {meta.subtitle}</div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white leading-none">{meta.label}</h2>
        </div>
        <button
          ref={closeRef}
          onClick={() => { audio.play('click'); bayStore.getState().setActiveStation(null) }}
          className="press text-[10px] tracking-[0.2em] uppercase border border-volt/50 text-volt px-3 py-2 hover:bg-volt hover:text-ink"
          aria-label="Close panel"
        >
          <span className="md:hidden">close</span><span className="hidden md:inline">esc</span>
        </button>
      </header>
      <div className="scroll overflow-y-auto p-5 pt-4 flex-1">
        <Panel />
      </div>
      <footer className="label p-3 border-t border-white/5 flex justify-between">
        <span className="hidden md:inline">reverse out to close</span><span className="md:hidden">drive away to close</span>
        <span>{site.robot}</span>
      </footer>
    </section>
  )
}
