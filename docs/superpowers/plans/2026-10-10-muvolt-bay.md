# MUVOLT "The Bay" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A drivable 3D hangar website for the MUVOLT robotics club where the visitor pilots the rover BOLT-7 to five content stations, with four secrets, full sound, a HUD, and a plain fallback page.

**Architecture:** React Three Fiber scene with Rapier physics drives the rover; a Zustand store is the single source of truth shared by the 3D scene and the HTML HUD overlay. All club content lives in typed data files consumed by both the 3D station panels and the fallback page. Pure logic (input, sensors, telemetry, secrets, tier selection) lives in framework-free modules under `src/logic/` so Vitest covers it without a browser.

**Tech Stack:** Vite 5, React 18, TypeScript 5, three, @react-three/fiber, @react-three/drei, @react-three/rapier, @react-three/postprocessing, zustand, howler, gsap, tailwindcss, vitest.

**Spec:** `docs/superpowers/specs/2026-10-10-muvolt-bay-design.md`

## Global Constraints

- Accent color is volt yellow `#F5E63B`; screen/secondary accent is steel blue `#4FA3D1`; background near-black `#0B0C0F`.
- Robot name is `BOLT-7` everywhere in copy. Club name is `MUVOLT`.
- Boot line copy is exactly `MUVOLT // BAY 7 // POWERING ON`.
- Audio must not play before the user's first click/tap.
- All content text lives only in `src/content/*.ts`. No copy hard-coded in panels or fallback.
- All geometry is procedural Three.js primitives; no GLB/GLTF downloads.
- Pure logic in `src/logic/` must import nothing from three, react, or DOM.
- Every piece of content must be reachable with zero driving (nav bar autopilot and fallback page).
- Commit after every task with the attribution line `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. Window resize and device rotation mid-session: canvas and HUD must re-fit, joystick must re-anchor. Test added to Task 4 (store) for tier persistence and Task 16 (manual).
2. Rover driving into a station ring while autopilot is active toward a different station: autopilot must cancel and the entered station must open. Test in Task 6.
3. Honk timing exactly at the 2 s boundary (3 honks at t=0, 1.0, 2.0): spec says "within 2 seconds", so the third honk at exactly 2.0 s counts. Test in Task 11.
4. Battery reaching 0: driving must still work; battery is cosmetic. Test in Task 7.
5. Konami sequence with a stray key in the middle must reset the sequence, not skip. Test in Task 11.

---

## File Structure

```
index.html
package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js, vitest.config.ts
public/audio/              generated sprite WAVs (Task 13)
src/main.tsx               mount, WebGL check → App or Fallback
src/App.tsx                boot gate, Canvas, HUD, Panels
src/styles.css             tailwind + CSS vars
src/content/{projects,team,competitions,learn,join,site}.ts
src/content/types.ts
src/logic/input.ts         normalize keyboard/touch/autopilot into InputState
src/logic/stations.ts      zone defs, inRing(), nearestStation()
src/logic/telemetry.ts     battery/distance reducers
src/logic/secrets.ts       honk keypad, konami, crate-tower timers
src/logic/tier.ts          quality tier selection
src/logic/autopilot.ts     steer-toward-target math
src/store/useStore.ts      zustand store
src/audio/AudioManager.ts  howler wrapper
src/three/World.tsx        floor, walls, lights, wordmark
src/three/Props.tsx        station props + crate tower + shutter + hatch
src/three/Rover.tsx        BOLT-7 body + physics
src/three/RoverFX.tsx      tracks, dust, headlight
src/three/Stations.tsx     ring meshes + sensors
src/three/CameraRig.tsx    chase/framed/autopilot camera
src/three/Secrets.tsx      graveyard, arcade, crate tower behaviour
src/three/Effects.tsx      postprocessing by tier
src/three/Scene.tsx        composes the above
src/hud/{TopNav,Telemetry,Minimap,HeatGauge,MobileControls,Boot,Settings,PanelFrame}.tsx
src/panels/{Projects,Team,Competitions,Learn,Join}Panel.tsx
src/fallback/Fallback.tsx
tests/logic/*.test.ts
```

---

### Task 1: Project scaffold

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore`, `README.md`.

**Interfaces:** Produces `npm run dev`, `npm run build`, `npm test`.

- [ ] Step 1: `npm create vite@latest . -- --template react-ts` (accept overwrite of empty dir), then `npm i three @react-three/fiber @react-three/drei @react-three/rapier @react-three/postprocessing zustand howler gsap` and `npm i -D vitest @types/three @types/howler tailwindcss postcss autoprefixer @testing-library/react jsdom`.
- [ ] Step 2: Configure Tailwind (content: `index.html`, `src/**/*.{ts,tsx}`), add CSS vars `--volt: #F5E63B; --steel: #4FA3D1; --ink: #0B0C0F;` in `src/styles.css`, set `body` background to `var(--ink)`.
- [ ] Step 3: `vitest.config.ts` with `environment: 'node'`, include `tests/**/*.test.ts`. Add scripts `"test": "vitest run"`.
- [ ] Step 4: `index.html` title `MUVOLT — The Bay`, viewport meta with `viewport-fit=cover`, Google Fonts link for `Space Grotesk` (700) and `IBM Plex Mono` (400, 500).
- [ ] Step 5: `src/App.tsx` renders `<div>MUVOLT</div>` placeholder. Run `npm run build`; expected: succeeds. Run `npm test`; expected: "No test files found" exit 0 (use `--passWithNoTests`).
- [ ] Step 6: Commit `chore: scaffold vite + r3f project`.

### Task 2: Content types and dummy content

**Files:** Create `src/content/types.ts`, `projects.ts`, `team.ts`, `competitions.ts`, `learn.ts`, `join.ts`, `site.ts`. Test `tests/content.test.ts`.

**Interfaces (produces):**
```ts
export type StationId = 'workshop' | 'crew' | 'arena' | 'lab' | 'dock';
export interface Project { id: string; name: string; status: 'Active'|'Shipped'|'Archived'; blurb: string; tags: string[] }
export interface Member { id: string; name: string; role: string; year: string; building: string; advisor?: boolean }
export interface Competition { id: string; event: string; year: number; placement: string; story: string }
export interface Course { id: string; title: string; level: 'Beginner'|'Intermediate'|'Advanced'; blurb: string; nextSession: string }
export interface JoinInfo { why: string[]; schedule: string; socials: {label:string; href:string}[]; formEndpoint: string }
export interface SiteMeta { club: 'MUVOLT'; robot: 'BOLT-7'; bootLine: 'MUVOLT // BAY 7 // POWERING ON'; stations: { id: StationId; label: string; subtitle: string }[] }
```

- [ ] Step 1: Write `tests/content.test.ts`: asserts 6 projects with names `['Atlas Mk II','Hex','Sentry','Grip','Swarm','Lineo']`; 13 members with exactly one `advisor: true`; competitions length between 4 and 6 including an event containing `Robocon`; 5 courses with titles including `ROS 2`; `site.stations.map(s=>s.id)` equals `['workshop','crew','arena','lab','dock']`; `site.bootLine === 'MUVOLT // BAY 7 // POWERING ON'`.
- [ ] Step 2: Run, expect fail (modules missing).
- [ ] Step 3: Write the content files. Station labels: Workshop / Crew Quarters / Arena / Lab / Dock; subtitles: Projects / Team / Competitions / Learn / Join. Copy should read like a real club; `formEndpoint: 'https://example.com/muvolt-join'`.
- [ ] Step 4: Run, expect pass. Commit `feat: typed dummy content`.

### Task 3: Input normalization

**Files:** Create `src/logic/input.ts`. Test `tests/logic/input.test.ts`.

**Interfaces (produces):**
```ts
export interface InputState { throttle: number; steer: number; boost: boolean; horn: boolean } // throttle, steer in [-1,1]
export interface KeySet { has(code: string): boolean }
export function fromKeys(keys: KeySet): InputState
export function fromJoystick(dx: number, dy: number, boost: boolean, horn: boolean): InputState // dx,dy in [-1,1], dy negative = forward
export function merge(primary: InputState, override: InputState | null): InputState // override wins when any of its fields is non-zero/true
```

- [ ] Step 1: Tests: `fromKeys` with `KeyW` gives throttle 1; `ArrowDown` gives -1; `KeyA` steer -1 (left), `KeyD` steer 1; `ShiftLeft` boost; `Space` horn; W+S cancel to 0. `fromJoystick(0,-1,…)` throttle 1; `fromJoystick(0.5,0,…)` steer 0.5; magnitudes clamped to 1 for `(2,2)`. `merge` returns override when override has throttle 1, returns primary when override is all-zero.
- [ ] Step 2: Run, expect fail. Step 3: Implement. Step 4: Run, expect pass. Step 5: Commit `feat: input normalization`.

### Task 4: Store

**Files:** Create `src/store/useStore.ts`. Test `tests/store.test.ts` (import store's vanilla `createStore` factory, not the hook).

**Interfaces (produces):**
```ts
export type Tier = 'high'|'medium'|'low';
export type BootPhase = 'boot'|'prompt'|'live';
export interface State {
  boot: BootPhase; setBoot(p: BootPhase): void;
  tier: Tier; tierOverride: Tier|null; setTierOverride(t: Tier|null): void;
  audioEnabled: boolean; enableAudio(): void;
  activeStation: StationId|null; setActiveStation(id: StationId|null): void;
  autopilotTarget: StationId|null; setAutopilot(id: StationId|null): void;
  telemetry: { speed: number; battery: number; distance: number }; // battery 0..100
  setTelemetry(t: Partial<State['telemetry']>): void;
  secrets: Record<'graveyard'|'arcade'|'crates'|'konami', boolean>; unlockSecret(k: keyof State['secrets']): void;
  turbo: boolean;
  roverPos: [number, number, number]; setRoverPos(p: [number,number,number]): void;
  resetRequested: number; requestReset(): void; // increments
  fallback: boolean; setFallback(v: boolean): void;
}
export function createBayStore(initialTier: Tier): StoreApi<State>
export const useStore: UseBoundStore<StoreApi<State>>
```
Initial: `boot:'boot'`, battery 100, all secrets false, `turbo` becomes true when `konami` unlocked.

- [ ] Step 1: Tests: `unlockSecret('konami')` sets `turbo` true; `setActiveStation('lab')` clears `autopilotTarget`; `setAutopilot('dock')` clears `activeStation`; `requestReset()` increments; `setTierOverride('low')` persists to `localStorage` key `muvolt.tier` (mock a `storage` adapter passed into `createBayStore(initialTier, storage?)` with `{get,set}`).
- [ ] Step 2–5: fail, implement, pass, commit `feat: zustand store`.

### Task 5: Quality tier selection

**Files:** Create `src/logic/tier.ts`. Test `tests/logic/tier.test.ts`.

**Interfaces (produces):**
```ts
export interface DeviceInfo { isMobile: boolean; dpr: number; benchmarkMs: number; webgl2: boolean } // benchmarkMs = time for a fixed 2M-op JS loop
export function selectTier(d: DeviceInfo): Tier
export function tierSettings(t: Tier): { shadows: boolean; bloom: boolean; maxDpr: number; particleScale: number }
```
Rules: no webgl2 → low; mobile → low unless benchmarkMs < 25 then medium; desktop → high if benchmarkMs < 40 else medium if < 90 else low. Settings: high `{true,true,1.5,1}`, medium `{true,false,1.25,0.5}`, low `{false,false,0.75,0.2}`.

- [ ] Steps: tests for each rule boundary (e.g. mobile 24.9 → medium, 25 → low; desktop 39.9 → high), fail, implement, pass, commit `feat: quality tier selection`.

### Task 6: Stations geometry and sensor math

**Files:** Create `src/logic/stations.ts`. Test `tests/logic/stations.test.ts`.

**Interfaces (produces):**
```ts
export interface StationDef { id: StationId; position: [number, number]; radius: number; cameraOffset: [number,number,number]; lookAt: [number,number,number] }
export const STATIONS: StationDef[]  // workshop (-14,-8), crew (14,-8), arena (-14,10), lab (14,10), dock (0,16); radius 3.5; floor is 44x44 centered at origin
export const SPAWN: [number, number] = [0, 0]
export function inRing(pos: [number,number], s: StationDef): boolean
export function stationAt(pos: [number,number]): StationId | null
export function resolveEntry(current: StationId|null, autopilot: StationId|null, entered: StationId|null): { active: StationId|null; autopilot: StationId|null }
```
`resolveEntry`: if `entered` is non-null, return `{active: entered, autopilot: null}` (Review Focus 2); if entered is null and current is non-null, return `{active: null, autopilot}`; otherwise unchanged.

- [ ] Steps: tests for `inRing` at radius boundary (distance 3.49 in, 3.51 out), `stationAt` at each center, `resolveEntry` with autopilot toward `dock` while entering `lab` returns active `lab` autopilot null. Fail, implement, pass, commit `feat: station definitions and sensors`.

### Task 7: Telemetry reducers

**Files:** Create `src/logic/telemetry.ts`. Test `tests/logic/telemetry.test.ts`.

**Interfaces (produces):**
```ts
export interface Telemetry { speed: number; battery: number; distance: number }
export function stepTelemetry(t: Telemetry, speed: number, dt: number, docked: boolean): Telemetry
```
Battery drains `speed * 0.08 * dt` per second (so full speed 10 u/s drains 0.8 %/s), recharges `20 * dt` %/s when docked, clamped 0..100. Distance accumulates `speed * dt`. Battery at 0 never affects returned speed (Review Focus 4).

- [ ] Steps: tests: 10 s at speed 10 from 100 → 92; docked 1 s from 50 → 70; from 0.1 with heavy drain clamps to 0 and speed still reported; distance accumulates. Fail, implement, pass, commit `feat: telemetry reducers`.

### Task 8: Autopilot math

**Files:** Create `src/logic/autopilot.ts`. Test `tests/logic/autopilot.test.ts`.

**Interfaces (produces):**
```ts
export function steerToward(pos: [number,number], heading: number, target: [number,number], arriveRadius: number): InputState & { arrived: boolean }
```
Heading in radians, 0 = +Z forward. Returns throttle 1 (0.4 when within 2×arriveRadius), steer = clamp(angleDiff / (π/4), -1, 1), arrived when distance < arriveRadius.

- [ ] Steps: tests: target straight ahead → steer 0, throttle 1; target 90° left → steer -1; inside radius → arrived true throttle 0. Fail, implement, pass, commit `feat: autopilot steering`.

### Task 9: World and props (visual)

**Files:** Create `src/three/World.tsx`, `src/three/Props.tsx`, `src/three/Scene.tsx`; modify `src/App.tsx` to render `<Canvas>` with `<Scene/>` and a temporary `OrbitControls`.

**Interfaces (produces):** `<World tier={Tier}/>`, `<Props/>` exports `CRATE_TOWER_POS: [number,number] = [-8,-2]`, `SHUTTER_POS = [0,-21]`, `HATCH_POS = [10,6]`, `GRAVEYARD_CENTER = [0,-28]`, `ARCADE_CENTER = [10, -30]` (arcade is placed at y = -6 below floor, reached by hatch drop; ramp returns to floor).

- [ ] Step 1: World: 44×44 floor (dark concrete `#15171c` with subtle grid line texture made via `CanvasTexture`), 4 walls height 8 with yellow safety stripe band at 1 m, 6 overhead light fixtures (RectAreaLight or SpotLight by tier) in a 2×3 grid, back wall stencil `MUVOLT` using drei `<Text>` with font Space Grotesk, plus smaller `BAY 7 · ATTEMPTS: 6` under it. Shutter door geometry at `SHUTTER_POS` with keypad box. Graveyard room behind the shutter, arcade room below floor with a ramp.
- [ ] Step 2: Props per station as described in spec 4 (workbench+half robot, lockers+corkboard, trophy shelf+scoreboard plane with animated emissive texture, whiteboard+printer, dock pad with emissive yellow ring). Crate tower: 6 boxes stacked 3-2-1 at `CRATE_TOWER_POS` (static visuals for now; physics in Task 12).
- [ ] Step 3: Run `npm run dev`, screenshot in browser at desktop size; verify all five props, wordmark, stripes visible. Commit `feat: hangar world and station props`.

### Task 10: Rover with physics, camera, input wiring

**Files:** Create `src/three/Rover.tsx`, `src/three/RoverFX.tsx`, `src/three/CameraRig.tsx`, `src/hooks/useKeyboard.ts`. Modify `Scene.tsx` (wrap in `<Physics>`), `App.tsx` (remove OrbitControls).

**Interfaces (produces):** `<Rover/>` writes `roverPos` and telemetry speed to store each frame; reads `InputState` from `useInput()` (returns merged keyboard/joystick/autopilot via Task 3 `merge` and Task 8 `steerToward`). `useKeyboard(): KeySet`.

- [ ] Step 1: Rover mesh: chassis chamfered box 1.6×0.5×2.2, 4 cylinder wheels with visual spin and front-wheel steer, yellow eye-strip emissive, antenna. Rapier `RigidBody` (dynamic, `linearDamping 1.2`, `angularDamping 3`) with cuboid collider; apply forward impulse along heading `throttle * (boost ? 28 : 16) * dt` and torque for steer `steer * 6 * dt`, max speed clamp 10 u/s (14 boost, 20 turbo). Boost heat: 0..1, rises 0.5/s while boosting, falls 0.4/s, boost disabled at 1 until below 0.3; store heat in store (`heat: number` added to State, `setHeat`).
- [ ] Step 2: CameraRig: chase mode lerps camera to `roverPos + [0,5,-8]` rotated by heading, factor `1 - exp(-dt*4)`, roll tilt `-steer*0.05`. Framed mode when `activeStation` set: lerp to station `cameraOffset`, look at `lookAt`.
- [ ] Step 3: RoverFX: tread tracks via instanced flat quads dropped every 0.35 u travelled, fading over 8 s (ring buffer 400); dust: small sprite burst when `|Δspeed| > 6 u/s²`; headlight `SpotLight` child of rover, scaled by tier.
- [ ] Step 4: Auto-reset: if rover `up` dot world up < 0 for 3 s or `resetRequested` changes, teleport to `SPAWN` height 0.6, zero velocity.
- [ ] Step 5: Browser check: drive with WASD, boost, flip with a ramp test (temporary), verify reset. Commit `feat: drivable BOLT-7 with chase camera`.

### Task 11: Secrets logic

**Files:** Create `src/logic/secrets.ts`. Test `tests/logic/secrets.test.ts`.

**Interfaces (produces):**
```ts
export class HonkKeypad { constructor(windowMs?: number /* 2000 */) ; honk(nowMs: number, inFront: boolean): boolean /* true when unlocked */ }
export class Konami { press(code: string): boolean } // sequence ArrowUp×2, ArrowDown×2, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, KeyB, KeyA
export class CrateTower { constructor(resetMs?: number /* 10000 */); knock(nowMs: number): void; shouldReset(nowMs: number): boolean; readonly knocked: boolean }
```

- [ ] Steps: tests: honks at 0, 1000, 2000 unlock (boundary inclusive, Review Focus 3); 0, 1000, 2001 do not; honk with `inFront=false` resets. Konami full sequence returns true on `KeyA`; stray `KeyX` mid-sequence resets so completion needs the full sequence again (Review Focus 5). CrateTower `shouldReset` false at 9999 ms, true at 10000. Fail, implement, pass, commit `feat: secrets state machines`.

### Task 12: Secrets in the scene

**Files:** Create `src/three/Secrets.tsx`, `src/three/Stations.tsx`. Modify `Scene.tsx`, `Props.tsx` (crate tower becomes dynamic rigid bodies).

- [ ] Step 1: Stations.tsx: yellow emissive floor rings at each `StationDef`; each frame compute `stationAt(roverPos)` and apply `resolveEntry`, writing to store. Slow rover (damping ×3) while inside a ring.
- [ ] Step 2: Shutter: `HonkKeypad` fed by horn edge-trigger and `inFront` = within 5 u of `SHUTTER_POS`; on unlock, GSAP-tween shutter up 7 u over 1.2 s, `unlockSecret('graveyard')`. Graveyard contains 6 wreck variants of the rover mesh (missing wheels, tilted, scorched) with drei `<Text>` plaques: "BOLT-1 · 2019 · Drove into the pool", "BOLT-2 · 2020 · Left in the rain", "BOLT-3 · 2021 · Ate its own wiring", "BOLT-4 · 2022 · Too fast, no brakes", "BOLT-5 · 2023 · Lost a bet", "BOLT-6 · 2024 · Sacrificed for parts".
- [ ] Step 3: Hatch: trigger area at `HATCH_POS` opens trapdoor and lets rover fall to arcade (y −6); on landing `unlockSecret('arcade')`. Arcade: black room, neon strips magenta/cyan, one screen plane showing credits text from `site.credits` (add `credits: string[]` to `SiteMeta` and content). Ramp back up.
- [ ] Step 4: Crate tower: 6 dynamic `RigidBody` boxes; `CrateTower.knock` when any crate's displacement > 1 u; `unlockSecret('crates')`; on `shouldReset`, tween crates back to their stack transforms over 0.8 s and re-freeze.
- [ ] Step 5: Konami: global keydown feeds `Konami.press`; on true `unlockSecret('konami')`. Turbo: rainbow trail (tracks tint cycles hue) and max speed 20.
- [ ] Step 6: Browser check each secret manually. Commit `feat: four secrets`.

### Task 13: Audio

**Files:** Create `scripts/gen-audio.mjs` (Node script synthesising WAVs with a tiny PCM writer), `public/audio/*.wav`, `src/audio/AudioManager.ts`.

**Interfaces (produces):**
```ts
export class AudioManager { enable(): Promise<void>; setMotor(speedNorm: number): void; play(name: 'servo'|'dock'|'horn'|'crash'|'shutter'|'restack'|'lightsOn'|'click'): void; setAmbience(on: boolean): void }
export const audio: AudioManager
```
Sounds: motor loop (low saw with sub, pitch 0.8→1.6 by speed), ambience (filtered noise + 50 Hz hum), servo (short chirp), dock (two-note chime E5→B5), horn (two detuned squares 220 ms), crash (noise burst), shutter (rumble sweep), restack (descending blip), lightsOn (thunk), click.

- [ ] Step 1: Write generator, run `node scripts/gen-audio.mjs`, verify files exist and total under 2 MB.
- [ ] Step 2: AudioManager with Howler; `enable()` only called from the boot prompt click. Hook: Rover calls `setMotor`, station enter plays `servo`, dock enter plays `dock`, horn plays `horn`, crates `crash`/`restack`, shutter `shutter`, boot lights `lightsOn`.
- [ ] Step 3: Browser check: no sound before click, motor pitch follows speed. Commit `feat: synthesised sound design`.

### Task 14: HUD and boot

**Files:** Create `src/hud/Boot.tsx`, `TopNav.tsx`, `Telemetry.tsx`, `Minimap.tsx`, `HeatGauge.tsx`, `MobileControls.tsx`, `Settings.tsx`, `PanelFrame.tsx`. Modify `App.tsx`.

- [ ] Step 1: Boot: full-screen overlay; types `site.bootLine` char by char (40 ms/char) in IBM Plex Mono; dispatches `lightsOn` audio cue and a `bootProgress` store value 0..1 that World uses to switch light banks on left to right; then shows prompt "Click to take control" / "Tap to take control" (detect touch). Click → `enableAudio()`, `audio.enable()`, `setBoot('live')`. Any key/tap during typing skips to prompt.
- [ ] Step 2: TopNav: five labels from `site.stations`; click → `setAutopilot(id)`; active station highlighted volt; right side: "Skip the robot" (→ `setFallback(true)`), settings gear, "Reset BOLT-7".
- [ ] Step 3: Telemetry (top-left, mono): speed in m/s one decimal, battery bar, distance in m, `SECRETS 0/4`. Minimap (bottom-right): 160 px square SVG of floor with station dots and rover marker rotated by heading; click → autopilot to nearest station of click point. HeatGauge: thin bar under telemetry, turns red when locked.
- [ ] Step 4: MobileControls (touch devices only): left joystick 120 px (pointer events, emits `fromJoystick`), right buttons BOOST and HORN. Re-anchor on `resize`/`orientationchange`.
- [ ] Step 5: Settings: tier radio (Auto/High/Medium/Low) → `setTierOverride`; audio toggle.
- [ ] Step 6: PanelFrame: right-side (desktop) or bottom-sheet (mobile) container, GSAP slide-in 0.45 s `power3.out`, Esc or reverse-out closes via `setActiveStation(null)`. Renders the active panel from Task 15.
- [ ] Step 7: Browser check desktop and mobile viewport. Commit `feat: HUD, boot sequence, mobile controls`.

### Task 15: Station panels and fallback

**Files:** Create `src/panels/*Panel.tsx`, `src/fallback/Fallback.tsx`. Modify `src/main.tsx` (WebGL check), `App.tsx`.

- [ ] Step 1: Five panels consuming content files: Projects grid with status chips; Team cards with advisor badge; Competitions vertical timeline; Learn curriculum list with level tags and next session; Join with why list, schedule, socials, and a form (name, email, year select, textarea) that `fetch`es `formEndpoint` as JSON and shows a success state, with an error state that still thanks the user and shows the club email.
- [ ] Step 2: Fallback: single scrollable page, same content, same type and colors, anchor nav, "Take control of BOLT-7 instead" link back (`setFallback(false)`). `main.tsx`: create a test `canvas.getContext('webgl2')`; if null, render Fallback with the notice "Your browser can't run the 3D bay, so here's the flat version."
- [ ] Step 3: Add `tests/panels.test.tsx` (jsdom env override via `// @vitest-environment jsdom`) rendering `<Fallback/>` and asserting all 6 project names, 13 member names, and the boot line's club name appear.
- [ ] Step 4: Run tests, pass. Browser check. Commit `feat: station panels and fallback page`.

### Task 16: Post-processing, tiers, polish, deploy config

**Files:** Create `src/three/Effects.tsx`, `vercel.json`. Modify `World.tsx`, `Rover.tsx`, `RoverFX.tsx` to read `tierSettings`.

- [ ] Step 1: Effects: `EffectComposer` with `Bloom` (intensity 0.6, threshold 0.9) only when `tierSettings(tier).bloom`; set Canvas `dpr` to `[1, maxDpr]`; `shadows` prop from tier; particle counts × `particleScale`. Tier detection at startup runs `selectTier` with a 2M-iteration loop timing.
- [ ] Step 2: Resize: confirm canvas, HUD, joystick re-fit on window resize and orientation change (Review Focus 1); fix anything that doesn't.
- [ ] Step 3: Performance pass: check frame time in the browser at each tier using the dev overlay (drei `<Stats/>` behind `?stats` query); High on desktop ≥ 55 fps, Low on mobile emulation ≥ 30 fps. Reduce light count or shadow map size if needed.
- [ ] Step 4: `vercel.json` with SPA rewrite; README with run/build/deploy and "how to replace content" section pointing at `src/content/`.
- [ ] Step 5: `npm run build` succeeds, `npm test` passes. Commit `feat: post-processing tiers, polish, deploy config`.
