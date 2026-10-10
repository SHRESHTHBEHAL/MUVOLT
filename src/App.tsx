import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Scene } from './three/Scene'
import { bayStore } from './store/useStore'

export default function App() {
  // temporary: lights fully on until the boot sequence exists
  useEffect(() => {
    bayStore.getState().setBootProgress(1)
  }, [])
  return (
    <div className="fixed inset-0">
      <Canvas shadows camera={{ position: [0, 14, 26], fov: 50 }} dpr={[1, 1.5]}>
        <Scene />
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
    </div>
  )
}
