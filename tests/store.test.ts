import { describe, it, expect } from 'vitest'
import { createBayStore } from '../src/store/useStore'

const memStorage = () => {
  const m = new Map<string, string>()
  return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => void m.set(k, v), map: m }
}

describe('store', () => {
  it('starts booting with a full battery and no secrets', () => {
    const s = createBayStore('high').getState()
    expect(s.boot).toBe('boot')
    expect(s.telemetry.battery).toBe(100)
    expect(Object.values(s.secrets).every((v) => v === false)).toBe(true)
    expect(s.turbo).toBe(false)
  })
  it('konami unlock enables turbo', () => {
    const st = createBayStore('high')
    st.getState().unlockSecret('konami')
    expect(st.getState().secrets.konami).toBe(true)
    expect(st.getState().turbo).toBe(true)
  })
  it('entering a station cancels autopilot', () => {
    const st = createBayStore('high')
    st.getState().setAutopilot('dock')
    st.getState().setActiveStation('lab')
    expect(st.getState().autopilotTarget).toBeNull()
    expect(st.getState().activeStation).toBe('lab')
  })
  it('starting autopilot closes the active station', () => {
    const st = createBayStore('high')
    st.getState().setActiveStation('lab')
    st.getState().setAutopilot('dock')
    expect(st.getState().activeStation).toBeNull()
    expect(st.getState().autopilotTarget).toBe('dock')
  })
  it('requestReset increments a counter', () => {
    const st = createBayStore('high')
    st.getState().requestReset()
    st.getState().requestReset()
    expect(st.getState().resetRequested).toBe(2)
  })
  it('tier override persists to storage and applies', () => {
    const storage = memStorage()
    const st = createBayStore('high', storage)
    st.getState().setTierOverride('low')
    expect(storage.map.get('muvolt.tier')).toBe('low')
    expect(st.getState().tier).toBe('low')
    st.getState().setTierOverride(null)
    expect(st.getState().tier).toBe('high')
  })
  it('reads a stored override on creation', () => {
    const storage = memStorage()
    storage.set('muvolt.tier', 'medium')
    expect(createBayStore('high', storage).getState().tier).toBe('medium')
  })
})
