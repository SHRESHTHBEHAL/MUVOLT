export function isTouch(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
}

export function isMobileLayout(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768
}
