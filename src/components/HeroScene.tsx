import { BoardViewer } from './board/BoardViewer'

export function HeroScene() {
  return (
    <BoardViewer
      board="uno"
      rig={{ sensor: 'soil', extras: ['relay'] }}
      className="h-[300px] w-full md:h-[380px]"
      label="Interactive 3D Arduino Uno wired to a breadboard"
    />
  )
}
