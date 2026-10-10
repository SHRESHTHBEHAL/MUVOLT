import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { bayStore } from './store/useStore'
import { keyboard } from './hooks/useKeyboard'
import { roverTeleport } from './three/roverState'

if (import.meta.env.DEV) {
  const w = window as unknown as { bay: typeof bayStore; bayKeys: typeof keyboard; bayTeleport: typeof roverTeleport }
  w.bay = bayStore
  w.bayKeys = keyboard
  w.bayTeleport = roverTeleport
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
