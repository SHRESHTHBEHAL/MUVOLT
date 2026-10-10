import { describe, it, expect } from 'vitest'
import { fromKeys, fromJoystick, merge, type InputState } from '../../src/logic/input'

const keys = (...codes: string[]) => new Set(codes)
const zero: InputState = { throttle: 0, steer: 0, boost: false, horn: false }

describe('fromKeys', () => {
  it('W drives forward, ArrowDown reverses', () => {
    expect(fromKeys(keys('KeyW')).throttle).toBe(1)
    expect(fromKeys(keys('ArrowDown')).throttle).toBe(-1)
  })
  it('A steers left, D steers right', () => {
    expect(fromKeys(keys('KeyA')).steer).toBe(-1)
    expect(fromKeys(keys('KeyD')).steer).toBe(1)
  })
  it('Shift boosts and Space honks', () => {
    const s = fromKeys(keys('ShiftLeft', 'Space'))
    expect(s.boost).toBe(true)
    expect(s.horn).toBe(true)
  })
  it('W and S cancel', () => {
    expect(fromKeys(keys('KeyW', 'KeyS')).throttle).toBe(0)
  })
})

describe('fromJoystick', () => {
  it('pushing up drives forward', () => {
    expect(fromJoystick(0, -1, false, false).throttle).toBe(1)
  })
  it('pushing right steers right', () => {
    expect(fromJoystick(0.5, 0, false, false).steer).toBe(0.5)
  })
  it('clamps out-of-range magnitudes to 1', () => {
    const s = fromJoystick(2, 2, false, false)
    expect(s.steer).toBe(1)
    expect(s.throttle).toBe(-1)
  })
})

describe('merge', () => {
  it('override wins when it has any input', () => {
    const o = { ...zero, throttle: 1 }
    expect(merge({ ...zero, steer: -1 }, o)).toEqual(o)
  })
  it('primary wins when override is idle or null', () => {
    const p = { ...zero, steer: -1 }
    expect(merge(p, zero)).toEqual(p)
    expect(merge(p, null)).toEqual(p)
  })
})
