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
  const steer = Math.max(-1, Math.min(1, diff / (Math.PI / 4)))
  const throttle = dist < arriveRadius * 2 ? 0.4 : 1
  return { throttle, steer, boost: false, horn: false, arrived: false }
}
