import { useCallback } from 'react'
import { fromKeys, merge, IDLE, type InputState } from '../logic/input'
import { steerToward } from '../logic/autopilot'
import { stationById } from '../logic/stations'
import { bayStore } from '../store/useStore'
import { useKeyboard } from './useKeyboard'

/** Written by the on-screen joystick (MobileControls); read every frame. */
export const joystick: { state: InputState } = { state: { ...IDLE } }

/**
 * Returns a per-frame getter that merges keyboard, joystick and autopilot.
 * Any manual input cancels autopilot.
 */
export function useInput(): () => InputState {
  const keys = useKeyboard()
  return useCallback(() => {
    const s = bayStore.getState()
    const manual = merge(fromKeys(keys), joystick.state)
    if (s.autopilotTarget) {
      if (manual.throttle !== 0 || manual.steer !== 0) {
        s.setAutopilot(null)
        return manual
      }
      const target = stationById(s.autopilotTarget)
      const ap = steerToward([s.roverPos[0], s.roverPos[2]], s.roverHeading, target.position, 1.2)
      if (ap.arrived) s.setAutopilot(null)
      return { ...ap, horn: manual.horn }
    }
    return manual
  }, [keys])
}
