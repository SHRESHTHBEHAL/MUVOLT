import { useStore } from '../store/useStore'
import { TopNav } from './TopNav'
import { Telemetry } from './Telemetry'
import { Minimap } from './Minimap'
import { MobileControls } from './MobileControls'
import { PanelFrame } from './PanelFrame'
import { isTouch } from './device'

export function Hud() {
  const live = useStore((s) => s.boot === 'live')
  if (!live) return null
  return (
    <div className="fade-in">
      <TopNav />
      <Telemetry />
      <Minimap />
      {isTouch() && <MobileControls />}
      <PanelFrame />
    </div>
  )
}
