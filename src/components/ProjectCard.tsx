import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, BookmarkCheck, Clock } from 'lucide-react'
import type { BoardKind, Project } from '../data/types'
import { guideKeys, guideSteps, resolveSelection } from '../data/guideView'
import { useBookmarks } from '../hooks/bookmarks'
import type { StepProgress } from '../hooks/useSteps'
import { readLS } from '../hooks/useLocalStorage'
import { DifficultyBadge } from './DifficultyBadge'

export function ProjectCard({ project }: { project: Project }) {
  const { has, toggle } = useBookmarks()
  const saved = has(project.slug)
  const keys = guideKeys(project.slug)
  const sel = resolveSelection(project, readLS<string>(keys.version, ''), readLS<BoardKind | ''>(keys.board, '') || undefined)
  const steps = guideSteps(project, sel)
  const progress = readLS<StepProgress>(keys.progress, {})
  const done = steps.filter((s) => progress[s.id]).length
  const total = steps.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <article className="group relative flex h-full cursor-pointer flex-col rounded-2xl has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-leaf dark:has-[a:focus-visible]:ring-leafbright border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-leaf/60 hover:shadow-[0_18px_40px_-22px_rgba(20,60,35,0.45)] dark:border-edge dark:bg-moss dark:hover:border-leafbright/50">
      <div className="flex items-center justify-between gap-2">
        <DifficultyBadge level={project.difficulty} />
        <span className="inline-flex items-center gap-1 text-xs text-fog dark:text-[#9bb0a0]">
          <Clock className="h-3.5 w-3.5" />
          {project.weeks}
        </span>
      </div>
      {/* Stretched link: its ::after covers the whole card, so a click anywhere opens the guide. */}
      <Link
        to={`/project/${project.slug}`}
        className="mt-3 font-display text-xl font-bold leading-snug text-ink outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:text-leaf dark:text-[#e4ece5] dark:group-hover:text-leafbright"
      >
        {project.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">
        {project.tagline}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.boards.map((b) => (
          <span
            key={b}
            className="rounded-md bg-linelight px-2 py-0.5 font-mono text-[11px] text-fog dark:bg-[#24352a] dark:text-[#9bb0a0]"
          >
            {b}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-linelight pt-3 text-xs dark:border-[#24352a]">
        <span className="font-semibold text-ink dark:text-[#e4ece5]">{project.cost}</span>
        <span className="text-fog dark:text-[#9bb0a0]">
          {done}/{total} steps
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-linelight dark:bg-[#24352a]">
        <div className="h-full rounded-full bg-leaf dark:bg-leafbright" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1 text-sm font-semibold text-leaf group-hover:underline dark:text-leafbright"
        >
          Open guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
        <button
          type="button"
          onClick={() => toggle(project.slug)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark this guide'}
          className={`relative z-10 rounded-lg border p-2 transition-colors ${
            saved
              ? 'border-leaf bg-palegreen text-leaf dark:border-leafbright dark:bg-[#1f3626] dark:text-leafbright'
              : 'border-line text-fog hover:bg-linelight dark:border-[#2f4234] dark:text-[#9bb0a0] dark:hover:bg-[#24352a]'
          }`}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
    </article>
  )
}
