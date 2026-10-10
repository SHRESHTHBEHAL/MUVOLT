import { describe, it, expect } from 'vitest'
import { selectTier, tierSettings } from '../../src/logic/tier'

const d = (o: Partial<Parameters<typeof selectTier>[0]>) => ({ isMobile: false, dpr: 1, benchmarkMs: 10, webgl2: true, ...o })

describe('selectTier', () => {
  it('no webgl2 is always low', () => {
    expect(selectTier(d({ webgl2: false, benchmarkMs: 1 }))).toBe('low')
  })
  it('mobile is medium only when fast', () => {
    expect(selectTier(d({ isMobile: true, benchmarkMs: 39.9 }))).toBe('medium')
    expect(selectTier(d({ isMobile: true, benchmarkMs: 40 }))).toBe('low')
  })
  it('desktop steps high → medium → low on benchmark', () => {
    expect(selectTier(d({ benchmarkMs: 59.9 }))).toBe('high')
    expect(selectTier(d({ benchmarkMs: 60 }))).toBe('medium')
    expect(selectTier(d({ benchmarkMs: 119.9 }))).toBe('medium')
    expect(selectTier(d({ benchmarkMs: 120 }))).toBe('low')
  })
})

describe('tierSettings', () => {
  it('matches the spec table', () => {
    expect(tierSettings('high')).toEqual({ shadows: true, bloom: true, maxDpr: 1.5, particleScale: 1 })
    expect(tierSettings('medium')).toEqual({ shadows: true, bloom: false, maxDpr: 1.25, particleScale: 0.5 })
    expect(tierSettings('low')).toEqual({ shadows: false, bloom: false, maxDpr: 0.75, particleScale: 0.2 })
  })
})
