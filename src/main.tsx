import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { bayStore } from './store/useStore'
import { keyboard } from './hooks/useKeyboard'

if (import.meta.env.DEV) {
  const w = window as unknown as { bay: typeof bayStore; bayKeys: typeof keyboard }
  w.bay = bayStore
  w.bayKeys = keyboard
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
