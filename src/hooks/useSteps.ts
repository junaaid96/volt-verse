import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

/** Per-project build-step checklist, persisted in localStorage. */
export function useSteps(slug: string, count: number) {
  const [raw, setRaw] = useLocalStorage<boolean[]>(`vv-steps-${slug}`, [])

  const done = useMemo(() => {
    const arr = Array.from({ length: count }, (_, i) => raw[i] === true)
    return arr
  }, [raw, count])

  const toggle = useCallback(
    (i: number) => {
      setRaw((prev) => {
        const next = Array.from({ length: count }, (_, k) => prev[k] === true)
        next[i] = !next[i]
        return next
      })
    },
    [count, setRaw],
  )

  const reset = useCallback(() => setRaw([]), [setRaw])

  const finished = done.filter(Boolean).length
  const pct = count === 0 ? 0 : Math.round((finished / count) * 100)

  return { done, toggle, reset, finished, pct }
}
