import { describe, it, expect } from 'vitest'
import { steerToward } from '../../src/logic/autopilot'

describe('steerToward', () => {
  it('drives straight at a target directly ahead', () => {
    const r = steerToward([0, 0], 0, [0, 20], 1)
    expect(r.steer).toBeCloseTo(0)
    expect(r.throttle).toBe(1)
    expect(r.arrived).toBe(false)
  })
  it('steers hard left for a target 90° to the left', () => {
    // heading 0 = +Z; left of that is -X
    const r = steerToward([0, 0], 0, [-20, 0], 1)
    expect(r.steer).toBe(-1)
  })
  it('steers hard right for a target 90° to the right', () => {
    expect(steerToward([0, 0], 0, [20, 0], 1).steer).toBe(1)
  })
  it('eases off when close and stops when arrived', () => {
    expect(steerToward([0, 0], 0, [0, 1.5], 1).throttle).toBe(0.4)
    const r = steerToward([0, 0], 0, [0, 0.5], 1)
    expect(r.arrived).toBe(true)
    expect(r.throttle).toBe(0)
  })
})
