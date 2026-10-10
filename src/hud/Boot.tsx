import { useEffect, useRef, useState } from 'react'
import { useStore, bayStore } from '../store/useStore'
import { site } from '../content/site'
import { audio } from '../audio/AudioManager'
import { isTouch } from './device'

const CHAR_MS = 40
const BANKS = 3

/** Black screen, typed boot line, light banks thunking on, then the take-control prompt. */
export function Boot() {
  const phase = useStore((s) => s.boot)
  const [typed, setTyped] = useState(0)
  const [lit, setLit] = useState(0)
  const timers = useRef<number[]>([])
  const skipped = useRef(false)

  const clear = () => timers.current.forEach(clearTimeout)

  const finishBoot = () => {
    if (skipped.current) return
    skipped.current = true
    clear()
    setTyped(site.bootLine.length)
    setLit(BANKS)
    bayStore.getState().setBootProgress(1)
    bayStore.getState().setBoot('prompt')
  }

  useEffect(() => {
    if (phase !== 'boot') return
    const line = site.bootLine
    for (let i = 1; i <= line.length; i++) timers.current.push(window.setTimeout(() => setTyped(i), i * CHAR_MS))
    const t0 = line.length * CHAR_MS + 350
    for (let b = 1; b <= BANKS; b++) {
      timers.current.push(
        window.setTimeout(() => {
          setLit(b)
          bayStore.getState().setBootProgress(b / BANKS)
          audio.play('lightsOn')
        }, t0 + (b - 1) * 420),
      )
    }
    timers.current.push(window.setTimeout(finishBoot, t0 + BANKS * 420 + 300))
    const skip = () => finishBoot()
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      clear()
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const takeControl = () => {
    const s = bayStore.getState()
    s.enableAudio()
    void audio.enable()
    audio.play('click')
    s.setBoot('live')
  }

  if (phase === 'live') return null
  const touch = isTouch()

  return (
    <div className="fixed inset-0 z-50 bg-ink flex flex-col items-center justify-center select-none" style={{ opacity: phase === 'prompt' ? 1 : 1 }}>
      <div className="absolute top-6 left-6 label">{site.club} · bay 7</div>
      <div className="absolute top-6 right-6 label flex gap-2">
        {Array.from({ length: BANKS }).map((_, i) => (
          <span key={i} className="inline-block w-6 h-1 transition-colors duration-150" style={{ background: i < lit ? 'var(--volt)' : 'rgba(255,255,255,0.12)' }} />
        ))}
      </div>

      <div className="text-sm sm:text-base tracking-[0.2em] text-volt" style={{ minHeight: '1.5em' }}>
        <span className={typed < site.bootLine.length ? 'cursor' : ''}>{site.bootLine.slice(0, typed)}</span>
      </div>

      {phase === 'prompt' && (
        <div className="rise mt-12 flex flex-col items-center gap-5">
          <div className="font-display font-bold text-[clamp(44px,9vw,96px)] leading-none tracking-tight text-white">
            BOLT<span className="text-volt">-7</span>
          </div>
          <p className="label">{site.tagline}</p>
          <button
            onClick={takeControl}
            className="relative bracket press mt-4 px-8 py-4 border border-volt/60 text-volt text-xs tracking-[0.3em] uppercase hover:bg-volt hover:text-ink"
            autoFocus
          >
            {touch ? 'Tap to take control' : 'Click to take control'}
          </button>
          <p className="label mt-2 opacity-70">{touch ? 'joystick · boost · horn' : 'WASD drive · shift boost · space horn'}</p>
        </div>
      )}
    </div>
  )
}
