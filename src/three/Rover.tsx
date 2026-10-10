import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import { useInput } from '../hooks/useInput'
import { bayStore } from '../store/useStore'
import { stepTelemetry } from '../logic/telemetry'
import { stationAt, SPAWN } from '../logic/stations'
import { COLORS } from './palette'
import { RoverFX } from './RoverFX'
import { roverState, roverTeleport } from './roverState'
import { audio } from '../audio/AudioManager'

export const ROVER = {
  spawnY: 0.6,
  driveForce: 42,
  boostForce: 72,
  steerTorque: 22,
  maxSpeed: 10,
  maxBoost: 14,
  maxTurbo: 20,
  heatRise: 0.5,
  heatFall: 0.4,
  heatLock: 1,
  heatUnlock: 0.3,
} as const

const WHEELS: [number, number][] = [[-0.85, 0.8], [0.85, 0.8], [-0.85, -0.8], [0.85, -0.8]]

export function Rover() {
  const body = useRef<RapierRigidBody>(null)
  const chassis = useRef<THREE.Group>(null)
  const wheels = useRef<(THREE.Group | null)[]>([])
  const getInput = useInput()
  const wheelSpin = useRef(0)
  const flipTimer = useRef(0)
  const frame = useRef(0)
  const heat = useRef(0)
  const heatLocked = useRef(false)
  const lastSpeed = useRef(0)
  const tmp = useRef({ fwd: new THREE.Vector3(), q: new THREE.Quaternion(), v: new THREE.Vector3() }).current

  const reset = () => {
    const rb = body.current
    if (!rb) return
    rb.setTranslation({ x: SPAWN[0], y: ROVER.spawnY, z: SPAWN[1] }, true)
    rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
    flipTimer.current = 0
  }

  useEffect(() => bayStore.subscribe((s, prev) => s.resetRequested !== prev.resetRequested && reset()), [])

  const honourTeleport = (rb: RapierRigidBody) => {
    const t = roverTeleport.pending
    if (!t) return
    roverTeleport.pending = null
    const lv = rb.linvel()
    rb.setTranslation({ x: t.x, y: t.y, z: t.z }, true)
    if (!t.keepVelocity) {
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    } else {
      rb.setLinvel({ x: lv.x * 0.4, y: -2, z: lv.z * 0.4 }, true)
    }
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  useFrame((_, rawDt) => {
    const rb = body.current
    if (!rb) return
    const dt = Math.min(rawDt, 1 / 30)
    honourTeleport(rb)
    const store = bayStore.getState()
    const live = store.boot === 'live'
    const input = live ? getInput(dt) : { throttle: 0, steer: 0, boost: false, horn: false }

    // pose
    const p = rb.translation()
    const r = rb.rotation()
    tmp.q.set(r.x, r.y, r.z, r.w)
    tmp.fwd.set(0, 0, 1).applyQuaternion(tmp.q)
    const heading = Math.atan2(tmp.fwd.x, tmp.fwd.z)
    const lv = rb.linvel()
    tmp.v.set(lv.x, 0, lv.z)
    const speed = tmp.v.length()
    const forwardSpeed = tmp.v.dot(tmp.fwd.clone().setY(0).normalize())

    // boost heat
    const wantBoost = input.boost && input.throttle > 0
    if (heatLocked.current && heat.current < ROVER.heatUnlock) heatLocked.current = false
    const boosting = wantBoost && !heatLocked.current
    heat.current = Math.max(0, Math.min(1, heat.current + (boosting ? ROVER.heatRise : -ROVER.heatFall) * dt))
    if (heat.current >= ROVER.heatLock) heatLocked.current = true

    // drive
    const inStation = store.activeStation !== null
    const force = (boosting ? ROVER.boostForce : ROVER.driveForce) * (inStation ? 0.5 : 1)
    const maxSpeed = store.turbo ? ROVER.maxTurbo : boosting ? ROVER.maxBoost : ROVER.maxSpeed
    if (input.throttle !== 0) {
      const dir = tmp.fwd.clone().setY(0).normalize().multiplyScalar(input.throttle * force * dt)
      rb.applyImpulse({ x: dir.x, y: 0, z: dir.z }, true)
    }
    if (input.steer !== 0) {
      const grip = Math.min(1, 0.35 + speed / 4)
      const sign = forwardSpeed < -0.5 ? -1 : 1
      rb.applyTorqueImpulse({ x: 0, y: -input.steer * ROVER.steerTorque * grip * sign * dt, z: 0 }, true)
    }
    if (speed > maxSpeed) {
      const k = maxSpeed / speed
      rb.setLinvel({ x: lv.x * k, y: lv.y, z: lv.z * k }, true)
    }

    // auto-reset when flipped
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(tmp.q)
    flipTimer.current = up.y < 0 ? flipTimer.current + dt : 0
    if (flipTimer.current > 3 || p.y < -30) reset()

    // visuals
    wheelSpin.current += forwardSpeed * dt / 0.35
    wheels.current.forEach((w, i) => {
      if (!w) return
      w.rotation.y = i < 2 ? -input.steer * 0.45 : 0
      const tyre = w.children[0] as THREE.Mesh
      tyre.rotation.x = wheelSpin.current
    })
    if (chassis.current) chassis.current.rotation.z = THREE.MathUtils.lerp(chassis.current.rotation.z, -input.steer * 0.04 * Math.min(1, speed / 6), 0.1)

    // shared state
    roverState.position.set(p.x, p.y, p.z)
    roverState.heading = heading
    roverState.speed = speed
    roverState.steer = input.steer
    roverState.boosting = boosting
    roverState.braking = (lastSpeed.current - speed) / dt > 6
    if (input.horn && !roverState.horn) audio.play('horn')
    roverState.horn = input.horn
    lastSpeed.current = speed
    audio.setMotor((Math.abs(input.throttle) * 0.3 + speed / ROVER.maxBoost * 0.7) * (boosting ? 1.15 : 1))

    // store writes, throttled
    frame.current++
    if (frame.current % 3 === 0) store.setRoverPose([p.x, p.y, p.z], heading)
    if (frame.current % 6 === 0) {
      const docked = stationAt([p.x, p.z]) === 'dock'
      store.setTelemetry(stepTelemetry(store.telemetry, speed, dt * 6, docked))
      store.setHeat(heatLocked.current ? -heat.current : heat.current)
    }
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[SPAWN[0], ROVER.spawnY, SPAWN[1]]}
      linearDamping={1.6}
      angularDamping={4}
      canSleep={false}
      mass={1}
    >
      <CuboidCollider args={[0.8, 0.3, 1.1]} position={[0, 0, 0]} friction={0.02} restitution={0.05} />
      <group ref={chassis}>
        {/* chassis */}
        <RoundedBox args={[1.6, 0.5, 2.2]} radius={0.08} smoothness={4} castShadow>
          <meshStandardMaterial color="#2b303a" metalness={0.55} roughness={0.45} />
        </RoundedBox>
        {/* upper deck */}
        <RoundedBox args={[1.2, 0.28, 1.4]} radius={0.06} position={[0, 0.36, -0.1]} castShadow>
          <meshStandardMaterial color={COLORS.volt} metalness={0.3} roughness={0.5} />
        </RoundedBox>
        {/* eye strip */}
        <mesh position={[0, 0.1, 1.11]}>
          <boxGeometry args={[1.1, 0.12, 0.02]} />
          <meshStandardMaterial color="#fff" emissive={COLORS.steel} emissiveIntensity={3} toneMapped={false} />
        </mesh>
        {/* tail lights */}
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.05, -1.11]}>
            <boxGeometry args={[0.25, 0.1, 0.02]} />
            <meshStandardMaterial color="#300" emissive="#ff2a2a" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        ))}
        {/* antenna */}
        <mesh position={[-0.5, 0.75, -0.7]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
          <meshStandardMaterial color="#9aa0ab" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.5, 1.17, -0.7]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#fff" emissive="#ff2a2a" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {/* sensor mast */}
        <mesh position={[0.3, 0.6, 0.3]}>
          <cylinderGeometry args={[0.16, 0.2, 0.22, 20]} />
          <meshStandardMaterial color="#1a1d24" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* wheels */}
        {WHEELS.map(([x, z], i) => (
          <group key={i} ref={(el) => { wheels.current[i] = el }} position={[x, -0.15, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.36, 0.36, 0.32, 20]} />
              <meshStandardMaterial color={COLORS.rubber} roughness={0.95} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.17 : -0.17, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 12]} />
              <meshStandardMaterial color="#9aa0ab" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
        <RoverFX />
      </group>
    </RigidBody>
  )
}
