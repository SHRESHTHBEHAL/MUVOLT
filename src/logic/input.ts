export interface InputState {
  throttle: number
  steer: number
  boost: boolean
  horn: boolean
}

export interface KeySet {
  has(code: string): boolean
}

export const IDLE: InputState = { throttle: 0, steer: 0, boost: false, horn: false }

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v))

export function fromKeys(keys: KeySet): InputState {
  const fwd = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0
  const back = keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0
  const left = keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0
  const right = keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0
  return {
    throttle: fwd - back,
    steer: right - left,
    boost: keys.has('ShiftLeft') || keys.has('ShiftRight'),
    horn: keys.has('Space'),
  }
}

export function fromJoystick(dx: number, dy: number, boost: boolean, horn: boolean): InputState {
  return { throttle: clamp1(-dy), steer: clamp1(dx), boost, horn }
}

export function isActive(s: InputState): boolean {
  return s.throttle !== 0 || s.steer !== 0 || s.boost || s.horn
}

export function merge(primary: InputState, override: InputState | null): InputState {
  return override && isActive(override) ? override : primary
}
