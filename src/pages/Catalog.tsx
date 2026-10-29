import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookmarkCheck, Search } from 'lucide-react'
import { DIFFICULTY_ORDER, projects } from '../data/projects'
import { categories } from '../data/categories'
import type { Difficulty } from '../data/types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useBookmarks } from '../hooks/bookmarks'
import { ProjectCard } from '../components/ProjectCard'

interface Filters {
  q: string
  /** Stored but no longer read: the track filter is URL-driven (?track=), so plain /projects always shows all. */
  cat: string
  diff: 'all' | Difficulty
  sort: 'featured' | 'az' | 'difficulty'
}

const DEFAULTS: Filters = { q: '', cat: 'all', diff: 'all', sort: 'featured' }

const selectCls =
  'rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink dark:border-edge dark:bg-moss dark:text-foam'

export function Catalog() {
  const [params, setParams] = useSearchParams()
  const { saved } = useBookmarks()
  const [filters, setFilters] = useLocalStorage<Filters>('vv-filters', DEFAULTS)
  // Saved view is URL-driven (?saved=1), so Guides/Saved nav never disagree.
  const savedOnly = params.get('saved') === '1'
  // Track filter is URL-driven only (?track=robotics): home/footer track links
  // land filtered, while plain /projects (Guides nav) always shows all tracks.
  const trackParam = params.get('track')
  const urlCat =
    trackParam && categories.some((c) => c.status === 'live' && c.id === trackParam)
      ? trackParam
      : null
  const activeCat = urlCat ?? 'all'

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters((f) => ({ ...f, [k]: v }))

  const setCat = (v: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (v === 'all') next.delete('track')
      else next.set('track', v)
      return next
    })
  }

  const toggleSaved = () =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (savedOnly) next.delete('saved')
      else next.set('saved', '1')
      return next
    })

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    let list = [...projects]
    if (activeCat !== 'all') list = list.filter((p) => p.categoryId === activeCat)
    if (filters.diff !== 'all') list = list.filter((p) => p.difficulty === filters.diff)
    if (savedOnly) list = list.filter((p) => saved.includes(p.slug))
    if (q) {
      list = list.filter((p) =>
        [p.title, p.tagline, ...p.boards, ...p.skills].join(' ').toLowerCase().includes(q),
      )
    }
    switch (filters.sort) {
      case 'az':
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'difficulty':
        list.sort(
          (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty),
        )
        break
      default:
        list.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    }
    return list
  }, [filters, saved, savedOnly, activeCat])

  const liveCats = categories.filter((c) => c.status === 'live')
  const clearAll = () => {
    setFilters(DEFAULTS)
    setParams({})
  }
  // `cat` is normalized out: older saved filters may hold a stale track value.
  const isDefault =
    JSON.stringify({ ...filters, cat: 'all' }) === JSON.stringify(DEFAULTS) && !savedOnly && !urlCat

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <h1 className="font-display text-3xl font-bold text-ink dark:text-foam">Project guides</h1>
      <p className="mt-1 text-sm text-fog dark:text-mist">
        {results.length} of {projects.length} guides
        {activeCat !== 'all' ? ` · ${categories.find((c) => c.id === activeCat)?.name ?? activeCat}` : ''}
        {savedOnly ? ' · saved only' : ''}
      </p>

      <div className="mt-5 rounded-xl border border-line bg-card p-4 dark:border-edge dark:bg-moss">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Search ESP32, RFID, health, LoRa…"
              className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-fog/70 dark:border-edge dark:bg-pine dark:text-foam"
              aria-label="Search guides"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeCat}
              onChange={(e) => setCat(e.target.value)}
              className={selectCls}
              aria-label="Track"
            >
              <option value="all">All tracks</option>
              {liveCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filters.diff}
              onChange={(e) => set('diff', e.target.value as Filters['diff'])}
              className={selectCls}
              aria-label="Level"
            >
              <option value="all">All levels</option>
              <option value="Basic">Basic</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={filters.sort}
              onChange={(e) => set('sort', e.target.value as Filters['sort'])}
              className={selectCls}
              aria-label="Sort"
            >
              <option value="featured">Featured first</option>
              <option value="difficulty">Easiest first</option>
              <option value="az">A – Z</option>
            </select>
            <button
              type="button"
              onClick={toggleSaved}
              aria-pressed={savedOnly}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                savedOnly
                  ? 'border-leaf bg-palegreen text-leaf dark:border-leafbright dark:bg-fern dark:text-leafbright'
                  : 'border-line text-fog dark:border-edge dark:text-mist'
              }`}
            >
              <BookmarkCheck className="h-4 w-4" /> Saved
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-10 text-center dark:border-edge">
          <p className="font-display text-xl font-bold text-ink dark:text-foam">No guides match</p>
          <p className="mt-1 text-sm text-fog dark:text-mist">
            Try a shorter keyword, or clear the filters.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white hover:bg-leafdeep"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      )}

      {!isDefault && results.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-6 text-sm text-fog hover:underline dark:text-mist"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
