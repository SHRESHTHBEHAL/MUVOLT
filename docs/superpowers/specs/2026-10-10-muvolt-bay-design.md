# MUVOLT "The Bay" — Design Spec

Date: 2026-10-10
Status: Approved in conversation, pending written review

## 1. Purpose

A website for the MUVOLT robotics club that is a drivable 3D hangar rather than a set of pages. The visitor controls a wheeled rover, BOLT-7, and drives to physical stations on the floor to reveal the club's content. Goal: the most memorable robotics club site anyone has seen, while remaining fully usable by people who never touch the controls.

Success criteria:

- A first-time visitor understands they can drive within 3 seconds of the boot sequence and reaches at least one station without instruction.
- Every piece of content is reachable by nav bar click (autopilot) and by the plain fallback page, with no driving.
- Runs at a smooth frame rate on a mid-range laptop at High tier and on a 3-year-old phone at Low tier.
- All content is swappable by editing typed data files only.

## 2. Decisions locked in conversation

| Topic | Decision |
|---|---|
| Rendering | Full 3D, Three.js via React Three Fiber |
| Robot | Wheeled rover named BOLT-7 (running joke: six previous attempts) |
| Club | MUVOLT, dummy content for now |
| Mood | Dark industrial hangar, volt yellow accent `#F5E63B`, steel blue for screens |
| Devices | Desktop and mobile equally; quality tiers |
| Stack | Vite + React + TypeScript + R3F + Drei + Rapier + Zustand + Howler + GSAP + Tailwind (overlay only) |
| Hosting | Static build, Vercel by default; git repo initialised |
| Sound | Full sound design, off until first interaction |
| Game level | Showpiece plus secrets, no scoring or leaderboard |
| World layout | One continuous hangar floor, five zones visible from the center |
| Implementation | Subagents run on Opus 5.5 |

## 3. Experience

### 3.1 Boot sequence (about 3 s, skippable)

Black screen. Terminal line types `MUVOLT // BAY 7 // POWERING ON`. Overhead light banks thunk on left to right, revealing the floor. BOLT-7 sits on the central charging pad; its eye-strip blinks on. Prompt: "Click to take control" (desktop) or "Tap to take control" (mobile). This gesture unlocks audio. Any key or tap skips the sequence.

### 3.2 Driving

- Desktop: WASD or arrow keys. Shift = boost with a visible heat gauge that limits continuous use. Space = horn. Esc = leave a station.
- Mobile: left-thumb virtual joystick, boost and horn buttons bottom-right, tap-on-minimap to autopilot.
- Feel: acceleration and drift via Rapier forces, wheels spin and steer visually, faint tread tracks fade over time, dust puffs on hard braking, headlight cone lights the floor ahead.
- Camera: chase cam that lags behind and tilts into turns. Switches to a framed angle when a station is active. Autopilot drives the rover along a straight-line path with obstacle avoidance limited to known props.

### 3.3 Stations

Five zones, each with a physical prop and a yellow floor ring marking the trigger radius. Entering the ring slows the rover, the camera glides to the station's framing, and the content panel unfolds as HTML over the scene. Reversing out of the ring or pressing Esc closes the panel and returns the camera.

### 3.4 Secrets (4 total, tracked in HUD as "secrets found 0/4")

1. **Graveyard.** A shutter door at the back with a keypad. Honk three times within 2 seconds in front of it to open it. Inside: BOLT-1 through BOLT-6 as wrecks with comic plaques.
2. **Arcade hatch.** A floor hatch near the Lab zone. Driving over it drops the rover into a small neon room with one screen showing credits. A ramp leads back up.
3. **Crate tower.** A stack of parts crates near the Workshop. Knocking it over plays a crash; after 10 seconds it re-stacks itself with a sheepish sound.
4. **Konami code.** Up Up Down Down Left Right Left Right B A on keyboard enables turbo mode with a rainbow trail until page reload.

### 3.5 Escape hatches

- Top bar: five section names. Clicking autopilots BOLT-7 to that station.
- Minimap bottom-right: floor plan with rover position; click to autopilot.
- "Skip the robot" link: loads the plain scrollable fallback page.
- "Reset BOLT-7" button in HUD: teleports the rover to the center pad.

## 4. Stations and content

All content is dummy, written to read as real.

1. **Workshop / Projects.** Prop: long workbench, half-built robot under a lamp. Panel: 6 project cards (Atlas Mk II, Hex, Sentry, Grip, Swarm, Lineo) with status chips Active / Shipped / Archived, one-paragraph description, tech tags.
2. **Crew Quarters / Team.** Prop: row of lockers with name tags, corkboard. Panel: 12 member cards (name, role, year, one-line "what I'm building") plus a faculty advisor.
3. **Arena / Competitions.** Prop: trophy shelf and an animated scoreboard screen. Panel: timeline of 4 to 6 events (Robocon, Technoxian, national hackathon, inter-college drone race) with placement and a one-sentence story.
4. **Lab / Learn.** Prop: whiteboard with circuit sketches, 3D printer mid-print. Panel: workshop curriculum (Arduino basics, ROS 2, PCB design, CAD, computer vision) with level tags and a "Next session" date.
5. **Dock / Join.** Prop: glowing yellow charging dock. Driving onto it docks the rover with a clunk and chime and recharges battery. Panel: why join, meeting schedule, interest form (name, email, year, what you want to build), social links. Form posts to a placeholder endpoint and shows a success state.

Non-zone element: a giant stencil MUVOLT wordmark on the back wall. HUD telemetry panel shows speed, battery (drains slowly while driving, recharges at the dock, never blocks driving), distance driven this session, secrets found.

## 5. Architecture

### 5.1 Modules

| Module | Responsibility |
|---|---|
| `World` | Hangar geometry, lighting, floor, walls, static props. No logic. |
| `Rover` | BOLT-7 mesh, Rapier rigid body, input to force mapping, wheel visuals, tracks, dust, headlight. |
| `Stations` | Zone definitions (position, radius, camera framing, content id). Sensor colliders emit enter/exit. |
| `Camera` | Chase mode, station framing mode, autopilot transitions. |
| `Input` | Keyboard, touch joystick, autopilot. Emits normalized `{throttle, steer, boost, horn}`. |
| `Store` | Zustand: active station, telemetry, secrets, audio enabled, quality tier, boot state. |
| `Audio` | Howler sprites: motor loop pitched by speed, servo, dock chime, ambience, horn, crash, shutter. |
| `HUD` | HTML overlay: top nav, telemetry, minimap, heat gauge, mobile controls, panel container. |
| `Panels` | One React component per station reading from `src/content/*.ts`. |
| `Secrets` | Shutter keypad state machine, hatch, crate tower reset, Konami listener. |
| `Fallback` | Plain scrollable page rendering the same content files. |

### 5.2 Content as data

`src/content/projects.ts`, `team.ts`, `competitions.ts`, `learn.ts`, `join.ts`, each exporting typed arrays or objects. Panels and Fallback both consume them.

### 5.3 Quality tiers

Detected on load from device type, pixel ratio, and a short GPU benchmark.

- High: shadows, bloom, pixel ratio 1 (capped at 1.5 on retina), full particles.
- Medium: no bloom, lighter shadow map, particles halved.
- Low: no shadows, emissive-heavy materials, pixel ratio capped at 0.75, minimal particles.

User can override from a settings gear in the HUD. Choice persists in localStorage.

### 5.4 Models

All geometry built procedurally from Three.js primitives (chamfered boxes, cylinders, emissive strips, instanced bolts). No external model downloads. Structure allows swapping to GLB later.

### 5.5 Error handling

- WebGL unavailable or benchmark far below Low: render Fallback with a one-line notice.
- Audio load failure: silent, no error surfaced.
- Rover stuck or flipped: "Reset BOLT-7" button; auto-reset if upside down for 3 seconds.
- Content always reachable through nav bar regardless of physics state.

## 6. Testing

- Vitest unit tests for pure logic: input normalization, station sensor math, store transitions, battery and distance telemetry, secrets state machines (keypad honk timing, Konami sequence), quality tier selection.
- Visual verification of 3D scenes via browser screenshots during implementation, desktop and mobile viewport.
- Fallback page checked for all content rendering without WebGL.

## 7. Out of scope (for now)

Real content, CMS, backend for the form, leaderboard or scoring, multiplayer, external 3D models, SEO per-section routes.
