export class HonkKeypad {
  private times: number[] = []
  constructor(private windowMs = 2000) {}

  /** Returns true the moment the third honk lands within the window. */
  honk(nowMs: number, inFront: boolean): boolean {
    if (!inFront) {
      this.times = []
      return false
    }
    this.times.push(nowMs)
    this.times = this.times.filter((t) => nowMs - t <= this.windowMs)
    if (this.times.length >= 3) {
      this.times = []
      return true
    }
    return false
  }
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

export class Konami {
  private index = 0
  press(code: string): boolean {
    if (code === KONAMI[this.index]) {
      this.index++
      if (this.index === KONAMI.length) {
        this.index = 0
        return true
      }
      return false
    }
    // a third Up (held-key auto-repeat) keeps the two we already have; any other stray key restarts
    if (code === KONAMI[0]) this.index = this.index >= 2 ? 2 : 1
    else this.index = 0
    return false
  }
}

export class CrateTower {
  private knockedAt: number | null = null
  constructor(private resetMs = 10000) {}
  get knocked(): boolean {
    return this.knockedAt !== null
  }
  knock(nowMs: number): void {
    if (this.knockedAt === null) this.knockedAt = nowMs
  }
  shouldReset(nowMs: number): boolean {
    return this.knockedAt !== null && nowMs - this.knockedAt >= this.resetMs
  }
  reset(): void {
    this.knockedAt = null
  }
}

export const HATCH_TRIGGER_RADIUS = 1.3

/** The hatch only swallows a rover that is driven into it by hand, on the main floor. */
export function hatchShouldDrop(o: { distance: number; y: number; autopilot: string | null }): boolean {
  return o.autopilot === null && o.y > -1 && o.distance < HATCH_TRIGGER_RADIUS
}
