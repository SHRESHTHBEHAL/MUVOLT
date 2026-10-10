import type { InputState } from './input'

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** heading in radians, 0 = facing +Z, positive = turning toward +X. */
export function steerToward(
  pos: [number, number],
  heading: number,
  target: [number, number],
  arriveRadius: number,
): InputState & { arrived: boolean } {
  const dx = target[0] - pos[0]
  const dz = target[1] - pos[1]
  const dist = Math.hypot(dx, dz)
  if (dist < arriveRadius) return { throttle: 0, steer: 0, boost: false, horn: false, arrived: true }
  const desired = Math.atan2(dx, dz)
  const diff = wrapAngle(desired - heading)
  // positive steer turns toward -X (screen right when facing +Z), so a target at +X needs negative steer
  const steer = Math.max(-1, Math.min(1, -diff / (Math.PI / 4)))
  const throttle = dist < arriveRadius * 2 ? 0.4 : 1
  return { throttle, steer, boost: false, horn: false, arrived: false }
}

const CENTER: [number, number] = [0, 0]
const NEAR_CENTER = 6

/** Every prop sits behind its ring near a wall, so going via the centre clears them all. */
export function planRoute(pos: [number, number], target: [number, number]): [number, number][] {
  const nearCenter = Math.hypot(pos[0] - CENTER[0], pos[1] - CENTER[1]) < NEAR_CENTER
  const nearTarget = Math.hypot(pos[0] - target[0], pos[1] - target[1]) < NEAR_CENTER
  const targetIsCenter = target[0] === CENTER[0] && target[1] === CENTER[1]
  if (nearCenter || nearTarget || targetIsCenter) return [target]
  return [CENTER, target]
}

/** Tracks "driving but not moving"; while recovering, the caller should reverse. */
export class StuckDetector {
  private stuckFor = 0
  private recovering = 0
  constructor(private threshold = 1.2, private recoverFor = 0.8) {}
  /** returns true while a recovery reverse should be applied */
  update(speed: number, throttle: number, dt: number): boolean {
    if (this.recovering > 0) {
      this.recovering -= dt
      return this.recovering > 1e-6
    }
    if (Math.abs(throttle) > 0 && speed < 0.4) this.stuckFor += dt
    else this.stuckFor = 0
    if (this.stuckFor >= this.threshold) {
      this.stuckFor = 0
      this.recovering = this.recoverFor
      return true
    }
    return false
  }
}
