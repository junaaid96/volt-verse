import { Suspense, lazy, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CalendarClock, Cpu, Link2, Printer, Wallet } from 'lucide-react'
import { getProject, projects } from '../data/projects'
import { getCategory } from '../data/categories'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useBookmarks } from '../hooks/bookmarks'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { StepsTracker } from '../components/StepsTracker'

const ProjectScene = lazy(() =>
  import('../components/ProjectScene').then((m) => ({ default: m.ProjectScene })),
)
import { Simulator } from '../components/Simulator'
import { WiringDiagram } from '../components/WiringDiagram'
import { CodeBlock } from '../components/CodeBlock'
import { SheetsList } from '../components/SheetsList'
import { NotFound } from './NotFound'

const SECTIONS = [
  ['versions', 'Versions'],
  ['parts', 'Parts'],
  ['wiring', 'Wiring'],
  ['steps', 'Steps'],
  ['simulator', 'Simulator'],
  ['code', 'Code'],
  ['sheets', 'Datasheets'],
  ['tips', 'Tips'],
] as const

const scrollTo = (id: string) => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

function SectionHead({ n, title, blurb }: { n: string; title: string; blurb?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-2xl font-bold text-ink dark:text-[#e4ece5]">
        <span className="mr-2 text-leaf/70 dark:text-leafbright/70">{n}.</span>
        {title}
      </h2>
      {blurb && <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">{blurb}</p>}
    </div>
  )
}

export function ProjectDetail() {
  const { slug = '' } = useParams()
  // Remount per guide so wiring tab + copy state reset; persisted state is slug-keyed anyway.
  return <DetailView key={slug} slug={slug} />
}

function DetailView({ slug }: { slug: string }) {
  const project = getProject(slug)
  const { has, toggle } = useBookmarks()
  const [optId, setOptId] = useLocalStorage<string>(`vv-opt-${slug}`, '')
  const [wireId, setWireId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  if (!project) return <NotFound />

  const idx = projects.findIndex((p) => p.slug === slug)
  const prev = idx > 0 ? projects[idx - 1] : null
  const next = idx >= 0 && idx < projects.length - 1 ? projects[idx + 1] : null
  const category = getCategory(project.categoryId)
  const saved = has(project.slug)

  const option = project.options.find((o) => o.id === optId) ?? project.options[0]
  const wiring = project.wiring.find((w) => w.id === wireId) ?? project.wiring[0]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div>
      {/* Sub-nav */}
      <div className="print-hide sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur dark:border-[#24352a] dark:bg-pine/95">
        <div className="scrollthin mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {SECTIONS.map(([id, label], i) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-fog transition-colors hover:bg-linelight hover:text-ink dark:text-[#9bb0a0] dark:hover:bg-moss dark:hover:text-white"
            >
              <span className="mr-1 font-mono text-xs text-leaf/70 dark:text-leafbright/70">{i + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-4 pt-6">
        <div className="print-only mb-2 border-b border-line pb-3">
          <p className="font-display text-lg font-bold">VoltVerse lab guide · {project.title}</p>
          <p className="text-xs text-fog">
            Printed {new Date().toLocaleDateString()} · {project.difficulty} · {project.weeks} ·{' '}
            {project.cost}
          </p>
        </div>
        <nav className="print-hide text-sm text-fog dark:text-[#9bb0a0]" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          / <Link to="/projects" className="hover:underline">Guides</Link>{' '}
          / <span className="text-ink dark:text-[#e4ece5]">{project.title}</span>
        </nav>

        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge level={project.difficulty} />
              {category && (
                <span className="rounded-full bg-linelight px-2.5 py-1 text-xs font-semibold text-fog dark:bg-[#24352a] dark:text-[#9bb0a0]">
                  {category.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-fog dark:text-[#9bb0a0]">
                <CalendarClock className="h-3.5 w-3.5" /> Updated {project.updated}
              </span>
            </div>
            <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl dark:text-[#e4ece5]">
              {project.title}
            </h1>
            <p className="mt-2 leading-relaxed text-fog dark:text-[#9bb0a0]">{project.tagline}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg border border-line bg-card p-3 dark:border-[#2f4234] dark:bg-moss">
                <dt className="text-xs text-fog dark:text-[#9bb0a0]">Build time</dt>
                <dd className="mt-0.5 font-semibold text-ink dark:text-[#e4ece5]">{project.weeks}</dd>
              </div>
              <div className="rounded-lg border border-line bg-card p-3 dark:border-[#2f4234] dark:bg-moss">
                <dt className="flex items-center gap-1 text-xs text-fog dark:text-[#9bb0a0]">
                  <Wallet className="h-3 w-3" /> Budget
                </dt>
                <dd className="mt-0.5 font-semibold text-ink dark:text-[#e4ece5]">{project.cost}</dd>
              </div>
              <div className="col-span-2 rounded-lg border border-line bg-card p-3 dark:border-[#2f4234] dark:bg-moss">
                <dt className="flex items-center gap-1 text-xs text-fog dark:text-[#9bb0a0]">
                  <Cpu className="h-3 w-3" /> Boards
                </dt>
                <dd className="mt-0.5 font-mono text-[13px] font-semibold text-ink dark:text-[#e4ece5]">
                  {project.boards.join(' · ')}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.skills.map((s) => (
                <span key={s} className="rounded-md bg-palegreen px-2 py-0.5 text-xs font-medium text-leaf dark:bg-[#1f3626] dark:text-leafbright">
                  {s}
                </span>
              ))}
            </div>
            <div className="print-hide mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggle(project.slug)}
                aria-pressed={saved}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  saved
                    ? 'border-leaf bg-palegreen text-leaf dark:border-leafbright dark:bg-[#1f3626] dark:text-leafbright'
                    : 'border-line bg-card text-ink hover:bg-linelight dark:border-[#2f4234] dark:bg-moss dark:text-[#e4ece5]'
                }`}
              >
                {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {saved ? 'Saved' : 'Save guide'}
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-linelight dark:border-[#2f4234] dark:bg-moss dark:text-[#e4ece5]"
              >
                <Link2 className="h-4 w-4" /> {copied ? 'Link copied!' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#186a3c]"
              >
                <Printer className="h-4 w-4" /> Print / PDF
              </button>
            </div>
          </div>
          <div className="print-hide lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-line bg-card dark:border-[#2f4234] dark:bg-moss">
              <Suspense fallback={<div className="labgrid h-[240px] w-full" />}>
                <ProjectScene project={project} />
              </Suspense>
            </div>
            <p className="mt-2 text-center text-xs text-fog dark:text-[#9bb0a0]">
              Interactive 3D overview of this build.
            </p>
          </div>
        </div>

        {/* 1 Versions */}
        <section id="versions" className="mt-10 scroll-mt-32">
          <SectionHead n="1" title="Choose your version" blurb="Same project, three depths. Your pick is remembered on this device." />
          <div className="grid gap-3 md:grid-cols-3">
            {project.options.map((o) => {
              const active = option?.id === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOptId(o.id)}
                  aria-pressed={active}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? 'border-leaf bg-palegreen/40 dark:border-leafbright dark:bg-[#1f3626]/40'
                      : 'border-line bg-card hover:border-leaf dark:border-[#2f4234] dark:bg-moss'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-leaf dark:text-leafbright">{o.level}</span>
                  <span className="font-display mt-1 block text-lg font-bold leading-snug text-ink dark:text-[#e4ece5]">
                    {o.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">{o.blurb}</span>
                  <span className="mt-2 block text-sm text-fog dark:text-[#9bb0a0]">
                    {o.points.map((pt) => (
                      <span key={pt} className="block">• {pt}</span>
                    ))}
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-ink dark:text-[#e4ece5]">
                    {o.weeks} · {o.cost}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 2 Parts */}
        <section id="parts" className="mt-10 scroll-mt-32">
          <SectionHead n="2" title="Components & budget" blurb="Street-price ranges. Buy the version-A row first, add the rest as you upgrade." />
          <div className="overflow-x-auto rounded-xl border border-line dark:border-[#2f4234]">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-linelight text-left dark:bg-[#24352a]">
                  <th className="px-4 py-2.5 font-semibold text-fog dark:text-[#9bb0a0]">Component</th>
                  <th className="px-4 py-2.5 font-semibold text-fog dark:text-[#9bb0a0]">Qty</th>
                  <th className="px-4 py-2.5 font-semibold text-fog dark:text-[#9bb0a0]">Role</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-fog dark:text-[#9bb0a0]">Price</th>
                </tr>
              </thead>
              <tbody className="bg-card dark:bg-moss">
                {project.parts.map((p, i) => (
                  <tr key={i} className="border-t border-linelight dark:border-[#24352a]">
                    <td className="px-4 py-2.5 font-medium text-ink dark:text-[#e4ece5]">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[13px] text-fog dark:text-[#9bb0a0]">{p.qty}</td>
                    <td className="px-4 py-2.5 text-fog dark:text-[#9bb0a0]">{p.role}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[13px] text-ink dark:text-[#e4ece5]">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3 Wiring */}
        <section id="wiring" className="mt-10 scroll-mt-32">
          <SectionHead n="3" title="Wiring" blurb="Wire cold (power off), double-check 5V vs 3V3 rails, then power the board first." />
          {project.wiring.length > 1 && (
            <div className="print-hide mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Wiring variants">
              {project.wiring.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={wiring?.id === w.id}
                  onClick={() => setWireId(w.id)}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                    wiring?.id === w.id
                      ? 'border-leaf bg-leaf text-white'
                      : 'border-line bg-card text-ink hover:border-leaf dark:border-[#2f4234] dark:bg-moss dark:text-[#e4ece5]'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          )}
          <div className="print-hide">{wiring && <WiringDiagram board={wiring} />}</div>
          <div className="print-only">
            {project.wiring.map((w) => (
              <div key={w.id} className="mb-4">
                <h4 className="mb-2 font-bold">
                  {w.label} · {w.board}
                </h4>
                <WiringDiagram board={w} />
              </div>
            ))}
          </div>
        </section>

        {/* 4 Steps */}
        <section id="steps" className="mt-10 scroll-mt-32">
          <SectionHead n="4" title="Build steps" blurb="In order. Tick each one as you finish — progress saves automatically." />
          <StepsTracker slug={project.slug} steps={project.steps} />
        </section>

        {/* 5 Simulator */}
        <section id="simulator" className="mt-10 scroll-mt-32">
          <SectionHead n="5" title="Live logic simulator" blurb="The same rule as the firmware. Break it here, not on the breadboard." />
          <Simulator sim={project.simulator} />
        </section>

        {/* 6 Code */}
        <section id="code" className="mt-10 scroll-mt-32">
          <SectionHead n="6" title="Code" blurb="One sketch per version. Install the named libraries first, then paste and flash." />
          <CodeBlock variants={project.code} />
        </section>

        {/* 7 Datasheets */}
        <section id="sheets" className="mt-10 scroll-mt-32">
          <SectionHead n="7" title="Datasheets & docs" blurb="Read the two pages that matter: absolute maximums and the example circuit." />
          <SheetsList keys={project.sheets} />
        </section>

        {/* 8 Tips */}
        <section id="tips" className="mt-10 scroll-mt-32">
          <SectionHead n="8" title="Presentation tips" blurb="What examiners ask about this build." />
          <dl className="grid gap-3 sm:grid-cols-2">
            {project.tips.map((t) => (
              <div key={t.title} className="rounded-xl border border-line bg-card p-4 dark:border-[#2f4234] dark:bg-moss">
                <dt className="font-semibold text-ink dark:text-[#e4ece5]">{t.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">{t.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Prev / next */}
        <nav className="print-hide mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2 dark:border-[#24352a]" aria-label="More guides">
          {prev ? (
            <Link
              to={`/project/${prev.slug}`}
              className="group rounded-xl border border-line bg-card p-4 transition-colors hover:border-leaf dark:border-[#2f4234] dark:bg-moss"
            >
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-fog dark:text-[#9bb0a0]">
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="font-display mt-1 block font-bold text-ink group-hover:text-leaf dark:text-[#e4ece5]">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/project/${next.slug}`}
              className="group rounded-xl border border-line bg-card p-4 text-right transition-colors hover:border-leaf dark:border-[#2f4234] dark:bg-moss"
            >
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-fog dark:text-[#9bb0a0]">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="font-display mt-1 block font-bold text-ink group-hover:text-leaf dark:text-[#e4ece5]">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}
