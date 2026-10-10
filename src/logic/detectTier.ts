import { selectTier, type DeviceInfo, type Tier } from './tier'

/** Times a fixed 2M-op loop; slower machines take longer. Runs once at startup. */
export function benchmarkMs(): number {
  // best of three: the first run pays for JIT warm-up and whatever else is loading
  let best = Infinity
  for (let run = 0; run < 3; run++) {
    const t0 = performance.now()
    let x = 0
    for (let i = 0; i < 2_000_000; i++) x = (x + i * 1.0001) % 7919
    if (x === -1) console.log(x) // keep the loop honest
    best = Math.min(best, performance.now() - t0)
  }
  return best
}

export function detectTier(): Tier {
  const info: DeviceInfo = {
    isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024),
    dpr: window.devicePixelRatio || 1,
    benchmarkMs: benchmarkMs(),
    webgl2: !!document.createElement('canvas').getContext('webgl2'),
  }
  return selectTier(info)
}
