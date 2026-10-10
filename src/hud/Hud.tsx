import { useStore } from '../store/useStore'
import { TopNav } from './TopNav'
import { Telemetry } from './Telemetry'
import { Minimap } from './Minimap'
import { MobileControls } from './MobileControls'
import { PanelFrame } from './PanelFrame'
import { StationStrip } from './StationStrip'
import { Hints } from './Hints'
import { isTouch } from './device'

export function Hud() {
  const live = useStore((s) => s.boot === 'live')
  if (!live) return null
  return (
    <div className="fade-in">
      <TopNav />
      <StationStrip />
      <Telemetry />
      <Minimap />
      {isTouch() && <MobileControls />}
      <Hints />
      <PanelFrame />
    </div>
  )
}
