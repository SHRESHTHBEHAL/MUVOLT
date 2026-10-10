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
    this.index = code === KONAMI[0] ? 1 : 0
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
