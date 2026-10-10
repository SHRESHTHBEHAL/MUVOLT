import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './three/Scene'
import { bayStore } from './store/useStore'

export default function App() {
  // temporary until the boot sequence exists: lights on, controls live
  useEffect(() => {
    bayStore.getState().setBootProgress(1)
    bayStore.getState().setBoot('live')
  }, [])
  return (
    <div className="fixed inset-0">
      <Canvas shadows camera={{ position: [0, 5, -8], fov: 55, near: 0.1, far: 120 }} dpr={[1, 1.5]}>
        <Scene />
      </Canvas>
    </div>
  )
}
