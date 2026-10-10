/** Placeholder until Task 13 wires Howler. Keeps call sites stable. */
export type Cue = 'servo' | 'dock' | 'horn' | 'crash' | 'shutter' | 'restack' | 'lightsOn' | 'click'

export class AudioManager {
  async enable(): Promise<void> {}
  setMotor(_speedNorm: number): void {}
  play(_name: Cue): void {}
  setAmbience(_on: boolean): void {}
}

export const audio = new AudioManager()
