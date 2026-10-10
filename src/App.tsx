import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './three/Scene'
import { useStore } from './store/useStore'
import { tierSettings } from './logic/tier'
import { Boot } from './hud/Boot'
import { Hud } from './hud/Hud'
import { Fallback } from './fallback/Fallback'

export default function App({ webgl }: { webgl: boolean }) {
  const fallback = useStore((s) => s.fallback)
  const tier = useStore((s) => s.tier)
  const settings = tierSettings(tier)

  if (!webgl) return <Fallback notice="Your browser can't run the 3D bay, so here's the flat version." canReturn={false} />
  if (fallback) return <Fallback canReturn />

  return (
    <div className="fixed inset-0">
      <Canvas
        shadows={settings.shadows}
        camera={{ position: [0, 5, -8], fov: 55, near: 0.1, far: 120 }}
        dpr={[1, settings.maxDpr]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Boot />
      <Hud />
    </div>
  )
}
