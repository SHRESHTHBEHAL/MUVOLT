export type Tier = 'high' | 'medium' | 'low'

export interface DeviceInfo {
  isMobile: boolean
  dpr: number
  benchmarkMs: number
  webgl2: boolean
}

export interface TierSettings {
  shadows: boolean
  bloom: boolean
  maxDpr: number
  particleScale: number
}

export function selectTier(d: DeviceInfo): Tier {
  if (!d.webgl2) return 'low'
  if (d.isMobile) return d.benchmarkMs < 25 ? 'medium' : 'low'
  if (d.benchmarkMs < 40) return 'high'
  if (d.benchmarkMs < 90) return 'medium'
  return 'low'
}

const SETTINGS: Record<Tier, TierSettings> = {
  high: { shadows: true, bloom: true, maxDpr: 1.5, particleScale: 1 },
  medium: { shadows: true, bloom: false, maxDpr: 1.25, particleScale: 0.5 },
  low: { shadows: false, bloom: false, maxDpr: 0.75, particleScale: 0.2 },
}

export function tierSettings(t: Tier): TierSettings {
  return SETTINGS[t]
}
