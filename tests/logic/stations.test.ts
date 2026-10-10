import { describe, it, expect } from 'vitest'
import { STATIONS, SPAWN, inRing, stationAt, resolveEntry } from '../../src/logic/stations'

const byId = (id: string) => STATIONS.find((s) => s.id === id)!

describe('stations', () => {
  it('defines five stations at the spec positions', () => {
    expect(STATIONS.map((s) => s.id)).toEqual(['workshop', 'crew', 'arena', 'lab', 'dock'])
    expect(byId('workshop').position).toEqual([-14, -8])
    expect(byId('dock').position).toEqual([0, 16])
    expect(STATIONS.every((s) => s.radius === 3.5)).toBe(true)
    expect(SPAWN).toEqual([0, 0])
  })
  it('inRing respects the radius boundary', () => {
    const lab = byId('lab')
    expect(inRing([14 + 3.49, 10], lab)).toBe(true)
    expect(inRing([14 + 3.51, 10], lab)).toBe(false)
  })
  it('stationAt finds each center and nothing at spawn', () => {
    for (const s of STATIONS) expect(stationAt(s.position)).toBe(s.id)
    expect(stationAt(SPAWN)).toBeNull()
  })
  it('entering a ring during autopilot opens it and cancels autopilot', () => {
    expect(resolveEntry(null, 'dock', 'lab')).toEqual({ active: 'lab', autopilot: null })
  })
  it('leaving a ring closes it and keeps autopilot', () => {
    expect(resolveEntry('lab', 'dock', null)).toEqual({ active: null, autopilot: 'dock' })
  })
  it('no change when nothing is entered and nothing is active', () => {
    expect(resolveEntry(null, 'dock', null)).toEqual({ active: null, autopilot: 'dock' })
  })
})
