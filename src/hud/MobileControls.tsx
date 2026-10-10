import { useEffect, useRef, useState } from 'react'
import { joystick } from '../hooks/useInput'
import { fromJoystick } from '../logic/input'

const RADIUS = 44

/** Left-thumb joystick plus boost and horn buttons. Only rendered on touch devices. */
export function MobileControls() {
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const state = useRef({ dx: 0, dy: 0, boost: false, horn: false, pointer: -1 })
  const [, force] = useState(0)

  const push = () => {
    const s = state.current
    joystick.state = fromJoystick(s.dx, s.dy, s.boost, s.horn)
    if (knob.current) knob.current.style.transform = `translate(${s.dx * RADIUS}px, ${s.dy * RADIUS}px)`
  }

  useEffect(() => {
    // re-anchor on rotation: the joystick is position:fixed, so nothing to recompute,
    // but a stale pointer must not survive a layout change
    const reset = () => { state.current.dx = 0; state.current.dy = 0; state.current.pointer = -1; push(); force((n) => n + 1) }
    window.addEventListener('orientationchange', reset)
    window.addEventListener('resize', reset)
    return () => { window.removeEventListener('orientationchange', reset); window.removeEventListener('resize', reset) }
  }, [])

  const onDown = (e: React.PointerEvent) => {
    if (state.current.pointer !== -1) return
    state.current.pointer = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    onMove(e)
  }
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerId !== state.current.pointer || !base.current) return
    const r = base.current.getBoundingClientRect()
    let dx = (e.clientX - (r.left + r.width / 2)) / RADIUS
    let dy = (e.clientY - (r.top + r.height / 2)) / RADIUS
    const m = Math.hypot(dx, dy)
    if (m > 1) { dx /= m; dy /= m }
    state.current.dx = dx
    state.current.dy = dy
    push()
  }
  const onUp = (e: React.PointerEvent) => {
    if (e.pointerId !== state.current.pointer) return
    state.current.pointer = -1
    state.current.dx = 0
    state.current.dy = 0
    push()
  }

  const hold = (key: 'boost' | 'horn') => ({
    onPointerDown: (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); state.current[key] = true; push() },
    onPointerUp: () => { state.current[key] = false; push() },
    onPointerCancel: () => { state.current[key] = false; push() },
  })

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 pointer-events-none select-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div
        ref={base}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="pointer-events-auto absolute left-5 bottom-6 w-[120px] h-[120px] rounded-full border border-volt/40 bg-black/40 backdrop-blur-sm touch-none"
      >
        <div className="absolute inset-[14px] rounded-full border border-white/10" />
        <div ref={knob} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 w-12 h-12 rounded-full bg-volt shadow-[0_0_24px_rgba(245,230,59,0.5)]" />
      </div>
      <div className="pointer-events-auto absolute right-5 bottom-[180px] flex flex-col gap-3 items-end">
        <button {...hold('boost')} className="press w-16 h-16 rounded-full border border-steel/60 bg-black/40 text-steel text-[10px] tracking-[0.2em] uppercase touch-none">boost</button>
        <button {...hold('horn')} className="press w-16 h-16 rounded-full border border-volt/60 bg-black/40 text-volt text-[10px] tracking-[0.2em] uppercase touch-none">horn</button>
      </div>
    </div>
  )
}
