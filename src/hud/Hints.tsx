import { useEffect, useState } from 'react'
import { useStore, bayStore } from '../store/useStore'
import { SHUTTER_POS, HATCH_POS, CRATE_TOWER_POS } from '../three/Props'
import { isTouch } from './device'

interface Hint { key: string; text: string; done: boolean }

/** Contextual nudges for the secrets, shown when the rover is close enough to notice something. */
export function Hints() {
  const pos = useStore((s) => s.roverPos)
  const secrets = useStore((s) => s.secrets)
  const [hint, setHint] = useState<Hint | null>(null)
  const touch = isTouch()

  useEffect(() => {
    const [x, , z] = pos
    const near = (p: [number, number], r: number) => Math.hypot(x - p[0], z - p[1]) < r
    let next: Hint | null = null
    if (near(SHUTTER_POS, 9) && pos[1] > -1) next = { key: 'shutter', text: secrets.graveyard ? 'The graveyard. Pay your respects.' : `Keypad on the wall. ${touch ? 'Tap HORN' : 'Honk'} three times, fast.`, done: secrets.graveyard }
    else if (near(HATCH_POS, 5) && pos[1] > -1) next = { key: 'hatch', text: secrets.arcade ? 'The hatch. You know what’s down there.' : 'That hatch is not on the floor plan.', done: secrets.arcade }
    else if (near(CRATE_TOWER_POS, 6) && pos[1] > -1) next = { key: 'crates', text: secrets.crates ? 'They re-stack themselves. Every time.' : 'Parts crates. Very neatly stacked.', done: secrets.crates }
    else if (pos[1] < -2) next = { key: 'arcade', text: 'Sub-level. Drive into the cyan lift to go back up.', done: true }
    setHint((h) => (h?.key === next?.key && h?.done === next?.done ? h : next))
  }, [pos, secrets, touch])

  const found = Object.values(secrets).filter(Boolean).length
  const all = found === 4
  const live = bayStore.getState().boot === 'live'
  if (!live) return null

  return (
    <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[88px] md:bottom-8 z-20 flex flex-col items-center gap-2">
      {hint && (
        <div key={hint.key + String(hint.done)} className={`rise console px-4 py-2 text-xs tracking-[0.12em] ${hint.done ? 'text-white/60' : 'text-volt'}`}>
          {hint.text}
        </div>
      )}
      {all && <div className="rise label text-volt">4/4 · you found everything. the crew salutes you.</div>}
    </div>
  )
}
