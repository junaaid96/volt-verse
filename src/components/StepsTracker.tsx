import { RotateCcw } from 'lucide-react'
import type { BuildStep } from '../data/types'
import { useSteps } from '../hooks/useSteps'

export function StepsTracker({ slug, steps }: { slug: string; steps: BuildStep[] }) {
  const { done, toggle, reset, finished, pct } = useSteps(slug, steps.length)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink dark:text-[#e4ece5]">
              {finished} of {steps.length} done
            </span>
            <span className="font-mono text-xs text-fog dark:text-[#9bb0a0]">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-linelight dark:bg-[#24352a]">
            <div className="h-full rounded-full bg-leaf transition-all dark:bg-leafbright" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {finished > 0 && (
          <button
            type="button"
            onClick={reset}
            className="print-hide inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fog hover:underline dark:text-[#9bb0a0]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
      <ol className="grid list-none gap-3 p-0">
        {steps.map((s, i) => (
          <li
            key={i}
            className={`relative rounded-xl border p-4 pl-16 transition-colors ${
              done[i]
                ? 'border-leaf bg-palegreen/50 dark:border-leafbright dark:bg-[#1f3626]/40'
                : 'border-line bg-card dark:border-[#2f4234] dark:bg-moss'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={done[i]}
              aria-label={done[i] ? `Mark step ${i + 1} not done` : `Mark step ${i + 1} done`}
              className={`absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full font-bold transition-colors ${
                done[i] ? 'bg-leaf text-white' : 'bg-linelight text-fog dark:bg-[#24352a] dark:text-[#9bb0a0]'
              }`}
            >
              {done[i] ? '✓' : i + 1}
            </button>
            <h4 className="font-semibold text-ink dark:text-[#e4ece5]">{s.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">{s.detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-fog dark:text-[#9bb0a0]">
        Checkboxes save automatically in this browser — pick up where you left off anytime.
      </p>
    </div>
  )
}
