import { describe, it, expect } from 'vitest'
import { stepTelemetry } from '../../src/logic/telemetry'

describe('stepTelemetry', () => {
  it('drains 0.8% per second at full speed', () => {
    const t = stepTelemetry({ speed: 0, battery: 100, distance: 0 }, 10, 10, false)
    expect(t.battery).toBeCloseTo(92)
    expect(t.distance).toBeCloseTo(100)
    expect(t.speed).toBe(10)
  })
  it('recharges 20% per second when docked', () => {
    expect(stepTelemetry({ speed: 0, battery: 50, distance: 0 }, 0, 1, true).battery).toBeCloseTo(70)
  })
  it('clamps at 0 and still reports speed', () => {
    const t = stepTelemetry({ speed: 0, battery: 0.1, distance: 0 }, 10, 5, false)
    expect(t.battery).toBe(0)
    expect(t.speed).toBe(10)
  })
  it('clamps at 100', () => {
    expect(stepTelemetry({ speed: 0, battery: 99, distance: 0 }, 0, 1, true).battery).toBe(100)
  })
})
