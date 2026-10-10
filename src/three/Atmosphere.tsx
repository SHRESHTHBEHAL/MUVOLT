import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { FLOOR_SIZE, STATIONS } from '../logic/stations'
import { tierSettings } from '../logic/tier'
import { bayStore } from '../store/useStore'
import { COLORS } from './palette'

const HALF = FLOOR_SIZE / 2
const WALL_H = 8

/** Fake volumetric cone under a fixture: additive, cheap, sells the "light in dusty air" look. */
function LightCone({ position, color = COLORS.tungsten, height = 6.3, radius = 7 }: { position: [number, number, number]; color?: string; height?: number; radius?: number }) {
  return (
    <mesh position={[position[0], position[1] - height / 2, position[2]]}>
      <coneGeometry args={[radius, height, 32, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={0.045} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/** Slow-drifting dust motes lit by the fixtures. */
function Motes() {
  const scale = tierSettings(bayStore.getState().tier).particleScale
  const count = Math.round(260 * Math.max(0.3, scale))
  const mesh = useRef<THREE.InstancedMesh>(null)
  const seeds = useMemo(
    () => Array.from({ length: count }, () => ({ x: (Math.random() - 0.5) * FLOOR_SIZE, y: 0.3 + Math.random() * 6.5, z: (Math.random() - 0.5) * FLOOR_SIZE, p: Math.random() * 100, s: 0.5 + Math.random() })),
    [count],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const t = clock.elapsedTime
    seeds.forEach((sd, i) => {
      dummy.position.set(sd.x + Math.sin(t * 0.15 + sd.p) * 0.8, sd.y + Math.sin(t * 0.3 + sd.p * 2) * 0.25, sd.z + Math.cos(t * 0.12 + sd.p) * 0.8)
      const k = 0.035 * sd.s
      dummy.scale.set(k, k, k)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color="#ffe9b8" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  )
}

/** Wall-mounted volt strips, a glowing floor perimeter, and a coloured wash per station. */
export function Atmosphere({ lightsOn }: { lightsOn: boolean }) {
  const glow = lightsOn ? 1 : 0
  const accents: Record<string, string> = { workshop: '#ffb347', crew: COLORS.volt, arena: COLORS.steel, lab: '#7fd1ff', dock: COLORS.volt }
  return (
    <group>
      {/* perimeter floor strip */}
      {[[0, 0.02, -HALF + 0.6, 0], [0, 0.02, HALF - 0.6, 0], [-HALF + 0.6, 0.02, 0, Math.PI / 2], [HALF - 0.6, 0.02, 0, Math.PI / 2]].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, ry]}>
          <planeGeometry args={[FLOOR_SIZE - 1.2, 0.12]} />
          <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={1.4 * glow} toneMapped={false} />
        </mesh>
      ))}
      {/* high wall strips: cool steel light along the top of each wall */}
      {[[0, WALL_H - 0.6, -HALF + 0.08, 0], [0, WALL_H - 0.6, HALF - 0.08, Math.PI], [-HALF + 0.08, WALL_H - 0.6, 0, Math.PI / 2], [HALF - 0.08, WALL_H - 0.6, 0, -Math.PI / 2]].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
          <planeGeometry args={[FLOOR_SIZE, 0.1]} />
          <meshStandardMaterial color={COLORS.steel} emissive={COLORS.steel} emissiveIntensity={2.2 * glow} toneMapped={false} />
        </mesh>
      ))}
      {/* light cones under the six fixtures */}
      {lightsOn && [[-14, -10], [0, -10], [14, -10], [-14, 10], [0, 10], [14, 10]].map(([x, z], i) => <LightCone key={i} position={[x, WALL_H - 1.6, z]} />)}
      {/* a coloured wash on each station so every corner reads differently */}
      {STATIONS.map((s) => (
        <pointLight key={s.id} position={[s.position[0], 3.2, s.position[1]]} color={accents[s.id]} intensity={lightsOn ? 18 : 0} distance={11} decay={2} />
      ))}
      {/* cable trays and conduit across the ceiling */}
      {[-6, 6].map((z) => (
        <mesh key={z} position={[0, WALL_H - 0.35, z]}>
          <boxGeometry args={[FLOOR_SIZE, 0.18, 0.5]} />
          <meshStandardMaterial color="#1b1e25" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {lightsOn && <Motes />}
    </group>
  )
}
