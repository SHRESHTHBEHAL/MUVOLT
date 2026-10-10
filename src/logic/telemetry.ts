export interface Telemetry {
  speed: number
  battery: number
  distance: number
}

const DRAIN_PER_UNIT_SPEED = 0.08
const RECHARGE_PER_SECOND = 20

export function stepTelemetry(t: Telemetry, speed: number, dt: number, docked: boolean): Telemetry {
  const delta = docked ? RECHARGE_PER_SECOND * dt : -speed * DRAIN_PER_UNIT_SPEED * dt
  return {
    speed,
    battery: Math.max(0, Math.min(100, t.battery + delta)),
    distance: t.distance + speed * dt,
  }
}
