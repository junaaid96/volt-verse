import type { BoardKind, Project } from '../data/types'
import { BOARD_NAMES } from '../data/guideView'
import { BoardViewer } from './board/BoardViewer'
import { defaultRigForScene } from './board/layout'

export function ProjectScene({ project, board }: { project: Project; board: BoardKind }) {
  return (
    <BoardViewer
      board={board}
      rig={project.rig ?? defaultRigForScene(project.scene)}
      className="h-[340px] w-full lg:h-[380px]"
      label={`Interactive 3D view of ${project.title} on ${BOARD_NAMES[board]}`}
    />
  )
}
