import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore as useZustand } from 'zustand'
import type { StationId } from '../content/types'
import type { Tier } from '../logic/tier'
import type { Telemetry } from '../logic/telemetry'

export type BootPhase = 'boot' | 'prompt' | 'live'
export type SecretKey = 'graveyard' | 'arcade' | 'crates' | 'konami'

export interface TierStorage {
  get(key: string): string | null
  set(key: string, value: string): void
}

const TIER_KEY = 'muvolt.tier'
const isTier = (v: unknown): v is Tier => v === 'high' || v === 'medium' || v === 'low'

export interface State {
  boot: BootPhase
  setBoot(p: BootPhase): void
  bootProgress: number
  setBootProgress(p: number): void

  tier: Tier
  tierOverride: Tier | null
  setTierOverride(t: Tier | null): void

  audioEnabled: boolean
  enableAudio(): void

  activeStation: StationId | null
  setActiveStation(id: StationId | null): void
  autopilotTarget: StationId | null
  setAutopilot(id: StationId | null): void

  telemetry: Telemetry
  setTelemetry(t: Partial<Telemetry>): void
  heat: number
  setHeat(h: number): void

  secrets: Record<SecretKey, boolean>
  unlockSecret(k: SecretKey): void
  turbo: boolean

  roverPos: [number, number, number]
  roverHeading: number
  setRoverPose(p: [number, number, number], heading: number): void

  resetRequested: number
  requestReset(): void

  fallback: boolean
  setFallback(v: boolean): void
}

const localStorageAdapter: TierStorage = {
  get: (k) => {
    try {
      return globalThis.localStorage?.getItem(k) ?? null
    } catch {
      return null
    }
  },
  set: (k, v) => {
    try {
      globalThis.localStorage?.setItem(k, v)
    } catch {
      /* storage unavailable */
    }
  },
}

export function createBayStore(initialTier: Tier, storage: TierStorage = localStorageAdapter): StoreApi<State> {
  const stored = storage.get(TIER_KEY)
  const override = isTier(stored) ? stored : null
  return createStore<State>((set) => ({
    boot: 'boot',
    setBoot: (boot) => set({ boot }),
    bootProgress: 0,
    setBootProgress: (bootProgress) => set({ bootProgress }),

    tier: override ?? initialTier,
    tierOverride: override,
    setTierOverride: (t) => {
      storage.set(TIER_KEY, t ?? 'auto')
      set({ tierOverride: t, tier: t ?? initialTier })
    },

    audioEnabled: false,
    enableAudio: () => set({ audioEnabled: true }),

    activeStation: null,
    setActiveStation: (id) => set({ activeStation: id, autopilotTarget: null }),
    autopilotTarget: null,
    setAutopilot: (id) => set({ autopilotTarget: id, activeStation: null }),

    telemetry: { speed: 0, battery: 100, distance: 0 },
    setTelemetry: (t) => set((s) => ({ telemetry: { ...s.telemetry, ...t } })),
    heat: 0,
    setHeat: (heat) => set({ heat }),

    secrets: { graveyard: false, arcade: false, crates: false, konami: false },
    unlockSecret: (k) =>
      set((s) => ({ secrets: { ...s.secrets, [k]: true }, turbo: s.turbo || k === 'konami' })),
    turbo: false,

    roverPos: [0, 0.6, 0],
    roverHeading: 0,
    setRoverPose: (roverPos, roverHeading) => set({ roverPos, roverHeading }),

    resetRequested: 0,
    requestReset: () => set((s) => ({ resetRequested: s.resetRequested + 1 })),

    fallback: false,
    setFallback: (fallback) => set({ fallback }),
  }))
}

export const bayStore = createBayStore('high')

export function useStore<T>(selector: (s: State) => T): T {
  return useZustand(bayStore, selector)
}
