import { useCallback, useRef } from 'react'
import { fromKeys, merge, IDLE, type InputState } from '../logic/input'
import { steerToward, planRoute, StuckDetector } from '../logic/autopilot'
import { stationById } from '../logic/stations'
import { bayStore } from '../store/useStore'
import { useKeyboard } from './useKeyboard'
import { roverState } from '../three/roverState'
import type { StationId } from '../content/types'

/** Written by the on-screen joystick (MobileControls); read every frame. */
export const joystick: { state: InputState } = { state: { ...IDLE } }

/**
 * Returns a per-frame getter that merges keyboard, joystick and autopilot.
 * Any manual input cancels autopilot.
 */
export function useInput(): (dt: number) => InputState {
  const keys = useKeyboard()
  const route = useRef<{ target: StationId; waypoints: [number, number][] } | null>(null)
  const stuck = useRef(new StuckDetector())
  const lastFrame = useRef<InputState>(IDLE)

  return useCallback(
    (dt: number) => {
      const s = bayStore.getState()
      const manual = merge(fromKeys(keys), joystick.state)
      if (!s.autopilotTarget) {
        route.current = null
        return manual
      }
      if (manual.throttle !== 0 || manual.steer !== 0) {
        s.setAutopilot(null)
        route.current = null
        return manual
      }
      const pos: [number, number] = [roverState.position.x, roverState.position.z]
      if (!route.current || route.current.target !== s.autopilotTarget) {
        route.current = { target: s.autopilotTarget, waypoints: planRoute(pos, stationById(s.autopilotTarget).position) }
      }
      const wps = route.current.waypoints
      const final = wps.length === 1
      const ap = steerToward(pos, roverState.heading, wps[0], final ? 1.2 : 3)
      if (ap.arrived) {
        if (final) {
          s.setAutopilot(null)
          route.current = null
          return { ...IDLE, horn: manual.horn }
        }
        wps.shift()
      }
      // wedged against something: back out while steering the other way
      if (stuck.current.update(roverState.speed, lastFrame.current.throttle, dt)) {
        const out = { throttle: -1, steer: -Math.sign(ap.steer || 1), boost: false, horn: manual.horn }
        lastFrame.current = out
        return out
      }
      // ease the throttle on sharp turns so the rover doesn't plough into things
      const throttle = Math.abs(ap.steer) > 0.8 ? ap.throttle * 0.45 : ap.throttle
      const out = { throttle, steer: ap.steer, boost: false, horn: manual.horn }
      lastFrame.current = out
      return out
    },
    [keys],
  )
}
