import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // pre-bundle everything up front so a late discovery can't split three/fiber into two copies
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/rapier',
      '@react-three/postprocessing',
      'postprocessing',
      'zustand',
      'zustand/vanilla',
      'howler',
      'gsap',
    ],
  },
})
