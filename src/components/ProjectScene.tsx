import type { Project } from '../data/types'
import { BoardViewer } from './board/BoardViewer'
import { boardFor, defaultRigForScene } from './board/layout'

export function ProjectScene({ project }: { project: Project }) {
  return (
    <BoardViewer
      board={boardFor(project.boards)}
      rig={project.rig ?? defaultRigForScene(project.scene)}
      className="h-[240px] w-full"
      label={`Interactive 3D board view for ${project.title}`}
    />
  )
}
