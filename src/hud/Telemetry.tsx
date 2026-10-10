import { useStore } from '../store/useStore'
import { site } from '../content/site'

function Readout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="label">{label}</span>
      <span className="tabular-nums text-sm text-white">
        {value}
        {unit && <span className="text-white/40 text-[10px] ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export function Telemetry() {
  const t = useStore((s) => s.telemetry)
  const heat = useStore((s) => s.heat)
  const secrets = useStore((s) => s.secrets)
  const active = useStore((s) => s.activeStation)
  const found = Object.values(secrets).filter(Boolean).length
  const locked = heat < 0
  const heatPct = Math.abs(heat) * 100
  const zone = active ? site.stations.find((s) => s.id === active)!.label : 'open floor'

  return (
    <aside className="pointer-events-none fixed left-3 sm:left-5 top-[64px] sm:top-[76px] z-20 w-[196px] console bracket p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="label">{site.robot}</span>
        <span className="flex items-center gap-1.5 label">
          <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" /> live
        </span>
      </div>
      <Readout label="speed" value={t.speed.toFixed(1)} unit="m/s" />
      <div>
        <div className="flex items-baseline justify-between">
          <span className="label">battery</span>
          <span className="tabular-nums text-sm text-white">{Math.round(t.battery)}<span className="text-white/40 text-[10px] ml-1">%</span></span>
        </div>
        <div className="mt-1 h-1 bg-white/10">
          <div className="h-full transition-[width] duration-300" style={{ width: `${t.battery}%`, background: t.battery < 20 ? '#ff4d4d' : 'var(--volt)' }} />
        </div>
      </div>
      <Readout label="distance" value={t.distance < 1000 ? t.distance.toFixed(0) : (t.distance / 1000).toFixed(2)} unit={t.distance < 1000 ? 'm' : 'km'} />
      <Readout label="zone" value={zone} />
      <Readout label="secrets" value={`${found}/4`} />
      <div>
        <div className="flex items-baseline justify-between">
          <span className="label">{locked ? 'boost · cooling' : 'boost heat'}</span>
        </div>
        <div className="mt-1 h-1 bg-white/10">
          <div className="h-full transition-[width] duration-100" style={{ width: `${heatPct}%`, background: locked ? '#ff4d4d' : 'var(--steel)' }} />
        </div>
      </div>
    </aside>
  )
}
