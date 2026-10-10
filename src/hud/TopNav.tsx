import { useStore, bayStore } from '../store/useStore'
import { site } from '../content/site'
import { stationAt } from '../logic/stations'
import { audio } from '../audio/AudioManager'
import type { StationId } from '../content/types'
import { Settings } from './Settings'

export function goToStation(id: StationId) {
  const s = bayStore.getState()
  audio.play('click')
  const p = s.roverPos
  if (stationAt([p[0], p[2]]) === id) s.setActiveStation(id)
  else s.setAutopilot(id)
}

export function TopNav() {
  const active = useStore((s) => s.activeStation)
  const autopilot = useStore((s) => s.autopilotTarget)
  return (
    <header className="pointer-events-none fixed top-0 inset-x-0 z-30 flex items-start justify-between p-2.5 sm:p-5 gap-2 sm:gap-3">
      <div className="pointer-events-auto relative console bracket px-3 py-2 flex items-center gap-3">
        <span className="font-display font-bold tracking-tight text-white text-sm">
          MU<span className="text-volt">VOLT</span>
        </span>
        <span className="label hidden sm:inline">the bay</span>
      </div>

      <nav className="pointer-events-auto relative console bracket hidden md:flex items-center">
        {site.stations.map((st, i) => {
          const isActive = active === st.id
          const isTarget = autopilot === st.id
          return (
            <button
              key={st.id}
              onClick={() => goToStation(st.id)}
              className={`press relative px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase border-r border-white/5 last:border-r-0 ${
                isActive ? 'text-ink bg-volt' : isTarget ? 'text-volt' : 'text-white/75 hover:text-volt'
              }`}
            >
              <span className="opacity-50 mr-2">0{i + 1}</span>
              {st.label}
              {isTarget && <span className="absolute left-2 right-2 bottom-1 h-px bg-volt animate-pulse" />}
            </button>
          )
        })}
      </nav>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => { audio.play('click'); bayStore.getState().requestReset() }}
          className="press console px-3 py-2 text-[10px] tracking-[0.2em] uppercase text-white/70 hover:text-volt"
          title="Teleport BOLT-7 back to the pad"
          aria-label="Reset BOLT-7"
        >
          <span className="sm:hidden">↺</span>
          <span className="hidden sm:inline">Reset BOLT-7</span>
        </button>
        <Settings />
        <button
          onClick={() => { audio.play('click'); bayStore.getState().setFallback(true) }}
          className="press console px-3 py-2 text-[10px] tracking-[0.2em] uppercase text-white/70 hover:text-volt"
          aria-label="Switch to the reading version"
        >
          <span className="sm:hidden">Read</span>
          <span className="hidden sm:inline">Just read</span>
        </button>
      </div>
    </header>
  )
}
