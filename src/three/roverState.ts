import * as THREE from 'three'

/** Shared per-frame rover state, read by FX, camera and sensors without React. */
export const roverState = {
  position: new THREE.Vector3(0, 0.6, 0),
  heading: 0,
  speed: 0,
  steer: 0,
  boosting: false,
  braking: false,
  horn: false,
}

export interface Teleport {
  x: number
  y: number
  z: number
  keepVelocity: boolean
}

/** Mailbox so code that doesn't own the rigid body can ask the rover to move. */
export const roverTeleport = {
  pending: null as Teleport | null,
  request(t: Teleport) {
    this.pending = t
  },
}
