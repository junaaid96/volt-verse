import type { BoardKind, BuildStep, CodeVariant, Part, Project, Scoped, WireBoard } from './types'

export const BOARD_ORDER: BoardKind[] = ['uno', 'esp32', 'nodemcu', 'esp32cam']

export const BOARD_NAMES: Record<BoardKind, string> = {
  uno: 'Arduino Uno',
  esp32: 'ESP32',
  nodemcu: 'NodeMCU',
  esp32cam: 'ESP32-CAM',
}

export interface GuideSelection {
  version: string
  board: BoardKind
}

export interface GuideView {
  parts: Part[]
  /** Board-specific maps first, then shared ones (power, mains, flashing). */
  wiring: WireBoard[]
  /** `detail` already resolved for the selected board. */
  steps: BuildStep[]
  /**
   * Sketches for the version. Ones written for the selected board come first; another board's sketch
   * is kept only when the selected board has no port of the same sketch family (it then needs porting).
   */
  code: CodeVariant[]
}

/** Base sketch id shared by per-board ports: 'a-uno' and 'a-nodemcu' are ports of 'a'. */
const familyOf = (id: string) => id.replace(/-(esp32cam|esp32|nodemcu|uno)$/, '')

const inScope = (item: Scoped, { version, board }: GuideSelection) =>
  (!item.versions || item.versions.includes(version)) && (!item.boards || item.boards.includes(board))

export const supportedBoards = (project: Project): BoardKind[] => BOARD_ORDER.filter((b) => project.support[b].ok)

export function unsupportedBoards(project: Project): Array<{ board: BoardKind; reason: string }> {
  return BOARD_ORDER.flatMap((board) => {
    const s = project.support[board]
    return s.ok ? [] : [{ board, reason: s.reason }]
  })
}

export function resolveSelection(project: Project, version: string | undefined, board: BoardKind | undefined): GuideSelection {
  const v = project.options.some((o) => o.id === version) ? version! : project.options[0].id
  const b = board && supportedBoards(project).includes(board) ? board : project.defaultBoard
  return { version: v, board: b }
}

export function guideSteps(project: Project, sel: GuideSelection): BuildStep[] {
  return project.steps
    .filter((s) => inScope(s, sel))
    .map((s) => ({ ...s, detail: s.boardDetail?.[sel.board] ?? s.detail }))
}

export function selectGuide(project: Project, sel: GuideSelection): GuideView {
  const wiring = project.wiring.filter((w) => inScope(w, sel))
  const versionCode = project.code.filter((c) => !c.versions || c.versions.includes(sel.version))
  const boardCode = versionCode.filter((c) => c.board === sel.board)
  const ownFamilies = new Set(boardCode.map((c) => familyOf(c.id)))
  const portCode = versionCode.filter((c) => c.board !== sel.board && !ownFamilies.has(familyOf(c.id)))

  return {
    parts: project.parts.filter((p) => inScope(p, sel)),
    wiring: [...wiring.filter((w) => w.boards), ...wiring.filter((w) => !w.boards)],
    steps: guideSteps(project, sel),
    code: [...boardCode, ...portCode],
  }
}

/** localStorage keys shared by the guide page and catalog cards. */
export const guideKeys = (slug: string) => ({
  version: `vv-opt-${slug}`,
  board: `vv-board-${slug}`,
  progress: `vv-progress-${slug}`,
})
