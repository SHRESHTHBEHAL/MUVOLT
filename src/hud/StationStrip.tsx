import { useStore } from '../store/useStore'
import { site } from '../content/site'
import { goToStation } from './TopNav'

/** Mobile replacement for the desktop station nav: a scrollable row of chips under the header. */
export function StationStrip() {
  const active = useStore((s) => s.activeStation)
  const autopilot = useStore((s) => s.autopilotTarget)
  return (
    <div className="md:hidden fixed top-[52px] inset-x-0 z-20 px-3 overflow-x-auto scroll" style={{ scrollbarWidth: 'none' }}>
      <div className="flex gap-1.5 w-max">
        {site.stations.map((st, i) => {
          const isActive = active === st.id
          const isTarget = autopilot === st.id
          return (
            <button
              key={st.id}
              onClick={() => goToStation(st.id)}
              className={`press console px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase whitespace-nowrap ${
                isActive ? 'text-ink !bg-volt' : isTarget ? 'text-volt animate-pulse' : 'text-white/75'
              }`}
            >
              <span className="opacity-50 mr-1.5">0{i + 1}</span>
              {st.subtitle}
            </button>
          )
        })}
      </div>
    </div>
  )
}
