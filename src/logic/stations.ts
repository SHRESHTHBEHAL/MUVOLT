import type { StationId } from '../content/types'

export interface StationDef {
  id: StationId
  position: [number, number]
  radius: number
  cameraOffset: [number, number, number]
  lookAt: [number, number, number]
}

export const FLOOR_SIZE = 44
export const SPAWN: [number, number] = [0, 0]
const RADIUS = 3.5

// Camera offsets are relative to the station position; props sit behind the ring
// (further from the floor center), so the camera looks outward from the center.
export const STATIONS: StationDef[] = [
  { id: 'workshop', position: [-14, -8], radius: RADIUS, cameraOffset: [6, 4.5, 7], lookAt: [-17, 1.2, -12] },
  { id: 'crew', position: [14, -8], radius: RADIUS, cameraOffset: [-6, 4.5, 7], lookAt: [17, 1.2, -12] },
  { id: 'arena', position: [-14, 10], radius: RADIUS, cameraOffset: [6, 4.5, -7], lookAt: [-17, 1.2, 14] },
  { id: 'lab', position: [14, 10], radius: RADIUS, cameraOffset: [-6, 4.5, -7], lookAt: [17, 1.2, 14] },
  { id: 'dock', position: [0, 16], radius: RADIUS, cameraOffset: [0, 5, -8], lookAt: [0, 0.8, 18] },
]

export function inRing(pos: [number, number], s: StationDef): boolean {
  const dx = pos[0] - s.position[0]
  const dz = pos[1] - s.position[1]
  return dx * dx + dz * dz < s.radius * s.radius
}

export function stationAt(pos: [number, number]): StationId | null {
  for (const s of STATIONS) if (inRing(pos, s)) return s.id
  return null
}

export function stationById(id: StationId): StationDef {
  return STATIONS.find((s) => s.id === id)!
}

export function resolveEntry(
  current: StationId | null,
  autopilot: StationId | null,
  entered: StationId | null,
): { active: StationId | null; autopilot: StationId | null } {
  if (entered) return { active: entered, autopilot: null }
  if (current) return { active: null, autopilot }
  return { active: current, autopilot }
}
