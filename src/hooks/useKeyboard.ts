import { useEffect } from 'react'
import type { KeySet } from '../logic/input'

/** Module-level set so the physics loop can read it without React re-renders. */
const pressed = new Set<string>()
let listeners = 0

const GAME_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

function onDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
  pressed.add(e.code)
  if (GAME_KEYS.has(e.code)) e.preventDefault()
}
function onUp(e: KeyboardEvent) {
  pressed.delete(e.code)
}
function onBlur() {
  pressed.clear()
}

export const keyboard: KeySet = pressed

export function useKeyboard(): KeySet {
  useEffect(() => {
    if (listeners++ === 0) {
      window.addEventListener('keydown', onDown)
      window.addEventListener('keyup', onUp)
      window.addEventListener('blur', onBlur)
    }
    return () => {
      if (--listeners === 0) {
        window.removeEventListener('keydown', onDown)
        window.removeEventListener('keyup', onUp)
        window.removeEventListener('blur', onBlur)
      }
    }
  }, [])
  return pressed
}
