import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { roverState } from './roverState'
import { bayStore } from '../store/useStore'
import { stationById } from '../logic/stations'
import { ARCADE_CENTER, ARCADE_Y, ARCADE_SIZE, ARCADE_H } from './Props'

const CHASE_OFFSET = new THREE.Vector3(0, 5, -8)
const LOOK_AHEAD = 3

export function CameraRig() {
  const { camera } = useThree()
  if (import.meta.env.DEV) (window as unknown as { bayCam: unknown }).bayCam = camera
  const tmp = useRef({
    desired: new THREE.Vector3(),
    look: new THREE.Vector3(),
    smoothLook: new THREE.Vector3(0, 1, 4),
    roll: 0,
    initialised: false,
  }).current

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    const s = bayStore.getState()
    const h = roverState.heading
    const rp = roverState.position
    const station = s.activeStation ? stationById(s.activeStation) : null

    if (station) {
      tmp.desired.set(
        station.position[0] + station.cameraOffset[0],
        station.cameraOffset[1],
        station.position[1] + station.cameraOffset[2],
      )
      tmp.look.set(...station.lookAt)
    } else {
      // offset rotated by heading: local (x, z) -> world
      const ox = CHASE_OFFSET.x * Math.cos(h) + CHASE_OFFSET.z * Math.sin(h)
      const oz = -CHASE_OFFSET.x * Math.sin(h) + CHASE_OFFSET.z * Math.cos(h)
      const speedPull = Math.min(1, roverState.speed / 14) * 2.5
      const underground = rp.y < ARCADE_Y + ARCADE_H
      const camY = underground ? rp.y + 3.2 : CHASE_OFFSET.y + speedPull * 0.3
      const back = underground ? 0.8 : 1
      tmp.desired.set(rp.x + ox * back - Math.sin(h) * speedPull, camY, rp.z + oz * back - Math.cos(h) * speedPull)
      if (underground) {
        const m = ARCADE_SIZE / 2 - 0.8
        tmp.desired.x = Math.max(ARCADE_CENTER[0] - m, Math.min(ARCADE_CENTER[0] + m, tmp.desired.x))
        tmp.desired.z = Math.max(ARCADE_CENTER[1] - m, Math.min(ARCADE_CENTER[1] + m, tmp.desired.z))
        tmp.desired.y = Math.min(tmp.desired.y, ARCADE_Y + ARCADE_H - 0.6)
      }
      tmp.look.set(rp.x + Math.sin(h) * LOOK_AHEAD, rp.y + 0.8, rp.z + Math.cos(h) * LOOK_AHEAD)
    }

    if (!tmp.initialised) {
      camera.position.copy(tmp.desired)
      tmp.smoothLook.copy(tmp.look)
      tmp.initialised = true
    }
    const k = station ? 1 - Math.exp(-dt * 3) : 1 - Math.exp(-dt * 4.5)
    camera.position.lerp(tmp.desired, k)
    tmp.smoothLook.lerp(tmp.look, 1 - Math.exp(-dt * 6))
    camera.lookAt(tmp.smoothLook)

    const targetRoll = station ? 0 : -roverState.steer * 0.05 * Math.min(1, roverState.speed / 5)
    tmp.roll = THREE.MathUtils.lerp(tmp.roll, targetRoll, 1 - Math.exp(-dt * 5))
    camera.rotateZ(tmp.roll)
  })

  return null
}
