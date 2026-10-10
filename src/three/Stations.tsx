import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { STATIONS, stationAt, resolveEntry } from '../logic/stations'
import { bayStore } from '../store/useStore'
import { roverState } from './roverState'
import { COLORS } from './palette'
import { site } from '../content/site'

function Ring({ index, position, radius, label, subtitle }: { index: number; position: [number, number]; radius: number; label: string; subtitle: string }) {
  const ring = useRef<THREE.Mesh>(null)
  const id = STATIONS[index].id
  useFrame(({ clock }) => {
    if (!ring.current) return
    const active = bayStore.getState().activeStation === id
    const m = ring.current.material as THREE.MeshStandardMaterial
    const pulse = 0.6 + Math.sin(clock.elapsedTime * 2 + index) * 0.25
    m.emissiveIntensity = active ? 2.2 : pulse
    ring.current.scale.setScalar(active ? 1.04 : 1)
  })
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[radius - 0.18, radius, 64]} />
        <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={0.8} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* dashed inner ring */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (radius - 0.6), 0.015, Math.sin(a) * (radius - 0.6)]} rotation={[-Math.PI / 2, 0, -a]}>
            <planeGeometry args={[0.28, 0.06]} />
            <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={0.4} toneMapped={false} transparent opacity={0.6} />
          </mesh>
        )
      })}
      {/* floor stencil label */}
      <Text position={[0, 0.02, -radius - 0.9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.9} letterSpacing={0.12} color={COLORS.volt} anchorX="center" anchorY="middle" fillOpacity={0.85}>
        {label.toUpperCase()}
      </Text>
      <Text position={[0, 0.02, -radius - 1.7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.38} letterSpacing={0.3} color="#8a9099" anchorX="center" anchorY="middle">
        {subtitle.toUpperCase()}
      </Text>
    </group>
  )
}

/** Draws the five rings and runs the enter/exit sensor each frame. */
export function Stations() {
  const last = useRef<string | null>(null)
  useFrame(() => {
    const s = bayStore.getState()
    if (s.boot !== 'live') return
    const entered = stationAt([roverState.position.x, roverState.position.z])
    if (entered === last.current) return
    last.current = entered
    const next = resolveEntry(s.activeStation, s.autopilotTarget, entered)
    if (next.active !== s.activeStation) s.setActiveStation(next.active)
    if (next.autopilot !== s.autopilotTarget && next.active === null) s.setAutopilot(next.autopilot)
  })
  return (
    <group>
      {STATIONS.map((st, i) => {
        const meta = site.stations.find((m) => m.id === st.id)!
        return <Ring key={st.id} index={i} position={st.position} radius={st.radius} label={meta.label} subtitle={meta.subtitle} />
      })}
    </group>
  )
}
