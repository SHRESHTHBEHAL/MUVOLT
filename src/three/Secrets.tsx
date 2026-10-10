import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import { RoundedBox, Text } from '@react-three/drei'
import gsap from 'gsap'
import { HonkKeypad, Konami, CrateTower } from '../logic/secrets'
import { bayStore } from '../store/useStore'
import { roverState, roverTeleport } from './roverState'
import { Shutter, Arcade, CRATE_TOWER_POS, SHUTTER_POS, HATCH_POS, ARCADE_CENTER, ARCADE_Y } from './Props'
import { COLORS } from './palette'
import { site } from '../content/site'
import { audio } from '../audio/AudioManager'

/* ---------- 1. Graveyard shutter: honk three times ---------- */

function ShutterSecret() {
  const door = useRef<THREE.Group>(null)
  const keypad = useMemo(() => new HonkKeypad(), [])
  const hornWasDown = useRef(false)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)

  useFrame(() => {
    if (openRef.current) return
    const horn = roverState.horn
    if (horn && !hornWasDown.current) {
      const d = Math.hypot(roverState.position.x - SHUTTER_POS[0], roverState.position.z - SHUTTER_POS[1])
      if (keypad.honk(performance.now(), d < 7)) {
        openRef.current = true
        setOpen(true)
        bayStore.getState().unlockSecret('graveyard')
        audio.play('shutter')
        if (door.current) gsap.to(door.current.position, { y: 7, duration: 1.4, ease: 'power2.inOut' })
      }
    }
    hornWasDown.current = horn
  })

  return (
    <group>
      <Shutter doorRef={door} />
      {!open && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[4.1, 3.5, 0.3]} position={[SHUTTER_POS[0], 3.5, SHUTTER_POS[1] - 1]} />
        </RigidBody>
      )}
    </group>
  )
}

/* ---------- 2. Floor hatch into the arcade, lift pad back up ---------- */

function HatchSecret() {
  const lid = useRef<THREE.Mesh>(null)
  const busy = useRef(false)
  const [cx, cz] = ARCADE_CENTER
  const liftPos: [number, number] = [cx, cz + 5]
  const lift = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (lift.current) (lift.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(clock.elapsedTime * 3) * 0.5
    if (busy.current) return
    const p = roverState.position
    // drop through the hatch
    if (p.y > -1 && Math.hypot(p.x - HATCH_POS[0], p.z - HATCH_POS[1]) < 1.3) {
      busy.current = true
      const s = bayStore.getState()
      if (!s.secrets.arcade) s.unlockSecret('arcade')
      audio.play('servo')
      if (lid.current) gsap.to(lid.current.rotation, { x: -Math.PI / 2 - 0.4, duration: 0.25, ease: 'power3.out' })
      roverTeleport.request({ x: cx, y: ARCADE_Y + 4, z: cz - 3, keepVelocity: true })
      setTimeout(() => {
        if (lid.current) gsap.to(lid.current.rotation, { x: 0, duration: 0.6, ease: 'power2.inOut' })
        busy.current = false
      }, 1500)
    }
    // ride the lift back up
    if (p.y < -2 && Math.hypot(p.x - liftPos[0], p.z - liftPos[1]) < 1.6) {
      busy.current = true
      audio.play('dock')
      roverTeleport.request({ x: HATCH_POS[0] + 4, y: 1.5, z: HATCH_POS[1], keepVelocity: false })
      setTimeout(() => { busy.current = false }, 1500)
    }
  })

  return (
    <group>
      {/* hatch frame + lid on the main floor */}
      <group position={[HATCH_POS[0], 0.02, HATCH_POS[1]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.35, 1.6, 6]} />
          <meshStandardMaterial color={COLORS.steelDark} metalness={0.7} roughness={0.4} />
        </mesh>
        <group position={[0, 0.04, -1.3]}>
          <mesh ref={lid} rotation={[0, 0, 0]} position={[0, 0, 0]}>
            <group position={[0, 0, 1.3]}>
              <mesh castShadow>
                <cylinderGeometry args={[1.3, 1.3, 0.08, 6]} />
                <meshStandardMaterial color="#262b35" metalness={0.65} roughness={0.45} />
              </mesh>
              <Text position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} letterSpacing={0.2} color={COLORS.magenta} anchorX="center" anchorY="middle">
                ↓ ??? ↓
              </Text>
            </group>
          </mesh>
        </group>
        <pointLight position={[0, 0.3, 0]} color={COLORS.magenta} intensity={2.5} distance={4} decay={2} />
      </group>
      {/* the arcade room itself, plus the lift pad */}
      <Arcade credits={site.credits} />
      <group position={[liftPos[0], ARCADE_Y + 0.03, liftPos[1]]}>
        <mesh ref={lift} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 48]} />
          <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={1} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} letterSpacing={0.25} color={COLORS.cyan} anchorX="center" anchorY="middle">
          LIFT
        </Text>
      </group>
    </group>
  )
}

/* ---------- 3. Crate tower that re-stacks itself ---------- */

const CRATE = 0.9
const CRATE_HOMES: [number, number, number][] = [
  [-CRATE, CRATE / 2, 0], [0, CRATE / 2, 0], [CRATE, CRATE / 2, 0],
  [-CRATE / 2, CRATE * 1.5, 0], [CRATE / 2, CRATE * 1.5, 0],
  [0, CRATE * 2.5, 0],
]

function CrateSecret() {
  const bodies = useRef<(RapierRigidBody | null)[]>([])
  const tower = useMemo(() => new CrateTower(), [])
  const restacking = useRef(false)
  const [tx, tz] = CRATE_TOWER_POS

  useFrame(() => {
    if (restacking.current) return
    const now = performance.now()
    if (!tower.knocked) {
      const moved = bodies.current.some((b, i) => {
        if (!b) return false
        const p = b.translation()
        const h = CRATE_HOMES[i]
        return Math.hypot(p.x - (tx + h[0]), p.y - h[1], p.z - (tz + h[2])) > 0.5
      })
      if (moved) {
        tower.knock(now)
        audio.play('crash')
        bayStore.getState().unlockSecret('crates')
      }
    } else if (tower.shouldReset(now)) {
      restacking.current = true
      audio.play('restack')
      const proxies = bodies.current.map((b) => {
        const p = b!.translation()
        return { x: p.x, y: p.y, z: p.z }
      })
      bodies.current.forEach((b) => {
        b?.setBodyType(2, true) // 2 = KinematicPositionBased
        b?.setLinvel({ x: 0, y: 0, z: 0 }, true)
        b?.setAngvel({ x: 0, y: 0, z: 0 }, true)
      })
      const tl = gsap.timeline({
        onUpdate: () => {
          bodies.current.forEach((b, i) => {
            b?.setNextKinematicTranslation(proxies[i])
            b?.setNextKinematicRotation({ x: 0, y: 0, z: 0, w: 1 })
          })
        },
        onComplete: () => {
          bodies.current.forEach((b, i) => {
            const h = CRATE_HOMES[i]
            b?.setTranslation({ x: tx + h[0], y: h[1], z: tz + h[2] }, true)
            b?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
            b?.setBodyType(0, true) // dynamic
            b?.sleep()
          })
          tower.reset()
          restacking.current = false
        },
      })
      proxies.forEach((pr, i) => {
        const h = CRATE_HOMES[i]
        tl.to(pr, { x: tx + h[0], y: h[1] + 0.6, z: tz + h[2], duration: 0.5, ease: 'power2.inOut' }, i * 0.06)
        tl.to(pr, { y: h[1], duration: 0.25, ease: 'bounce.out' }, 0.5 + i * 0.06)
      })
    }
  })

  return (
    <group>
      {CRATE_HOMES.map((h, i) => (
        <RigidBody
          key={i}
          ref={(el) => { bodies.current[i] = el }}
          position={[tx + h[0], h[1], tz + h[2]]}
          colliders="cuboid"
          density={0.25}
          friction={0.8}
          linearDamping={0.3}
          angularDamping={0.5}
        >
          <RoundedBox args={[CRATE, CRATE, CRATE]} radius={0.04} castShadow receiveShadow>
            <meshStandardMaterial color={i % 2 ? '#5b4a30' : '#6b5838'} roughness={0.9} />
          </RoundedBox>
          <mesh position={[0, 0, CRATE / 2 + 0.001]}>
            <planeGeometry args={[0.55, 0.22]} />
            <meshStandardMaterial color={COLORS.volt} roughness={0.6} />
          </mesh>
          <Text position={[0, 0, CRATE / 2 + 0.003]} fontSize={0.1} letterSpacing={0.1} color={COLORS.ink} anchorX="center" anchorY="middle">
            {['SERVOS', 'ESP32', 'BOLTS', 'FRAGILE', 'PCBs', 'DO NOT'][i]}
          </Text>
        </RigidBody>
      ))}
      <Text position={[tx, 0.02, tz + 2.0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.32} letterSpacing={0.2} color="#5c6472" anchorX="center" anchorY="middle">
        PARTS · HANDLE WITH CARE
      </Text>
    </group>
  )
}

/* ---------- 4. Konami code ---------- */

function KonamiSecret() {
  useEffect(() => {
    const k = new Konami()
    const onKey = (e: KeyboardEvent) => {
      if (k.press(e.code)) {
        const s = bayStore.getState()
        if (!s.secrets.konami) {
          s.unlockSecret('konami')
          audio.play('dock')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}

export function Secrets() {
  return (
    <group>
      <ShutterSecret />
      <HatchSecret />
      <CrateSecret />
      <KonamiSecret />
    </group>
  )
}
