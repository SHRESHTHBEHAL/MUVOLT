import { useEffect, useRef, useState } from 'react'
import { useStore, bayStore } from '../store/useStore'
import type { Tier } from '../logic/tier'
import { audio } from '../audio/AudioManager'

const TIERS: { label: string; value: Tier | null }[] = [
  { label: 'Auto', value: null },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

export function Settings() {
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const override = useStore((s) => s.tierOverride)
  const tier = useStore((s) => s.tier)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { audio.play('click'); setOpen((o) => !o) }}
        aria-label="Settings"
        className={`press console px-3 py-2 text-[10px] tracking-[0.2em] uppercase ${open ? 'text-volt' : 'text-white/70 hover:text-volt'}`}
      >
        ⚙ {tier}
      </button>
      {open && (
        <div className="rise absolute right-0 mt-2 w-52 console bracket p-3 text-xs" style={{ transformOrigin: 'top right' }}>
          <div className="label mb-2">Graphics</div>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {TIERS.map((t) => (
              <button
                key={t.label}
                onClick={() => { audio.play('click'); bayStore.getState().setTierOverride(t.value) }}
                className={`press px-2 py-1.5 text-[10px] tracking-[0.15em] uppercase border ${
                  override === t.value ? 'border-volt text-ink bg-volt' : 'border-white/10 text-white/70 hover:border-volt/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="label mb-2">Sound</div>
          <button
            onClick={() => { const m = !muted; setMuted(m); audio.mute(m) }}
            className={`press w-full px-2 py-1.5 text-[10px] tracking-[0.15em] uppercase border ${muted ? 'border-white/10 text-white/50' : 'border-volt/50 text-volt'}`}
          >
            {muted ? 'Muted' : 'On'}
          </button>
        </div>
      )}
    </div>
  )
}
