import { Ban } from 'lucide-react'
import type { BoardKind, BuildOption } from '../data/types'
import { BOARD_NAMES } from '../data/guideView'
import { BenchSwitcher, type BenchOption } from './BenchSwitcher'

const selectCls =
  'rounded-lg border border-line bg-card py-1.5 pl-2.5 pr-7 text-sm font-medium text-ink dark:border-[#2f4234] dark:bg-moss dark:text-[#e4ece5]'

/** Compact board + version pickers for the sticky guide nav. Only boards that can run the guide are offered. */
export function BuildSelector({
  boards,
  board,
  onBoard,
  options,
  version,
  onVersion,
}: {
  boards: BoardKind[]
  board: BoardKind
  onBoard: (b: BoardKind) => void
  options: BuildOption[]
  version: string
  onVersion: (v: string) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {boards.length > 1 && (
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fog dark:text-mist">
          <span className="hidden sm:inline">Board</span>
          <select aria-label="Board" className={selectCls} value={board} onChange={(e) => onBoard(e.target.value as BoardKind)}>
            {boards.map((b) => (
              <option key={b} value={b}>
                {BOARD_NAMES[b]}
              </option>
            ))}
          </select>
        </label>
      )}
      {options.length > 1 && (
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fog dark:text-mist">
          <span className="hidden sm:inline">Version</span>
          <select aria-label="Version" className={selectCls} value={version} onChange={(e) => onVersion(e.target.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}

/** Lists the bench boards this guide can't run on, with the reason for each. */
export function NotSuitableList({ items }: { items: Array<{ board: BoardKind; reason: string }> }) {
  if (items.length === 0) return null
  return (
    <div className="rounded-xl border border-line bg-card p-3 text-sm dark:border-[#2f4234] dark:bg-moss">
      <p className="flex items-center gap-1.5 font-semibold text-ink dark:text-foam">
        <Ban className="h-4 w-4 text-amber dark:text-amberbright" aria-hidden="true" />
        Not suitable for this build
      </p>
      <ul className="mt-1.5 grid gap-1">
        {items.map(({ board, reason }) => (
          <li key={board} className="leading-relaxed text-fog dark:text-mist">
            <strong className="font-semibold text-ink dark:text-foam">{BOARD_NAMES[board]}:</strong> {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** In-section board buttons plus a reminder of the active version. */
export function SectionBoardBar({
  options,
  board,
  onBoard,
  option,
}: {
  options: BenchOption[]
  board: BoardKind
  onBoard: (b: BoardKind) => void
  option: BuildOption
}) {
  return (
    <div className="print-hide mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-2 py-1.5 dark:border-[#2f4234] dark:bg-moss">
      <BenchSwitcher options={options} active={board} onSelect={onBoard} label="Board for this section" />
      <span className="px-1 text-xs text-fog dark:text-mist">
        Version: <strong className="font-semibold text-ink dark:text-foam">{option.title}</strong>
      </span>
    </div>
  )
}
