import { useEffect, useRef, useState } from 'react'
import { useStore, bayStore } from '../store/useStore'
import { site } from '../content/site'
import { audio } from '../audio/AudioManager'
import { isTouch } from './device'
import { Bolt } from '../ui/Bolt'

const CHAR_MS = 32
const BANKS = 3
const LOG = ['> battery ............ 100%', '> motors .............. ok', '> previous attempts .... 6', '> ambition ... unreasonable']

/** Boot overlay: the hangar lights up behind a translucent console while BOLT-7 wakes up. */
export function Boot() {
  const phase = useStore((s) => s.boot)
  const [typed, setTyped] = useState(0)
  const [lit, setLit] = useState(0)
  const [log, setLog] = useState(0)
  const timers = useRef<number[]>([])
  const skipped = useRef(false)

  const clear = () => timers.current.forEach(clearTimeout)

  const finishBoot = () => {
    if (skipped.current) return
    skipped.current = true
    clear()
    setTyped(site.bootLine.length)
    setLit(BANKS)
    setLog(LOG.length)
    bayStore.getState().setBootProgress(1)
    bayStore.getState().setBoot('prompt')
  }

  useEffect(() => {
    if (phase !== 'boot') return
    const line = site.bootLine
    for (let i = 1; i <= line.length; i++) timers.current.push(window.setTimeout(() => setTyped(i), i * CHAR_MS))
    const t0 = line.length * CHAR_MS + 200
    LOG.forEach((_, i) => timers.current.push(window.setTimeout(() => setLog(i + 1), t0 + i * 220)))
    const t1 = t0 + LOG.length * 220 + 200
    for (let b = 1; b <= BANKS; b++) {
      timers.current.push(
        window.setTimeout(() => {
          setLit(b)
          bayStore.getState().setBootProgress(b / BANKS)
          audio.play('lightsOn')
        }, t1 + (b - 1) * 380),
      )
    }
    timers.current.push(window.setTimeout(finishBoot, t1 + BANKS * 380 + 250))
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.metaKey || e.ctrlKey || e.altKey)) return
      finishBoot()
    }
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
  const justRead = () => {
    audio.play('click')
    bayStore.getState().setFallback(true)
  }

  if (phase === 'live') return null
  const touch = isTouch()
  const prompt = phase === 'prompt'

  return (
    <div className="fixed inset-0 z-50 flex flex-col select-none overflow-hidden" style={{ background: prompt ? 'rgba(11,12,15,0.72)' : 'rgba(11,12,15,0.97)', transition: 'background 900ms ease' }}>
      {/* corner chrome */}
      <div className="flex items-start justify-between p-4 sm:p-6">
        <div>
          <div className="label">Masters Union</div>
          <div className="label text-volt">Robotics Club</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1.5">
            {Array.from({ length: BANKS }).map((_, i) => (
              <span key={i} className="inline-block w-7 h-1 transition-colors duration-200" style={{ background: i < lit ? 'var(--volt)' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <div className="label">light banks</div>
        </div>
      </div>

      {/* centre */}
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-5xl grid md:grid-cols-[auto_1fr] items-center gap-6 md:gap-12">
          <div className={`justify-self-center ${prompt ? 'bolt-bob' : 'opacity-60'} transition-opacity duration-700`}>
            <Bolt size={prompt ? 230 : 170} track={prompt} mood={prompt ? 'happy' : 'sleep'} />
          </div>
          <div className="text-center md:text-left">
            <div className="text-[11px] sm:text-xs tracking-[0.28em] text-volt mb-3 min-h-[1.2em]">
              <span className={typed < site.bootLine.length ? 'cursor' : ''}>{site.bootLine.slice(0, typed)}</span>
            </div>
            <h1 className="font-display font-bold leading-[0.9] tracking-[-0.03em] text-white text-[clamp(56px,13vw,150px)]">
              MU<span className="text-volt">VOLT</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70 max-w-md mx-auto md:mx-0">{site.tagline}</p>

            <ul className="mt-5 space-y-0.5 text-[11px] sm:text-xs text-white/45 h-[5.5em]">
              {LOG.slice(0, log).map((l) => (
                <li key={l} className="rise">{l}</li>
              ))}
            </ul>

            {prompt && (
              <div className="rise mt-4 flex flex-col sm:flex-row items-center md:items-start gap-3">
                <button
                  onClick={takeControl}
                  autoFocus
                  className="relative bracket press w-full sm:w-auto px-8 py-4 border border-volt text-volt text-xs tracking-[0.3em] uppercase hover:bg-volt hover:text-ink"
                >
                  {touch ? 'Tap to take control' : 'Click to take control'}
                </button>
                <button onClick={justRead} className="press w-full sm:w-auto px-6 py-4 text-xs tracking-[0.25em] uppercase text-white/60 hover:text-white border border-white/10">
                  Just read, no driving
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between p-4 sm:p-6 label">
        <span>{touch ? 'joystick · boost · horn' : 'WASD drive · shift boost · space horn · esc close'}</span>
        <span>bay 7 · attempt 7</span>
      </div>
    </div>
  )
}
