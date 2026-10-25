import { useCallback } from 'react'
import { guideKeys } from '../data/guideView'
import { useLocalStorage } from './useLocalStorage'

export type StepProgress = Record<string, true>

/** Build-step checklist keyed by step id, so progress survives version/board filtering. */
export function useSteps(slug: string, ids: string[]) {
  const [progress, setRaw] = useLocalStorage<StepProgress>(guideKeys(slug).progress, {})

  const toggle = useCallback(
    (id: string) => {
      setRaw((prev) => {
        const next: StepProgress = { ...prev }
        if (next[id]) delete next[id]
        else next[id] = true
        return next
      })
    },
    [setRaw],
  )

  const reset = useCallback(() => {
    setRaw((prev) => {
      const next: StepProgress = { ...prev }
      ids.forEach((id) => delete next[id])
      return next
    })
  }, [ids, setRaw])

  const finished = ids.filter((id) => progress[id]).length
  const pct = ids.length === 0 ? 0 : Math.round((finished / ids.length) * 100)

  return { isDone: (id: string) => progress[id] === true, toggle, reset, finished, pct }
}
