import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { FLOOR_SIZE, stationById } from '../logic/stations'
import { GRAVEYARD_CENTER, ARCADE_CENTER, ARCADE_Y, SHUTTER_POS } from './Props'

const HALF = FLOOR_SIZE / 2

/** Static collision for floor, walls and the big props. Shapes are deliberately rough. */
export function StaticColliders() {
  const ws = stationById('workshop')
  const cr = stationById('crew')
  const ar = stationById('arena')
  const lb = stationById('lab')
  const dk = stationById('dock')
  const [gx, gz] = GRAVEYARD_CENTER
  const [ax, az] = ARCADE_CENTER
  const gap = 4.2 // half-width of the shutter opening
  return (
    <RigidBody type="fixed" colliders={false} friction={0.1}>
      {/* main floor */}
      <CuboidCollider args={[HALF, 0.5, HALF]} position={[0, -0.5, 0]} />
      {/* walls: back wall has a gap where the shutter is */}
      <CuboidCollider args={[(HALF - gap) / 2 + 0.25, 5, 0.5]} position={[-(gap + (HALF - gap) / 2), 4, -HALF]} />
      <CuboidCollider args={[(HALF - gap) / 2 + 0.25, 5, 0.5]} position={[gap + (HALF - gap) / 2, 4, -HALF]} />
      <CuboidCollider args={[HALF, 5, 0.5]} position={[0, 4, HALF]} />
      <CuboidCollider args={[0.5, 5, HALF]} position={[-HALF, 4, 0]} />
      <CuboidCollider args={[0.5, 5, HALF]} position={[HALF, 4, 0]} />
      {/* graveyard room: floor and walls */}
      <CuboidCollider args={[9, 0.5, 6]} position={[gx, -0.5, gz]} />
      <CuboidCollider args={[9, 4, 0.5]} position={[gx, 4, gz - 6]} />
      <CuboidCollider args={[0.5, 4, 6]} position={[gx - 9, 4, gz]} />
      <CuboidCollider args={[0.5, 4, 6]} position={[gx + 9, 4, gz]} />
      {/* connecting corridor floor from shutter to graveyard */}
      <CuboidCollider args={[gap, 0.5, 2]} position={[SHUTTER_POS[0], -0.5, SHUTTER_POS[1] - 2]} />
      {/* arcade room */}
      <CuboidCollider args={[7, 0.5, 7]} position={[ax, ARCADE_Y - 0.5, az]} />
      <CuboidCollider args={[7, 3, 0.5]} position={[ax, ARCADE_Y + 3, az - 7]} />
      <CuboidCollider args={[0.5, 3, 7]} position={[ax - 7, ARCADE_Y + 3, az]} />
      <CuboidCollider args={[0.5, 3, 7]} position={[ax + 7, ARCADE_Y + 3, az]} />
      {/* props */}
      <CuboidCollider args={[3.6, 0.6, 1.3]} position={[ws.position[0] - 3, 0.6, ws.position[1] - 4]} rotation={[0, Math.PI / 6, 0]} />
      <CuboidCollider args={[3.3, 1.2, 0.45]} position={[cr.position[0] + 2, 1.1, cr.position[1] - 5]} rotation={[0, -Math.PI / 5, 0]} />
      <CuboidCollider args={[2.6, 1, 0.6]} position={[ar.position[0] - 3, 1, ar.position[1] + 4.5]} rotation={[0, Math.PI - Math.PI / 6, 0]} />
      <CuboidCollider args={[0.7, 1, 0.7]} position={[lb.position[0] + 2.5 + 1.9, 1, lb.position[1] + 4.5 - 1.2]} />
      <CuboidCollider args={[2.2, 0.4, 0.3]} position={[lb.position[0] + 2.5 - 1.3, 1, lb.position[1] + 4.5 + 0.5]} rotation={[0, Math.PI + Math.PI / 6, 0]} />
      <CuboidCollider args={[1.4, 1.6, 0.4]} position={[dk.position[0], 1.6, dk.position[1] + 2.2 + 2.6]} />
    </RigidBody>
  )
}
