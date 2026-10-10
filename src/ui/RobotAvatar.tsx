/** A little robot face generated from an id, so every crew member gets a different bot. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const HEADS = ['M12 14 h40 a6 6 0 0 1 6 6 v28 a6 6 0 0 1 -6 6 h-40 a6 6 0 0 1 -6 -6 v-28 a6 6 0 0 1 6 -6 z', 'M32 12 a22 22 0 1 1 -0.1 0 z', 'M14 16 h36 l8 10 v22 l-8 6 h-36 l-8 -6 v-22 z', 'M10 20 h44 v30 h-44 z']
const COLORS = ['#f5e63b', '#4fa3d1', '#ff7a3d', '#9aa0ab', '#c9a8ff', '#2be4ff']

export function RobotAvatar({ seed, size = 56, className = '' }: { seed: string; size?: number; className?: string }) {
  const h = hash(seed)
  const head = HEADS[h % HEADS.length]
  const accent = COLORS[(h >> 3) % COLORS.length]
  const eye = (h >> 6) % 3 // 0 round, 1 visor, 2 squint
  const antenna = (h >> 9) % 2 === 0
  const ear = (h >> 11) % 2 === 0
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`avatar ${className}`} aria-hidden="true">
      {antenna && (
        <>
          <line x1="32" y1="14" x2="32" y2="4" stroke="#9aa0ab" strokeWidth="2" />
          <circle cx="32" cy="3" r="3" fill={accent} className="blink" />
        </>
      )}
      {ear && (
        <>
          <rect x="2" y="26" width="6" height="12" rx="2" fill={accent} />
          <rect x="56" y="26" width="6" height="12" rx="2" fill={accent} />
        </>
      )}
      <path d={head} fill="#2b303a" stroke="#4a515e" strokeWidth="2" />
      {eye === 0 && (
        <>
          <circle cx="23" cy="32" r="5" fill="#0b0c0f" />
          <circle cx="41" cy="32" r="5" fill="#0b0c0f" />
          <circle cx="23" cy="32" r="2.5" fill={accent} className="blink" />
          <circle cx="41" cy="32" r="2.5" fill={accent} className="blink" />
        </>
      )}
      {eye === 1 && (
        <>
          <rect x="16" y="27" width="32" height="10" rx="4" fill="#0b0c0f" />
          <rect x="20" y="30" width="9" height="4" rx="2" fill={accent} className="blink" />
          <rect x="35" y="30" width="9" height="4" rx="2" fill={accent} className="blink" />
        </>
      )}
      {eye === 2 && (
        <>
          <rect x="17" y="30" width="12" height="4" rx="2" fill={accent} />
          <rect x="35" y="30" width="12" height="4" rx="2" fill={accent} />
        </>
      )}
      <rect x="24" y="42" width="16" height="3" rx="1.5" fill={accent} opacity="0.7" />
    </svg>
  )
}
