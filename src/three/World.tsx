import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { FLOOR_SIZE } from '../logic/stations'
import { tierSettings, type Tier } from '../logic/tier'
import { useStore } from '../store/useStore'
import { COLORS } from './palette'
import { site } from '../content/site'
import { Atmosphere } from './Atmosphere'

const HALF = FLOOR_SIZE / 2
const WALL_H = 8

function useFloorTexture() {
  return useMemo(() => {
    const size = 1024
    const c = document.createElement('canvas')
    c.width = c.height = size
    const g = c.getContext('2d')!
    g.fillStyle = COLORS.floor
    g.fillRect(0, 0, size, size)
    // subtle concrete noise
    for (let i = 0; i < 9000; i++) {
      const v = 18 + Math.random() * 14
      g.fillStyle = `rgba(${v},${v + 2},${v + 6},${Math.random() * 0.5})`
      g.fillRect(Math.random() * size, Math.random() * size, 2, 2)
    }
    // 4x4 grid of expansion joints per tile
    g.strokeStyle = COLORS.floorLine
    g.lineWidth = 3
    for (let i = 0; i <= 4; i++) {
      const p = (i / 4) * size
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, size); g.stroke()
      g.beginPath(); g.moveTo(0, p); g.lineTo(size, p); g.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(FLOOR_SIZE / 8, FLOOR_SIZE / 8)
    tex.anisotropy = 8
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

function Wall({ position, rotation, width }: { position: [number, number, number]; rotation: [number, number, number]; width: number }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh receiveShadow>
        <planeGeometry args={[width, WALL_H]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.95} metalness={0.05} />
      </mesh>
      {/* hazard stripe band at 1m */}
      <mesh position={[0, -WALL_H / 2 + 1, 0.02]}>
        <planeGeometry args={[width, 0.22]} />
        <meshStandardMaterial color={COLORS.volt} roughness={0.6} emissive={COLORS.volt} emissiveIntensity={0.08} />
      </mesh>
      {/* corrugation ribs */}
      {Array.from({ length: Math.floor(width / 4) }).map((_, i) => (
        <mesh key={i} position={[-width / 2 + 2 + i * 4, 0.6, 0.04]}>
          <boxGeometry args={[0.18, WALL_H - 1.2, 0.08]} />
          <meshStandardMaterial color={COLORS.wallDark} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/** One overhead industrial fixture: housing + emissive tube + spotlight. */
function Fixture({ position, on, castShadow }: { position: [number, number, number]; on: boolean; castShadow: boolean }) {
  const intensity = on ? 300 : 0
  const target = useMemo(() => {
    const t = new THREE.Object3D()
    t.position.set(0, -position[1], 0)
    return t
  }, [position])
  return (
    <group position={position}>
      <primitive object={target} />
      <mesh>
        <boxGeometry args={[4.2, 0.25, 0.9]} />
        <meshStandardMaterial color={COLORS.steelDark} metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.14, 0]}>
        <boxGeometry args={[3.8, 0.06, 0.5]} />
        <meshStandardMaterial color="#fff6e3" emissive={COLORS.tungsten} emissiveIntensity={on ? 3 : 0} toneMapped={false} />
      </mesh>
      <spotLight
        position={[0, -0.2, 0]}
        target={target}
        angle={1.05}
        penumbra={0.7}
        intensity={intensity}
        distance={15}
        decay={1.5}
        color={COLORS.tungsten}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      {/* cable */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 6]} />
        <meshStandardMaterial color={COLORS.rubber} />
      </mesh>
    </group>
  )
}

const FIXTURES: [number, number, number][] = [
  [-14, WALL_H - 1.5, -10], [0, WALL_H - 1.5, -10], [14, WALL_H - 1.5, -10],
  [-14, WALL_H - 1.5, 10], [0, WALL_H - 1.5, 10], [14, WALL_H - 1.5, 10],
]

export function World({ tier }: { tier: Tier }) {
  const floorTex = useFloorTexture()
  const bootProgress = useStore((s) => s.bootProgress)
  const { shadows } = tierSettings(tier)

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} metalness={0.1} />
      </mesh>
      {/* spawn pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[1.6, 1.85, 48]} />
        <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* walls */}
      <Wall position={[0, WALL_H / 2, -HALF]} rotation={[0, 0, 0]} width={FLOOR_SIZE} />
      <Wall position={[0, WALL_H / 2, HALF]} rotation={[0, Math.PI, 0]} width={FLOOR_SIZE} />
      <Wall position={[-HALF, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} width={FLOOR_SIZE} />
      <Wall position={[HALF, WALL_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} width={FLOOR_SIZE} />
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial color={COLORS.ink} roughness={1} />
      </mesh>

      {/* wordmark on back wall */}
      <group position={[0, 5.2, -HALF + 0.12]}>
        <Text fontSize={3.2} letterSpacing={0.08} anchorX="center" anchorY="middle" color={COLORS.volt} fillOpacity={0.92}>
          {site.club}
          <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={0.35} roughness={0.8} toneMapped={false} />
        </Text>
        <Text position={[0, -2.3, 0]} fontSize={0.55} letterSpacing={0.3} anchorX="center" anchorY="middle" color="#9aa0ab">
          BAY 7 · ATTEMPTS: 6
        </Text>
      </group>

      {/* light banks switch on left to right during boot */}
      {FIXTURES.map((p, i) => {
        const bank = (p[0] + 14) / 14 // 0,1,2
        const on = bootProgress >= (bank + 1) / 3 - 0.001
        return <Fixture key={i} position={p} on={on} castShadow={shadows && i % 3 === 1} />
      })}

      <ambientLight intensity={0.18 + bootProgress * 0.42} color="#9fb3c8" />
      <hemisphereLight intensity={0.6 * bootProgress} color="#7f8da3" groundColor="#15171c" />
      <Atmosphere lightsOn={bootProgress >= 1} />
    </group>
  )
}
