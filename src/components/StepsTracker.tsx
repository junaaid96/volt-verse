import { useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import type { BuildStep } from '../data/types'
import { BOARD_NAMES } from '../data/guideView'
import { useSteps } from '../hooks/useSteps'

function StepTags({ step, version }: { step: BuildStep; version: string }) {
  const tags = [
    ...(step.versions ? [`Version ${version.toUpperCase()}`] : []),
    ...(step.boards ? step.boards.map((b) => BOARD_NAMES[b]) : []),
  ]
  if (tags.length === 0) return null
  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
      {tags.map((t) => (
        <span key={t} className="rounded bg-linelight px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-fog dark:bg-[#24352a] dark:text-mist">
          {t}
        </span>
      ))}
    </span>
  )
}

export function StepsTracker({ slug, steps, version }: { slug: string; steps: BuildStep[]; version: string }) {
  const ids = useMemo(() => steps.map((s) => s.id), [steps])
  const { isDone, toggle, reset, finished, pct } = useSteps(slug, ids)

  return (
    <div>
      <div className="print-hide mb-4 flex items-center justify-between gap-3">
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fog hover:underline dark:text-[#9bb0a0]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
      <ol className="grid list-none gap-3 p-0">
        {steps.map((s, i) => {
          const done = isDone(s.id)
          return (
            <li
              key={s.id}
              className={`relative rounded-xl border p-4 pl-16 transition-colors ${
                done
                  ? 'border-leaf bg-palegreen/50 dark:border-leafbright dark:bg-[#1f3626]/40'
                  : 'border-line bg-card dark:border-[#2f4234] dark:bg-moss'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={done}
                aria-label={done ? `Mark step ${i + 1} not done` : `Mark step ${i + 1} done`}
                className={`absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full font-bold transition-colors print:border print:border-[#888] print:bg-transparent print:text-ink ${
                  done ? 'bg-leaf text-white' : 'bg-linelight text-fog dark:bg-[#24352a] dark:text-[#9bb0a0]'
                }`}
              >
                {done ? '✓' : i + 1}
              </button>
              <h4 className="font-semibold text-ink dark:text-[#e4ece5]">
                {s.title}
                <StepTags step={s} version={version} />
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">{s.detail}</p>
            </li>
          )
        })}
      </ol>
      <p className="print-hide mt-3 text-xs text-fog dark:text-[#9bb0a0]">
        Checkboxes save automatically in this browser — pick up where you left off anytime.
      </p>
    </div>
  )
}
