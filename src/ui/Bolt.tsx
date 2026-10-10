import { useEffect, useRef } from 'react'

/**
 * BOLT-7 as a flat illustration. Eyes follow the pointer when `track` is on,
 * it blinks, bobs, and the antenna tip pulses. Pure SVG + CSS, no images.
 */
export function Bolt({ size = 240, track = false, mood = 'idle', className = '' }: { size?: number; track?: boolean; mood?: 'idle' | 'happy' | 'sleep'; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!track) return
    const el = ref.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const dy = (e.clientY - (r.top + r.height * 0.42)) / window.innerHeight
      el.style.setProperty('--ex', `${Math.max(-1, Math.min(1, dx * 2.4)) * 5}px`)
      el.style.setProperty('--ey', `${Math.max(-1, Math.min(1, dy * 2.4)) * 3}px`)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [track])

  const eyeH = mood === 'sleep' ? 2 : 10
  return (
    <svg ref={ref} viewBox="0 0 240 200" width={size} height={(size * 200) / 240} className={`bolt ${className}`} role="img" aria-label="BOLT-7, the club rover">
      <defs>
        <linearGradient id="bolt-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a404b" />
          <stop offset="1" stopColor="#23272f" />
        </linearGradient>
        <linearGradient id="bolt-deck" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff07a" />
          <stop offset="1" stopColor="#f5e63b" />
        </linearGradient>
        <filter id="bolt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* shadow */}
      <ellipse cx="120" cy="186" rx="86" ry="7" fill="#000" opacity="0.35" className="bolt-shadow" />

      <g className="bolt-body">
        {/* antenna */}
        <line x1="178" y1="72" x2="190" y2="30" stroke="#9aa0ab" strokeWidth="3" strokeLinecap="round" />
        <circle cx="191" cy="27" r="5" fill="#ff3b3b" filter="url(#bolt-glow)" className="bolt-antenna" />

        {/* wheels (back pair peeks out) */}
        <g className="bolt-wheels">
          {[56, 184].map((x) => (
            <g key={x} transform={`translate(${x} 152)`}>
              <circle r="24" fill="#0e0f12" />
              <circle r="12" fill="#2b303a" />
              <circle r="4" fill="#9aa0ab" />
              <g className="bolt-spin">
                {[0, 60, 120].map((a) => <rect key={a} x="-1.5" y="-22" width="3" height="10" fill="#1d2027" transform={`rotate(${a})`} />)}
              </g>
            </g>
          ))}
        </g>

        {/* chassis */}
        <rect x="34" y="92" width="172" height="62" rx="14" fill="url(#bolt-body)" stroke="#4a515e" strokeWidth="2" />
        {/* hazard stripe */}
        <rect x="34" y="138" width="172" height="6" fill="#f5e63b" opacity="0.9" />
        {/* deck */}
        <rect x="58" y="62" width="124" height="44" rx="10" fill="url(#bolt-deck)" />
        {/* sensor mast */}
        <rect x="104" y="48" width="32" height="18" rx="6" fill="#1a1d24" />
        <circle cx="120" cy="57" r="4" fill="#4fa3d1" filter="url(#bolt-glow)" />

        {/* visor */}
        <rect x="66" y="72" width="108" height="26" rx="8" fill="#0b0c0f" />
        <g className="bolt-eyes" style={{ transform: 'translate(var(--ex, 0px), var(--ey, 0px))' }}>
          <rect x="86" y={85 - eyeH / 2} width="18" height={eyeH} rx={eyeH / 2} fill="#4fa3d1" filter="url(#bolt-glow)" className="bolt-eye" />
          <rect x="136" y={85 - eyeH / 2} width="18" height={eyeH} rx={eyeH / 2} fill="#4fa3d1" filter="url(#bolt-glow)" className="bolt-eye" />
          {mood === 'happy' && (
            <>
              <path d="M86 80 q9 -8 18 0" stroke="#0b0c0f" strokeWidth="4" fill="none" />
              <path d="M136 80 q9 -8 18 0" stroke="#0b0c0f" strokeWidth="4" fill="none" />
            </>
          )}
        </g>

        {/* headlights + grille */}
        <circle cx="48" cy="120" r="6" fill="#fff3d6" filter="url(#bolt-glow)" />
        <circle cx="192" cy="120" r="6" fill="#ff2a2a" opacity="0.9" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={92 + i * 16} y="112" width="8" height="18" rx="2" fill="#1a1d24" />)}
        {/* front wheels */}
        {[76, 164].map((x) => (
          <g key={x} transform={`translate(${x} 158)`}>
            <circle r="24" fill="#0e0f12" />
            <circle r="12" fill="#2b303a" />
            <circle r="4" fill="#9aa0ab" />
            <g className="bolt-spin">
              {[0, 60, 120].map((a) => <rect key={a} x="-1.5" y="-22" width="3" height="10" fill="#1d2027" transform={`rotate(${a})`} />)}
            </g>
          </g>
        ))}
        {/* name plate */}
        <text x="120" y="152" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2" fill="#9aa0ab">BOLT-7</text>
      </g>
    </svg>
  )
}
