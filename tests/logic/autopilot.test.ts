import { describe, it, expect } from 'vitest'
import { steerToward, planRoute, StuckDetector } from '../../src/logic/autopilot'

describe('steerToward', () => {
  it('drives straight at a target directly ahead', () => {
    const r = steerToward([0, 0], 0, [0, 20], 1)
    expect(r.steer).toBeCloseTo(0)
    expect(r.throttle).toBe(1)
    expect(r.arrived).toBe(false)
  })
  it('steers hard left for a target 90° to the left', () => {
    // heading 0 = facing +Z with Y up; the left-hand side is +X (right-handed axes)
    const r = steerToward([0, 0], 0, [20, 0], 1)
    expect(r.steer).toBe(-1)
  })
  it('steers hard right for a target 90° to the right', () => {
    expect(steerToward([0, 0], 0, [-20, 0], 1).steer).toBe(1)
  })
  it('eases off when close and stops when arrived', () => {
    expect(steerToward([0, 0], 0, [0, 1.5], 1).throttle).toBe(0.4)
    const r = steerToward([0, 0], 0, [0, 0.5], 1)
    expect(r.arrived).toBe(true)
    expect(r.throttle).toBe(0)
  })
})

describe('planRoute', () => {
  it('routes via the floor center when far from it', () => {
    expect(planRoute([-14, -8], [14, 10])).toEqual([[0, 0], [14, 10]])
  })
  it('goes direct when already near the center', () => {
    expect(planRoute([2, -3], [14, 10])).toEqual([[14, 10]])
  })
  it('goes direct when the target is the center-most leg already', () => {
    expect(planRoute([-14, -8], [0, 0])).toEqual([[0, 0]])
  })
})

describe('StuckDetector', () => {
  it('flags stuck after 1.2 s of no movement while driving, then recovers for 0.8 s', () => {
    const d = new StuckDetector()
    expect(d.update(0.1, 1, 0.6)).toBe(false)
    expect(d.update(0.1, 1, 0.5)).toBe(false) // 1.1 s
    expect(d.update(0.1, 1, 0.2)).toBe(true) // 1.3 s: stuck
    expect(d.update(0.1, 1, 0.5)).toBe(true) // 0.5 s into recovery
    expect(d.update(0.1, 1, 0.3)).toBe(false) // 0.8 s: recovery over
  })
  it('never flags while moving', () => {
    const d = new StuckDetector()
    expect(d.update(5, 1, 5)).toBe(false)
  })
})

describe('planRoute near the target', () => {
  it('goes direct when the target is close, even far from the centre', () => {
    expect(planRoute([12, 8], [14, 10])).toEqual([[14, 10]])
  })
})
