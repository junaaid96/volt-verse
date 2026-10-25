import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface Bookmarks {
  saved: string[]
  toggle: (slug: string) => void
  has: (slug: string) => boolean
}

const Ctx = createContext<Bookmarks>({ saved: [], toggle: () => {}, has: () => false })

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useLocalStorage<string[]>('vv-saved', [])

  const toggle = useCallback(
    (slug: string) =>
      setSaved((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug])),
    [setSaved],
  )

  const has = useCallback((slug: string) => saved.includes(slug), [saved])

  return <Ctx.Provider value={{ saved, toggle, has }}>{children}</Ctx.Provider>
}

export const useBookmarks = () => useContext(Ctx)
