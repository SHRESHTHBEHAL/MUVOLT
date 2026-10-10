import { useStore } from '../store/useStore'
import { STATIONS, FLOOR_SIZE } from '../logic/stations'
import { site } from '../content/site'
import { goToStation } from './TopNav'
import type { StationId } from '../content/types'

const SIZE = 150
const k = SIZE / FLOOR_SIZE
const toMap = (x: number, z: number) => [SIZE / 2 + x * k, SIZE / 2 + z * k] as const

export function Minimap() {
  const pos = useStore((s) => s.roverPos)
  const heading = useStore((s) => s.roverHeading)
  const active = useStore((s) => s.activeStation)
  const autopilot = useStore((s) => s.autopilotTarget)
  const [rx, rz] = toMap(pos[0], pos[2])
  const underground = pos[1] < -2
  const outside = Math.abs(pos[2]) > FLOOR_SIZE / 2

  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * SIZE
    const mz = ((e.clientY - r.top) / r.height) * SIZE
    let best: StationId = STATIONS[0].id
    let bd = Infinity
    for (const s of STATIONS) {
      const [sx, sz] = toMap(s.position[0], s.position[1])
      const d = Math.hypot(sx - mx, sz - mz)
      if (d < bd) { bd = d; best = s.id }
    }
    goToStation(best)
  }

  return (
    <div className="fixed right-3 top-[92px] md:top-auto md:right-5 md:bottom-5 z-20 console bracket p-1.5 md:p-2">
      <div className="label mb-1 hidden md:flex justify-between"><span>floor plan</span><span>{underground ? 'sub-level' : outside ? 'annex' : 'bay 7'}</span></div>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} onClick={onClick} className="cursor-pointer block w-[96px] h-[96px] md:w-[150px] md:h-[150px]" role="img" aria-label="Minimap, click a station to drive there">
        <rect x={0.5} y={0.5} width={SIZE - 1} height={SIZE - 1} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" />
        {[0.25, 0.5, 0.75].map((f) => (
          <g key={f} stroke="rgba(255,255,255,0.05)">
            <line x1={SIZE * f} y1={0} x2={SIZE * f} y2={SIZE} />
            <line x1={0} y1={SIZE * f} x2={SIZE} y2={SIZE * f} />
          </g>
        ))}
        {/* shutter */}
        <rect x={SIZE / 2 - 14} y={0} width={28} height={2.5} fill="var(--volt)" opacity={0.6} />
        {STATIONS.map((s) => {
          const [sx, sz] = toMap(s.position[0], s.position[1])
          const meta = site.stations.find((m) => m.id === s.id)!
          const on = active === s.id
          const tgt = autopilot === s.id
          return (
            <g key={s.id}>
              <circle cx={sx} cy={sz} r={s.radius * k} fill={on ? 'rgba(245,230,59,0.25)' : 'none'} stroke="var(--volt)" strokeOpacity={on || tgt ? 1 : 0.45} strokeDasharray={tgt ? '2 2' : undefined} />
              <text x={sx} y={sz + (s.position[1] < 0 ? -s.radius * k - 3 : s.radius * k + 9)} textAnchor="middle" fontSize={7} letterSpacing={1} fill={on ? 'var(--volt)' : 'rgba(255,255,255,0.55)'} style={{ fontFamily: 'inherit', textTransform: 'uppercase' }}>
                {meta.label.split(' ')[0]}
              </text>
            </g>
          )
        })}
        {/* rover: chevron rotated by heading. heading 0 = +Z = down on map */}
        <g transform={`translate(${Math.max(2, Math.min(SIZE - 2, rx))} ${Math.max(2, Math.min(SIZE - 2, rz))}) rotate(${180 - (heading * 180) / Math.PI})`}>
          <path d="M0 -6 L4.5 5 L0 2.5 L-4.5 5 Z" fill={underground ? '#ff2bd6' : 'var(--volt)'} />
        </g>
      </svg>
    </div>
  )
}
