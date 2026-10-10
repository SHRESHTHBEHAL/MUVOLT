# MUVOLT — The Bay

The MUVOLT robotics club website is a drivable 3D hangar. You pilot a rover called **BOLT-7** to five stations on the floor, and each station unfolds a piece of the site. There are four secrets. There is also a plain scrollable version for anyone who would rather not drive.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. Add `?stats` to the URL for a frame-rate overlay.

```bash
npm test        # unit tests (input, store, tiers, stations, telemetry, autopilot, secrets, fallback page)
npm run build   # production build into dist/
```

## Controls

| Desktop | Mobile |
| --- | --- |
| `W A S D` or arrows to drive | left-thumb joystick |
| `Shift` boost (watch the heat gauge) | BOOST button |
| `Space` horn | HORN button |
| `Esc` closes a station panel | reverse out of the ring |

Click a station in the top bar or tap the minimap and BOLT-7 drives itself there.

## Replace the content

Everything the site says lives in `src/content/`. No 3D knowledge needed.

| File | What it holds |
| --- | --- |
| `site.ts` | club name, tagline, station labels, arcade credits |
| `projects.ts` | the Workshop cards |
| `team.ts` | the Crew Quarters roster (set `advisor: true` on one person) |
| `competitions.ts` | the Arena timeline |
| `learn.ts` | the Lab curriculum |
| `join.ts` | why join, schedule, socials, and the form endpoint |

The interest form posts JSON to `join.formEndpoint`. It ships empty, which makes the form complete locally without sending anything. Point it at a Formspree, Google Apps Script, or your own endpoint when you have one.

## Deploy

It is a static site. On Vercel, import the repo and accept the defaults; `vercel.json` already rewrites every route to `index.html`. Netlify and GitHub Pages work the same way with `dist/` as the output folder.

## Graphics tiers

On load the site times a short benchmark and picks High, Medium, or Low (shadows, bloom, pixel ratio, particle counts). Visitors can override it from the gear in the top bar; the choice is remembered in the browser. If WebGL 2 is unavailable, the flat version renders instead.

## Secrets

Four of them. The telemetry panel keeps count. Honk near the back wall, drive over the hatch, bump the crates, and know your Konami.

## Sound

All sounds are synthesised by `scripts/gen-audio.mjs` into `public/audio/`. Rerun it if you change the generator. Nothing plays until the visitor clicks "take control".
