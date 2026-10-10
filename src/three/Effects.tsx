import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { tierSettings, type Tier } from '../logic/tier'
import { useStore } from '../store/useStore'

/** Bloom only on the high tier; a cheap vignette everywhere above low. */
export function Effects({ tier }: { tier: Tier }) {
  const { bloom } = tierSettings(tier)
  const turbo = useStore((s) => s.turbo)
  if (tier === 'low') return null
  return (
    <EffectComposer multisampling={bloom ? 4 : 0}>
      {bloom ? <Bloom intensity={0.6} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur /> : <></>}
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
      {turbo ? <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} radialModulation modulationOffset={0.4} /> : <></>}
    </EffectComposer>
  )
}
