import { World } from './World'
import { StationProps, Shutter, Graveyard } from './Props'
import { useStore } from '../store/useStore'

export function Scene() {
  const tier = useStore((s) => s.tier)
  return (
    <>
      <color attach="background" args={['#0B0C0F']} />
      <fog attach="fog" args={['#0B0C0F', 30, 70]} />
      <World tier={tier} />
      <StationProps />
      <Shutter />
      <Graveyard />
    </>
  )
}
