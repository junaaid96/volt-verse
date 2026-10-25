import { useEffect, useState } from 'react'

/** All VoltVerse persistence goes through localStorage — no backend. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      /* corrupted entry: fall through to initial */
    }
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota / private mode: app still works in-memory */
    }
  }, [key, value])

  return [value, setValue] as const
}

/** One-shot read (for mount-time snapshots like overall progress). */
export function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) return JSON.parse(raw) as T
  } catch {
    /* ignore */
  }
  return fallback
}
