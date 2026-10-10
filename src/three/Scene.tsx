import { Suspense } from 'react'
import { Physics } from '@react-three/rapier'
import { World } from './World'
import { StationProps, Graveyard } from './Props'
import { Rover } from './Rover'
import { Tracks, Dust } from './RoverFX'
import { CameraRig } from './CameraRig'
import { StaticColliders } from './Colliders'
import { Stations } from './Stations'
import { Secrets } from './Secrets'
import { useStore } from '../store/useStore'

export function Scene() {
  const tier = useStore((s) => s.tier)
  return (
    <>
      <color attach="background" args={['#0B0C0F']} />
      <fog attach="fog" args={['#0B0C0F', 30, 70]} />
      <World tier={tier} />
      <StationProps />
      <Graveyard />
      <Stations />
      <Tracks />
      <Dust />
      <Suspense fallback={null}>
        <Physics gravity={[0, -14, 0]} timeStep="vary">
          <StaticColliders />
          <Secrets />
          <Rover />
        </Physics>
      </Suspense>
      <CameraRig />
    </>
  )
}
