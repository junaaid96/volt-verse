import type { Difficulty } from '../data/types'

const styles: Record<Difficulty, string> = {
  Basic: 'bg-palegreen text-leaf dark:bg-moss dark:text-leafbright',
  Medium: 'bg-amberpale text-amber dark:bg-moss dark:text-amberbright',
  Advanced: 'bg-claypale text-clay dark:bg-moss dark:text-claybright',
}

const dots: Record<Difficulty, string> = {
  Basic: 'bg-leaf dark:bg-leafbright',
  Medium: 'bg-amber dark:bg-amberbright',
  Advanced: 'bg-clay dark:bg-claybright',
}

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[level]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[level]}`} />
      {level}
    </span>
  )
}
