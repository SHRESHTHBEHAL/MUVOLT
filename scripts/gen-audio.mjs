// Synthesises every sound the bay uses into public/audio/*.wav. Run: node scripts/gen-audio.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio')
const SR = 22050
mkdirSync(OUT, { recursive: true })

const TAU = Math.PI * 2
const clamp = (v) => Math.max(-1, Math.min(1, v))
const rand = () => Math.random() * 2 - 1

function render(seconds, fn) {
  const n = Math.floor(seconds * SR)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i / n)
  return out
}

/** one-pole lowpass over a buffer */
function lowpass(buf, cutoffHz) {
  const a = Math.exp((-TAU * cutoffHz) / SR)
  let y = 0
  return buf.map((x) => (y = a * y + (1 - a) * x))
}

function env(t, a, d, s, r, len) {
  if (t < a) return t / a
  if (t < a + d) return 1 - ((t - a) / d) * (1 - s)
  if (t < len - r) return s
  return Math.max(0, (s * (len - t)) / r)
}

function normalise(buf, peak = 0.9) {
  let m = 0
  for (const v of buf) m = Math.max(m, Math.abs(v))
  const k = m > 0 ? peak / m : 1
  return buf.map((v) => v * k)
}

function wav(name, samples) {
  const data = Buffer.alloc(samples.length * 2)
  samples.forEach((v, i) => data.writeInt16LE(Math.round(clamp(v) * 32767), i * 2))
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8)
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22)
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34)
  h.write('data', 36); h.writeUInt32LE(data.length, 40)
  writeFileSync(join(OUT, `${name}.wav`), Buffer.concat([h, data]))
  console.log(`${name}.wav  ${(data.length / 1024).toFixed(0)} KB`)
}

// --- motor loop: saw + sub, seamless 2 s loop at 55 Hz (110 cycles) ---
{
  const f = 55
  const buf = render(2, (t) => {
    const saw = ((t * f) % 1) * 2 - 1
    const sub = Math.sin(TAU * f * 0.5 * t)
    const grit = Math.sin(TAU * f * 4 * t + Math.sin(TAU * 3 * t) * 2) * 0.15
    return saw * 0.35 + sub * 0.45 + grit
  })
  wav('motor', normalise(lowpass(buf, 900), 0.8))
}

// --- ambience loop: filtered noise + 50 Hz hum, 6 s ---
{
  const buf = render(6, (t) => rand() * 0.6 + Math.sin(TAU * 50 * t) * 0.35 + Math.sin(TAU * 100 * t) * 0.12)
  const lp = lowpass(lowpass(buf, 320), 320)
  // fade ends so the loop seam is quiet
  const n = lp.length
  for (let i = 0; i < 2000; i++) { lp[i] *= i / 2000; lp[n - 1 - i] *= i / 2000 }
  wav('ambience', normalise(lp, 0.5))
}

// --- servo: quick rising chirp ---
wav('servo', normalise(render(0.22, (t, p) => Math.sin(TAU * (700 + p * 900) * t) * env(t, 0.005, 0.05, 0.5, 0.1, 0.22) * (0.7 + rand() * 0.3))))

// --- dock: two-note chime E5 -> B5 ---
wav('dock', normalise(render(0.9, (t) => {
  const n1 = t < 0.45 ? Math.sin(TAU * 659.25 * t) * env(t, 0.005, 0.2, 0.4, 0.2, 0.45) : 0
  const t2 = t - 0.3
  const n2 = t2 > 0 ? Math.sin(TAU * 987.77 * t2) * env(t2, 0.005, 0.25, 0.4, 0.3, 0.6) : 0
  const shimmer = t2 > 0 ? Math.sin(TAU * 1975.5 * t2) * env(t2, 0.005, 0.2, 0.2, 0.3, 0.6) * 0.3 : 0
  return n1 + n2 + shimmer
})))

// --- horn: two detuned squares, 220 ms ---
wav('horn', normalise(render(0.24, (t) => {
  const sq = (f) => (Math.sin(TAU * f * t) > 0 ? 1 : -1)
  return (sq(392) + sq(396) * 0.8 + sq(196) * 0.4) * env(t, 0.004, 0.02, 0.9, 0.04, 0.24)
})))

// --- crash: noise burst with a thud ---
wav('crash', normalise(lowpass(render(0.7, (t) => rand() * env(t, 0.002, 0.15, 0.25, 0.4, 0.7) + Math.sin(TAU * 70 * t) * env(t, 0.002, 0.1, 0.1, 0.2, 0.7) * 1.5), 2400)))

// --- shutter: rumble sweep rising, 1.4 s ---
wav('shutter', normalise(lowpass(render(1.4, (t, p) => rand() * 0.8 * env(t, 0.1, 0.2, 0.8, 0.4, 1.4) + Math.sin(TAU * (40 + p * 30) * t) * 0.6 + Math.sin(TAU * (80 + p * 60) * t + rand() * 0.2) * 0.3), 500)))

// --- restack: descending blip ---
wav('restack', normalise(render(0.5, (t, p) => Math.sin(TAU * (900 - p * 500) * t) * env(t, 0.005, 0.1, 0.5, 0.2, 0.5))))

// --- lightsOn: thunk ---
wav('lightsOn', normalise(lowpass(render(0.4, (t) => Math.sin(TAU * 90 * t) * env(t, 0.002, 0.08, 0.2, 0.2, 0.4) + rand() * env(t, 0.001, 0.03, 0.05, 0.1, 0.4) * 0.8), 1500)))

// --- click ---
wav('click', normalise(render(0.06, (t) => Math.sin(TAU * 1800 * t) * env(t, 0.001, 0.02, 0.2, 0.03, 0.06))))
