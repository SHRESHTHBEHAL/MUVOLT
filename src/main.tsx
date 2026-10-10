import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { bayStore } from './store/useStore'
import { keyboard } from './hooks/useKeyboard'
import { roverTeleport } from './three/roverState'
import { detectTier } from './logic/detectTier'

if (import.meta.env.DEV) {
  const w = window as unknown as { bay: typeof bayStore; bayKeys: typeof keyboard; bayTeleport: typeof roverTeleport }
  w.bay = bayStore
  w.bayKeys = keyboard
  w.bayTeleport = roverTeleport
}

function hasWebGL2(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

const webgl = hasWebGL2()
if (webgl && !bayStore.getState().tierOverride) {
  const tier = detectTier()
  bayStore.setState({ tier })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App webgl={webgl} />
  </StrictMode>,
)
