import { describe, it, expect } from 'vitest'
import { HonkKeypad, Konami, CrateTower, hatchShouldDrop } from '../../src/logic/secrets'

describe('HonkKeypad', () => {
  it('unlocks on three honks within 2 s inclusive', () => {
    const k = new HonkKeypad()
    expect(k.honk(0, true)).toBe(false)
    expect(k.honk(1000, true)).toBe(false)
    expect(k.honk(2000, true)).toBe(true)
  })
  it('does not unlock when the third honk is late', () => {
    const k = new HonkKeypad()
    k.honk(0, true)
    k.honk(1000, true)
    expect(k.honk(2001, true)).toBe(false)
  })
  it('a honk away from the door resets the count', () => {
    const k = new HonkKeypad()
    k.honk(0, true)
    k.honk(500, false)
    k.honk(600, true)
    expect(k.honk(700, true)).toBe(false)
    expect(k.honk(800, true)).toBe(true)
  })
})

describe('Konami', () => {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
  it('fires on the full sequence', () => {
    const k = new Konami()
    const results = seq.map((c) => k.press(c))
    expect(results.slice(0, -1).every((r) => r === false)).toBe(true)
    expect(results.at(-1)).toBe(true)
  })
  it('a stray key resets progress', () => {
    const k = new Konami()
    seq.slice(0, 5).forEach((c) => k.press(c))
    k.press('KeyX')
    seq.slice(5).forEach((c) => expect(k.press(c)).toBe(false))
    expect(seq.map((c) => k.press(c)).at(-1)).toBe(true)
  })
})

describe('CrateTower', () => {
  it('resets exactly 10 s after a knock', () => {
    const t = new CrateTower()
    expect(t.knocked).toBe(false)
    t.knock(1000)
    expect(t.knocked).toBe(true)
    expect(t.shouldReset(10999)).toBe(false)
    expect(t.shouldReset(11000)).toBe(true)
  })
  it('never resets when standing', () => {
    expect(new CrateTower().shouldReset(99999)).toBe(false)
  })
})

describe('Konami with noise', () => {
  it('tolerates an extra Up at the start (held key auto-repeat)', () => {
    const k = new Konami()
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
    expect(seq.map((c) => k.press(c)).at(-1)).toBe(true)
  })
})

describe('hatchShouldDrop', () => {
  it('never drops the rover while autopilot is driving it', () => {
    expect(hatchShouldDrop({ distance: 0.5, y: 0.3, autopilot: 'lab' })).toBe(false)
  })
  it('drops when close, on the main floor, and driven by hand', () => {
    expect(hatchShouldDrop({ distance: 0.5, y: 0.3, autopilot: null })).toBe(true)
    expect(hatchShouldDrop({ distance: 1.4, y: 0.3, autopilot: null })).toBe(false)
    expect(hatchShouldDrop({ distance: 0.5, y: -5, autopilot: null })).toBe(false)
  })
})
