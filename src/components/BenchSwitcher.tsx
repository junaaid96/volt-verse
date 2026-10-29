import type { BoardKind } from '../data/types'

export interface BenchOption {
  board: BoardKind
  name: string
}

export function BenchSwitcher({
  options,
  active,
  onSelect,
  label = 'Choose a board',
}: {
  options: BenchOption[]
  active: BoardKind
  onSelect: (board: BoardKind) => void
  label?: string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((o) => {
        const on = o.board === active
        return (
          <button
            key={o.board}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(o.board)}
            className={`rounded-lg px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
              on
                ? 'bg-ink text-white dark:bg-leafbright dark:text-pine'
                : 'text-fog hover:bg-linelight hover:text-ink dark:text-mist dark:hover:bg-mosslight dark:hover:text-foam'
            }`}
          >
            {o.name}
          </button>
        )
      })}
    </div>
  )
}
