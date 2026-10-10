import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { COLORS } from './palette'
import { stationById } from '../logic/stations'
import { team } from '../content/team'

export const CRATE_TOWER_POS: [number, number] = [-8, -2]
export const SHUTTER_POS: [number, number] = [0, -21]
export const HATCH_POS: [number, number] = [10, 6]
export const GRAVEYARD_CENTER: [number, number] = [0, -28]
export const ARCADE_CENTER: [number, number] = [10, -30]
export const ARCADE_Y = -6

const metal = { color: COLORS.steelMid, metalness: 0.65, roughness: 0.45 }
const darkMetal = { color: COLORS.steelDark, metalness: 0.7, roughness: 0.4 }

function Lamp({ position, color = COLORS.tungsten }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh>
        <coneGeometry args={[0.35, 0.3, 16, 1, true]} />
        <meshStandardMaterial color={COLORS.steelDark} side={THREE.DoubleSide} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={14} distance={7} decay={2} position={[0, -0.2, 0]} />
    </group>
  )
}

/** Workshop: long bench with a half-built robot under a lamp. */
function Workbench() {
  const s = stationById('workshop')
  return (
    <group position={[s.position[0] - 3, 0, s.position[1] - 4]} rotation={[0, Math.PI / 6, 0]}>
      <RoundedBox args={[7, 0.18, 2.4]} radius={0.03} position={[0, 1.0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#6e5637" roughness={0.8} />
      </RoundedBox>
      {[[-3.2, -1], [3.2, -1], [-3.2, 1], [3.2, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]} castShadow>
          <boxGeometry args={[0.14, 1, 0.14]} />
          <meshStandardMaterial {...darkMetal} />
        </mesh>
      ))}
      {/* half-built chassis */}
      <group position={[-1, 1.3, 0]}>
        <RoundedBox args={[1.6, 0.35, 1.1]} radius={0.05} castShadow>
          <meshStandardMaterial color="#2f3540" metalness={0.5} roughness={0.5} />
        </RoundedBox>
        {[[-0.7, -0.6], [0.7, -0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.1, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
            <meshStandardMaterial color={COLORS.rubber} roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0.4, 0.35, 0.2]}>
          <boxGeometry args={[0.5, 0.08, 0.35]} />
          <meshStandardMaterial color="#1b6e3a" roughness={0.6} />
        </mesh>
      </group>
      {/* scattered tools */}
      <mesh position={[1.6, 1.13, 0.5]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.12]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[2.3, 1.13, -0.4]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.1]} />
        <meshStandardMaterial color={COLORS.volt} roughness={0.5} />
      </mesh>
      <Lamp position={[-1, 3.0, 0]} />
      <mesh position={[-1, 3.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
        <meshStandardMaterial color={COLORS.rubber} />
      </mesh>
    </group>
  )
}

/** Crew: row of lockers and a corkboard. */
function Lockers() {
  const s = stationById('crew')
  const names = team.filter((m) => !m.advisor).slice(0, 6)
  return (
    <group position={[s.position[0] + 2, 0, s.position[1] - 5]} rotation={[0, -Math.PI / 5, 0]}>
      {names.map((m, i) => (
        <group key={m.id} position={[-2.5 + i * 1.0, 0, 0]}>
          <RoundedBox args={[0.92, 2.2, 0.6]} radius={0.02} position={[0, 1.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={i % 2 ? '#3a4150' : '#2f3744'} metalness={0.5} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 1.95, 0.31]}>
            <boxGeometry args={[0.6, 0.18, 0.02]} />
            <meshStandardMaterial color={COLORS.volt} roughness={0.5} />
          </mesh>
          <Text position={[0, 1.95, 0.325]} fontSize={0.09} color={COLORS.ink} anchorX="center" anchorY="middle" letterSpacing={0.05}>
            {m.name.split(' ')[0].toUpperCase()}
          </Text>
          <mesh position={[0.3, 1.1, 0.31]}>
            <boxGeometry args={[0.06, 0.3, 0.03]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
        </group>
      ))}
      {/* corkboard */}
      <group position={[4.2, 1.6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.3, 0.06]} />
          <meshStandardMaterial color="#8a6a3f" roughness={0.9} />
        </mesh>
        {[[-0.5, 0.3, '#f1e9d2'], [0.3, 0.25, COLORS.volt], [-0.2, -0.3, '#f1e9d2'], [0.55, -0.35, COLORS.steel]].map(([x, y, c], i) => (
          <mesh key={i} position={[x as number, y as number, 0.04]} rotation={[0, 0, (i - 1.5) * 0.08]}>
            <planeGeometry args={[0.45, 0.35]} />
            <meshStandardMaterial color={c as string} roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Arena: trophy shelf and an animated scoreboard. */
function Scoreboard() {
  const s = stationById('arena')
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 256
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return { c, t }
  }, [])
  const ref = useRef(0)
  useFrame((_, dt) => {
    ref.current += dt
    if (Math.floor(ref.current * 4) === Math.floor((ref.current - dt) * 4)) return
    const g = tex.c.getContext('2d')!
    g.fillStyle = '#05070b'
    g.fillRect(0, 0, 512, 256)
    g.font = 'bold 36px "IBM Plex Mono", monospace'
    g.fillStyle = COLORS.steel
    g.fillText('MUVOLT', 24, 56)
    g.fillStyle = '#fff'
    g.fillText('RIVALS', 300, 56)
    g.font = 'bold 110px "Space Grotesk", sans-serif'
    g.fillStyle = COLORS.volt
    const t = Math.floor(ref.current)
    g.fillText(String(7 + (t % 3)), 40, 190)
    g.fillStyle = '#9aa0ab'
    g.fillText(String(5), 330, 190)
    g.font = '22px "IBM Plex Mono", monospace'
    g.fillStyle = '#5c6472'
    const sec = 90 - (t % 90)
    g.fillText(`T-${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`, 190, 236)
    tex.t.needsUpdate = true
  })
  return (
    <group position={[s.position[0] - 3, 0, s.position[1] + 4.5]} rotation={[0, Math.PI - Math.PI / 6, 0]}>
      {/* shelf */}
      <RoundedBox args={[5, 0.12, 0.8]} radius={0.02} position={[0, 1.4, 0]} castShadow>
        <meshStandardMaterial color="#2a2f38" metalness={0.6} roughness={0.5} />
      </RoundedBox>
      {[[-1.8, 0.55], [-0.9, 0.42], [0, 0.7], [0.9, 0.38], [1.8, 0.5]].map(([x, h], i) => (
        <group key={i} position={[x, 1.46, 0]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#1f232b" />
          </mesh>
          <mesh position={[0, 0.1 + h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, h, 12]} />
            <meshStandardMaterial color={i === 2 ? '#e2c044' : '#b8b8b8'} metalness={0.95} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.1 + h + 0.12, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={i === 2 ? '#e2c044' : '#b8b8b8'} metalness={0.95} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* scoreboard screen */}
      <group position={[0, 3.4, -0.3]}>
        <RoundedBox args={[4.4, 2.3, 0.25]} radius={0.04} castShadow>
          <meshStandardMaterial color="#121419" metalness={0.5} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.13]}>
          <planeGeometry args={[4.1, 2.05]} />
          <meshStandardMaterial map={tex.t} emissiveMap={tex.t} emissive="#ffffff" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 3.2, 1.5]} color={COLORS.steel} intensity={6} distance={8} decay={2} />
    </group>
  )
}

/** Lab: whiteboard with sketches and a 3D printer mid-print. */
function Lab() {
  const s = stationById('lab')
  const printHead = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (printHead.current) {
      const t = clock.elapsedTime
      printHead.current.position.x = Math.sin(t * 2.3) * 0.25
      printHead.current.position.z = Math.cos(t * 1.7) * 0.25
    }
  })
  const board = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 512
    const g = c.getContext('2d')!
    g.fillStyle = '#e9ecef'
    g.fillRect(0, 0, 1024, 512)
    g.strokeStyle = '#1d4ed8'
    g.lineWidth = 4
    g.lineCap = 'round'
    // circuit sketch
    g.beginPath(); g.moveTo(80, 120); g.lineTo(380, 120); g.lineTo(380, 300); g.lineTo(80, 300); g.closePath(); g.stroke()
    g.beginPath(); g.arc(230, 210, 50, 0, Math.PI * 2); g.stroke()
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(140 + i * 60, 120); g.lineTo(140 + i * 60, 90); g.stroke() }
    g.strokeStyle = '#dc2626'
    g.beginPath(); g.moveTo(520, 110); g.lineTo(940, 110); g.stroke()
    g.beginPath(); g.moveTo(520, 110); g.quadraticCurveTo(700, 420, 940, 160); g.stroke()
    g.fillStyle = '#111827'
    g.font = 'bold 44px "IBM Plex Mono", monospace'
    g.fillText('V = IR', 520, 330)
    g.fillText('PID: kp 2.1 ki 0.4', 520, 390)
    g.font = '30px "IBM Plex Mono", monospace'
    g.fillStyle = '#dc2626'
    g.fillText('DO NOT ERASE', 540, 460)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group position={[s.position[0] + 2.5, 0, s.position[1] + 4.5]} rotation={[0, Math.PI + Math.PI / 6, 0]}>
      {/* whiteboard */}
      <group position={[-1.5, 2.2, -0.4]}>
        <mesh castShadow>
          <boxGeometry args={[4.2, 2.2, 0.08]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[4.0, 2.0]} />
          <meshStandardMaterial map={board} roughness={0.35} />
        </mesh>
      </group>
      {/* 3D printer */}
      <group position={[2.2, 0, 0.3]}>
        <RoundedBox args={[1.2, 0.9, 1.2]} radius={0.03} position={[0, 0.45, 0]} castShadow>
          <meshStandardMaterial color="#1f232b" metalness={0.5} roughness={0.5} />
        </RoundedBox>
        {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.4, z]}>
            <boxGeometry args={[0.08, 1.1, 0.08]} />
            <meshStandardMaterial color="#9aa0ab" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[1.2, 0.08, 1.2]} />
          <meshStandardMaterial color="#1f232b" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh ref={printHead} position={[0, 1.25, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.18, 24]} />
          <meshStandardMaterial color={COLORS.steel} roughness={0.6} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} color={COLORS.steel} intensity={3} distance={4} decay={2} />
      </group>
    </group>
  )
}

/** Dock: glowing charging pad with a backplate. */
function Dock() {
  const s = stationById('dock')
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ring.current) {
      const m = ring.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 2.2) * 0.5
    }
  })
  return (
    <group position={[s.position[0], 0, s.position[1] + 2.2]}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.3, 0.04, 48]} />
        <meshStandardMaterial color="#1d2027" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.7, 2.0, 64]} />
        <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={1.2} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* backplate / charger tower */}
      <group position={[0, 0, 2.6]}>
        <RoundedBox args={[2.6, 3.2, 0.6]} radius={0.05} position={[0, 1.6, 0]} castShadow>
          <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.45} />
        </RoundedBox>
        <mesh position={[0, 2.4, -0.31]}>
          <planeGeometry args={[1.6, 0.5]} />
          <meshStandardMaterial color={COLORS.volt} emissive={COLORS.volt} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Text position={[0, 2.4, -0.33]} rotation={[0, Math.PI, 0]} fontSize={0.26} color={COLORS.ink} anchorX="center" anchorY="middle" letterSpacing={0.12}>
          DOCK
        </Text>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.6 + i * 0.6, 1.3, -0.31]}>
            <boxGeometry args={[0.35, 0.12, 0.02]} />
            <meshStandardMaterial color={COLORS.steel} emissive={COLORS.steel} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1.2, 0]} color={COLORS.volt} intensity={10} distance={9} decay={2} />
    </group>
  )
}

/** Shutter door into the graveyard, with keypad. Door mesh exposed via ref for Secrets to animate. */
export function Shutter({ doorRef }: { doorRef?: React.RefObject<THREE.Group | null> }) {
  return (
    <group position={[SHUTTER_POS[0], 0, SHUTTER_POS[1] - 1]}>
      {/* frame */}
      {[-4.3, 4.3].map((x) => (
        <mesh key={x} position={[x, 3.5, 0]} castShadow>
          <boxGeometry args={[0.5, 7, 0.9]} />
          <meshStandardMaterial {...darkMetal} />
        </mesh>
      ))}
      <mesh position={[0, 7.1, 0]}>
        <boxGeometry args={[9.1, 0.6, 0.9]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
      <group ref={doorRef}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[0, 0.25 + i * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[8.1, 0.46, 0.2]} />
            <meshStandardMaterial color={i % 2 ? '#2f343d' : '#333945'} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 3.6, 0.12]}>
          <planeGeometry args={[6, 0.5]} />
          <meshStandardMaterial color={COLORS.volt} roughness={0.6} />
        </mesh>
        <Text position={[0, 3.6, 0.14]} fontSize={0.3} color={COLORS.ink} anchorX="center" anchorY="middle" letterSpacing={0.2}>
          RESTRICTED · HONK ×3
        </Text>
      </group>
      {/* keypad */}
      <group position={[5.2, 1.4, 0.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.7, 0.15]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-0.13 + (i % 3) * 0.13, 0.18 - Math.floor(i / 3) * 0.13, 0.085]}>
            <boxGeometry args={[0.09, 0.09, 0.03]} />
            <meshStandardMaterial color={COLORS.steel} emissive={COLORS.steel} emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Graveyard room behind the shutter: six wrecked rovers with plaques. */
const WRECKS = [
  'BOLT-1 · 2019 · Drove into the pool',
  'BOLT-2 · 2020 · Left in the rain',
  'BOLT-3 · 2021 · Ate its own wiring',
  'BOLT-4 · 2022 · Too fast, no brakes',
  'BOLT-5 · 2023 · Lost a bet',
  'BOLT-6 · 2024 · Sacrificed for parts',
]

function Wreck({ index, position }: { index: number; position: [number, number, number] }) {
  const tilt = [0.3, -0.2, 0.1, -0.4, 0.25, 0][index]
  const scorch = index === 2 || index === 4
  return (
    <group position={position} rotation={[tilt, (index * 1.3) % Math.PI, index % 2 ? 0.15 : -0.1]}>
      <RoundedBox args={[1.6, 0.5, 2.2]} radius={0.06} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color={scorch ? '#1a1612' : '#3b3f47'} roughness={0.9} metalness={0.3} />
      </RoundedBox>
      {/* some wheels missing */}
      {[[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]].filter((_, i) => (i + index) % 3 !== 0).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
          <meshStandardMaterial color={COLORS.rubber} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0.9]}>
        <boxGeometry args={[0.9, 0.08, 0.1]} />
        <meshStandardMaterial color={COLORS.rust} emissive={COLORS.volt} emissiveIntensity={0.05} />
      </mesh>
    </group>
  )
}

export function Graveyard() {
  const [cx, cz] = GRAVEYARD_CENTER
  return (
    <group position={[cx, 0, cz]}>
      {/* room floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#101217" roughness={1} />
      </mesh>
      {/* three walls */}
      <mesh position={[0, 4, -6]}><planeGeometry args={[18, 8]} /><meshStandardMaterial color={COLORS.wallDark} /></mesh>
      <mesh position={[-9, 4, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[12, 8]} /><meshStandardMaterial color={COLORS.wallDark} /></mesh>
      <mesh position={[9, 4, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[12, 8]} /><meshStandardMaterial color={COLORS.wallDark} /></mesh>
      <mesh position={[0, 4, 6]}><planeGeometry args={[18, 8]} /><meshStandardMaterial color={COLORS.wallDark} side={THREE.BackSide} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}><planeGeometry args={[18, 12]} /><meshStandardMaterial color={COLORS.ink} /></mesh>
      {WRECKS.map((label, i) => {
        const x = -6 + (i % 3) * 6
        const z = i < 3 ? -3 : 2
        return (
          <group key={i}>
            <Wreck index={i} position={[x, 0, z]} />
            <group position={[x, 1.6, z - 1.6]}>
              <mesh>
                <boxGeometry args={[2.6, 0.5, 0.05]} />
                <meshStandardMaterial color="#2a2f38" metalness={0.6} roughness={0.5} />
              </mesh>
              <Text position={[0, 0, 0.03]} fontSize={0.16} color="#d6d9de" anchorX="center" anchorY="middle" maxWidth={2.4} textAlign="center">
                {label}
              </Text>
            </group>
          </group>
        )
      })}
      <pointLight position={[0, 5, 0]} color="#ff7a3d" intensity={25} distance={16} decay={2} />
      <pointLight position={[-6, 3, -3]} color="#ff3b3b" intensity={6} distance={8} decay={2} />
    </group>
  )
}

/** Arcade room below the floor, reached via the hatch. */
export function Arcade({ credits }: { credits: string[] }) {
  const [cx, cz] = ARCADE_CENTER
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 768
    c.height = 1024
    const g = c.getContext('2d')!
    g.fillStyle = '#05030a'
    g.fillRect(0, 0, 768, 1024)
    g.textAlign = 'center'
    credits.forEach((line, i) => {
      g.font = i === 0 ? 'bold 72px "Space Grotesk", sans-serif' : '28px "IBM Plex Mono", monospace'
      g.fillStyle = i === 0 ? COLORS.magenta : i === credits.length - 1 ? COLORS.cyan : '#d6d9de'
      g.fillText(line, 384, 140 + i * 68)
    })
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [credits])
  return (
    <group position={[cx, ARCADE_Y, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#070509" roughness={0.3} metalness={0.4} />
      </mesh>
      {[[0, 3, -7, 0], [0, 3, 7, Math.PI], [-7, 3, 0, Math.PI / 2], [7, 3, 0, -Math.PI / 2]].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
          <planeGeometry args={[14, 6]} />
          <meshStandardMaterial color="#0a0710" />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#030205" />
      </mesh>
      {/* neon strips */}
      {[[-6.9, 0.3, 0, 0, 0, Math.PI / 2, COLORS.magenta], [6.9, 0.3, 0, 0, 0, Math.PI / 2, COLORS.cyan], [0, 0.3, -6.9, Math.PI / 2, 0, 0, COLORS.cyan]].map(([x, y, z, rx, ry, rz, c], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]} rotation={[rx as number, ry as number, rz as number]}>
          <cylinderGeometry args={[0.04, 0.04, 13.6, 8]} />
          <meshStandardMaterial color="#fff" emissive={c as string} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}
      {/* the one screen */}
      <group position={[0, 2.6, -6.7]}>
        <RoundedBox args={[3.2, 4.2, 0.3]} radius={0.05}>
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.16]}>
          <planeGeometry args={[2.9, 3.9]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#fff" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[-5, 2, 0]} color={COLORS.magenta} intensity={12} distance={12} decay={2} />
      <pointLight position={[5, 2, 0]} color={COLORS.cyan} intensity={12} distance={12} decay={2} />
    </group>
  )
}

/** Static station props (no physics). Crate tower, hatch and shutter animation live in Secrets. */
export function StationProps() {
  return (
    <group>
      <Workbench />
      <Lockers />
      <Scoreboard />
      <Lab />
      <Dock />
    </group>
  )
}
