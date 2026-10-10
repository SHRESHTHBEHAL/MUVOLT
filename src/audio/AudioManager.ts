import { Howl, Howler } from 'howler'

export type Cue = 'servo' | 'dock' | 'horn' | 'crash' | 'shutter' | 'restack' | 'lightsOn' | 'click'

const CUE_VOLUME: Record<Cue, number> = {
  servo: 0.35, dock: 0.5, horn: 0.5, crash: 0.6, shutter: 0.6, restack: 0.35, lightsOn: 0.5, click: 0.25,
}

/**
 * All playback goes through here. Nothing plays until enable() is called from a
 * user gesture. Any load failure is swallowed: silence is an acceptable state.
 */
export class AudioManager {
  private enabled = false
  private cues = new Map<Cue, Howl>()
  private motor: Howl | null = null
  private motorId: number | null = null
  private ambience: Howl | null = null

  private load(name: string, loop = false, volume = 1): Howl | null {
    try {
      return new Howl({ src: [`/audio/${name}.wav`], loop, volume, preload: true, onloaderror: () => undefined })
    } catch {
      return null
    }
  }

  async enable(): Promise<void> {
    if (this.enabled) return
    this.enabled = true
    try {
      if (Howler.ctx && Howler.ctx.state !== 'running') await Howler.ctx.resume()
    } catch {
      /* unsupported */
    }
    for (const c of Object.keys(CUE_VOLUME) as Cue[]) {
      const h = this.load(c, false, CUE_VOLUME[c])
      if (h) this.cues.set(c, h)
    }
    this.motor = this.load('motor', true, 0)
    this.ambience = this.load('ambience', true, 0.22)
    this.setAmbience(true)
    if (this.motor) {
      this.motorId = this.motor.play()
      this.motor.rate(0.8, this.motorId)
    }
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  /** speedNorm 0..1 drives pitch and volume of the motor loop. */
  setMotor(speedNorm: number): void {
    if (!this.motor || this.motorId === null) return
    const s = Math.max(0, Math.min(1, speedNorm))
    this.motor.rate(0.8 + s * 0.8, this.motorId)
    this.motor.volume(0.05 + s * 0.3, this.motorId)
  }

  play(name: Cue): void {
    if (!this.enabled) return
    try {
      this.cues.get(name)?.play()
    } catch {
      /* ignore */
    }
  }

  setAmbience(on: boolean): void {
    if (!this.ambience) return
    if (on && !this.ambience.playing()) this.ambience.play()
    if (!on) this.ambience.stop()
  }

  mute(muted: boolean): void {
    Howler.mute(muted)
  }
}

export const audio = new AudioManager()

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => audio.mute(document.hidden))
}
