/**
 * One animated line illustration per project. Pure SVG + CSS keyframes
 * (see styles.css, "machines"). Keyed by project id so content stays data.
 */
const V = '#f5e63b'
const S = '#4fa3d1'
const M = '#9aa0ab'
const D = '#2b303a'

function Rover() {
  return (
    <svg viewBox="0 0 200 120" className="machine machine-rover">
      <path d="M30 70 h140 l-10 -26 h-120 z" fill={D} stroke={M} strokeWidth="2" />
      <rect x="70" y="30" width="60" height="16" rx="4" fill={V} />
      <line x1="140" y1="44" x2="150" y2="14" stroke={M} strokeWidth="2" />
      <circle cx="151" cy="12" r="3" fill="#ff3b3b" className="blink" />
      {[52, 100, 148].map((x) => (
        <g key={x} className="wheel" style={{ transformOrigin: `${x}px 84px` }}>
          <circle cx={x} cy="84" r="14" fill="#0e0f12" stroke={M} strokeWidth="2" />
          <line x1={x} y1="72" x2={x} y2="96" stroke={M} strokeWidth="2" />
          <line x1={x - 12} y1="84" x2={x + 12} y2="84" stroke={M} strokeWidth="2" />
        </g>
      ))}
      <path className="scan" d="M160 40 l30 -20" stroke={S} strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  )
}

function Hexapod() {
  return (
    <svg viewBox="0 0 200 120" className="machine machine-hex">
      <ellipse cx="100" cy="60" rx="40" ry="22" fill={D} stroke={M} strokeWidth="2" />
      <circle cx="100" cy="60" r="8" fill={V} />
      {[-1, 1].map((side) =>
        [0, 1, 2].map((i) => {
          const x = 70 + i * 30
          return (
            <g key={`${side}${i}`} className={`leg leg-${i % 2}`} style={{ transformOrigin: `${x}px ${60 + side * 18}px` }}>
              <polyline points={`${x},${60 + side * 18} ${x + side * 0},${60 + side * 40} ${x + 8},${60 + side * 52}`} fill="none" stroke={M} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        }),
      )}
    </svg>
  )
}

function Turret() {
  return (
    <svg viewBox="0 0 200 120" className="machine machine-turret">
      <rect x="60" y="86" width="80" height="14" rx="3" fill={D} stroke={M} strokeWidth="2" />
      <rect x="88" y="66" width="24" height="22" fill={D} stroke={M} strokeWidth="2" />
      <g className="pan" style={{ transformOrigin: '100px 60px' }}>
        <circle cx="100" cy="60" r="16" fill={D} stroke={M} strokeWidth="2" />
        <rect x="100" y="55" width="54" height="10" rx="2" fill={M} />
        <circle cx="100" cy="60" r="5" fill="#ff3b3b" className="blink" />
        <path className="beam" d="M154 60 l40 -14 v28 z" fill={S} opacity="0.18" />
      </g>
      <circle cx="40" cy="40" r="6" fill={V} className="target" />
    </svg>
  )
}

function Hand() {
  return (
    <svg viewBox="0 0 200 120" className="machine machine-hand">
      <rect x="70" y="60" width="60" height="44" rx="10" fill={D} stroke={M} strokeWidth="2" />
      {[78, 96, 114, 132].map((x, i) => (
        <g key={x} className="finger" style={{ transformOrigin: `${x}px 60px`, animationDelay: `${i * 90}ms` }}>
          <rect x={x - 6} y="26" width="12" height="36" rx="6" fill={V} />
        </g>
      ))}
      <g className="thumb" style={{ transformOrigin: '70px 80px' }}>
        <rect x="42" y="74" width="30" height="12" rx="6" fill={V} />
      </g>
      <line x1="100" y1="104" x2="100" y2="118" stroke={M} strokeWidth="4" />
    </svg>
  )
}

function Swarm() {
  return (
    <svg viewBox="0 0 200 120" className="machine machine-swarm">
      <circle cx="100" cy="60" r="34" fill="none" stroke={M} strokeWidth="1" strokeDasharray="2 4" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} className="bot" style={{ transformOrigin: '100px 60px', animationDelay: `${-i * 1.2}s` }}>
          <g transform="translate(134 60)">
            <rect x="-7" y="-7" width="14" height="14" rx="3" fill={D} stroke={V} strokeWidth="2" />
            <circle cx="0" cy="0" r="2" fill={S} />
          </g>
        </g>
      ))}
      <circle cx="100" cy="60" r="4" fill={V} className="blink" />
    </svg>
  )
}

function LineFollower() {
  return (
    <svg viewBox="0 0 200 120" className="machine machine-lineo">
      <path d="M10 90 C 60 90, 60 40, 100 40 S 140 90, 190 90" fill="none" stroke="#000" strokeWidth="5" />
      <path d="M10 90 C 60 90, 60 40, 100 40 S 140 90, 190 90" fill="none" stroke={M} strokeWidth="1" strokeDasharray="4 4" />
      <g className="lineo">
        <rect x="-14" y="-9" width="28" height="18" rx="4" fill={D} stroke={V} strokeWidth="2" />
        <circle cx="-8" cy="-11" r="2.5" fill="#ff3b3b" />
        <circle cx="8" cy="-11" r="2.5" fill="#ff3b3b" />
      </g>
    </svg>
  )
}

const MAP: Record<string, () => React.ReactElement> = { atlas: Rover, hex: Hexapod, sentry: Turret, grip: Hand, swarm: Swarm, lineo: LineFollower }

export function Machine({ id }: { id: string }) {
  const C = MAP[id] ?? Rover
  return <C />
}
