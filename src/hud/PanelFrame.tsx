import { useEffect, useState } from 'react'
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

  const id = active ?? shown
  if (!id) return null
  const meta = site.stations.find((s) => s.id === id)!
  const index = site.stations.findIndex((s) => s.id === id) + 1
  const Panel = PANELS[id]

  return (
    <section
      data-open={active !== null}
      className="drawer fixed z-40 right-0 bottom-0 md:top-[76px] md:bottom-5 md:right-5 w-full md:w-[460px] max-h-[72vh] md:max-h-none console flex flex-col"
      style={{ borderLeft: '3px solid var(--volt)' }}
      aria-label={`${meta.label} panel`}
    >
      <header className="flex items-start justify-between p-5 pb-3 border-b border-white/5">
        <div>
          <div className="label mb-1">st-0{index} // {meta.subtitle}</div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white leading-none">{meta.label}</h2>
        </div>
        <button
          onClick={() => { audio.play('click'); bayStore.getState().setActiveStation(null) }}
          className="press label border border-white/10 px-2 py-1 hover:border-volt hover:text-volt"
          aria-label="Close panel"
        >
          esc
        </button>
      </header>
      <div className="scroll overflow-y-auto p-5 pt-4 flex-1">
        <Panel />
      </div>
      <footer className="label p-3 border-t border-white/5 flex justify-between">
        <span>reverse out to close</span>
        <span>{site.robot}</span>
      </footer>
    </section>
  )
}
