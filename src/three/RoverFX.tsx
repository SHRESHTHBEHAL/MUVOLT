import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { roverState } from './Rover'
import { bayStore } from '../store/useStore'
import { tierSettings } from '../logic/tier'
import { COLORS } from './palette'

const TRACK_COUNT = 400
const TRACK_SPACING = 0.35
const TRACK_LIFE = 8
const DUST_COUNT = 48

/** Headlight is parented to the rover; tracks and dust live in world space. */
export function RoverFX() {
  const target = useMemo(() => {
    const t = new THREE.Object3D()
    t.position.set(0, -1.2, 8)
    return t
  }, [])
  const light = useRef<THREE.SpotLight>(null)
  useFrame(() => {
    if (light.current) light.current.intensity = bayStore.getState().turbo ? 90 : 60
  })
  return (
    <group>
      <primitive object={target} />
      <spotLight
        ref={light}
        position={[0, 0.2, 1.0]}
        target={target}
        angle={0.55}
        penumbra={0.5}
        intensity={60}
        distance={18}
        decay={1.5}
        color="#fff3d6"
      />
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0.0, 1.12]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#fff" emissive="#fff3d6" emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export function Tracks() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const ages = useMemo(() => new Float32Array(TRACK_COUNT).fill(Infinity), [])
  const head = useRef(0)
  const lastDrop = useRef(new THREE.Vector3(0, 0, 0))
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  const hue = useRef(0)

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    const turbo = bayStore.getState().turbo
    // drop a pair of marks every TRACK_SPACING units
    if (roverState.position.distanceTo(lastDrop.current) > TRACK_SPACING && roverState.speed > 0.5) {
      lastDrop.current.copy(roverState.position)
      for (const side of [-0.6, 0.6]) {
        const i = head.current
        head.current = (head.current + 1) % TRACK_COUNT
        const h = roverState.heading
        dummy.position.set(
          roverState.position.x + Math.cos(h) * side,
          0.012,
          roverState.position.z - Math.sin(h) * side,
        )
        dummy.rotation.set(-Math.PI / 2, 0, -h)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
        ages[i] = 0
        hue.current = (hue.current + 0.02) % 1
        if (turbo) color.setHSL(hue.current, 1, 0.6)
        else color.set('#000000')
        m.setColorAt(i, color)
      }
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor) m.instanceColor.needsUpdate = true
    }
    // fade by scaling the opacity through a per-instance age attribute is overkill; shrink old ones instead
    let dirty = false
    for (let i = 0; i < TRACK_COUNT; i++) {
      if (ages[i] === Infinity) continue
      ages[i] += dt
      if (ages[i] > TRACK_LIFE) {
        ages[i] = Infinity
        dummy.scale.set(0, 0, 0)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
        dirty = true
      }
    }
    if (dirty) m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, TRACK_COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.22, 0.4]} />
      <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  )
}

export function Dust() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const scale = tierSettings(bayStore.getState().tier).particleScale
  const count = Math.max(8, Math.round(DUST_COUNT * scale))
  const parts = useMemo(
    () => Array.from({ length: count }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0 })),
    [count],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const cursor = useRef(0)

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    const emit = roverState.braking || (roverState.boosting && roverState.speed > 4) ? 3 : roverState.speed > 7 ? 1 : 0
    for (let n = 0; n < emit; n++) {
      const pt = parts[cursor.current]
      cursor.current = (cursor.current + 1) % count
      const h = roverState.heading
      pt.p.set(
        roverState.position.x - Math.sin(h) * 1.0 + (Math.random() - 0.5) * 1.2,
        0.1,
        roverState.position.z - Math.cos(h) * 1.0 + (Math.random() - 0.5) * 0.4,
      )
      pt.v.set((Math.random() - 0.5) * 1.5, 0.8 + Math.random() * 1.2, (Math.random() - 0.5) * 1.5 - Math.cos(h) * 1.5)
      pt.life = 1
    }
    parts.forEach((pt, i) => {
      if (pt.life <= 0) {
        dummy.scale.set(0, 0, 0)
      } else {
        pt.life -= dt * 1.4
        pt.p.addScaledVector(pt.v, dt)
        pt.v.y -= 1.2 * dt
        const s = 0.25 + (1 - pt.life) * 0.6
        dummy.position.copy(pt.p)
        dummy.scale.set(s, s, s)
      }
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.18, 6, 6]} />
      <meshBasicMaterial color={COLORS.steelMid} transparent opacity={0.28} depthWrite={false} />
    </instancedMesh>
  )
}
