import type { HeroBench } from '../data/benches'
import { BoardViewer } from './board/BoardViewer'

export function HeroScene({ bench }: { bench: HeroBench }) {
  return (
    <BoardViewer
      board={bench.board}
      rig={bench.rig}
      className="h-[380px] w-full sm:h-[460px] lg:h-[540px]"
      label={`Interactive 3D ${bench.name} wired to a breadboard with a ${bench.blurb.toLowerCase()}`}
    />
  )
}
