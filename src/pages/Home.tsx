import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, ExternalLink, FlaskConical, GraduationCap } from 'lucide-react'
import { projects } from '../data/projects'
import { categories, getCategory } from '../data/categories'
import { datasheets } from '../data/datasheets'
import { ProjectCard } from '../components/ProjectCard'
import { CategoryIcon } from '../components/CategoryIcon'

const HeroScene = lazy(() => import('../components/HeroScene').then((m) => ({ default: m.HeroScene })))

const scrollTo = (id: string) => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

const HOW = [
  ['Pick a version', 'Basic, connected or cloud — choose the build that fits your weeks and budget.'],
  ['Gather parts', 'Priced bill of materials with what each part actually does.'],
  ['Wire it up', 'Pin-by-pin maps for every supported board, plus a visual wiring chart.'],
  ['Follow the steps', 'Ordered build steps with a checklist that saves your progress.'],
  ['Test the logic', 'A live simulator runs the same rule as the firmware before you flash.'],
  ['Flash the code', 'Copy-paste sketches per version, with the libraries named.'],
  ['Read the datasheets', 'Manufacturer PDFs and official docs for the key parts.'],
]

export function Home() {
  const featured = projects.filter((p) => p.featured)
  const sketches = projects.reduce((n, p) => n + p.code.length, 0)
  const steps = projects.reduce((n, p) => n + p.steps.length, 0)
  const iot = getCategory('iot')

  return (
    <div>
      {/* Hero: left-aligned text + 3D panel */}
      <section className="labgrid border-b border-line dark:border-[#24352a]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:py-14">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-palegreen px-3 py-1 text-xs font-semibold text-leaf dark:bg-moss dark:text-leafbright">
              <FlaskConical className="h-3.5 w-3.5" />
              University hardware lab · IoT track live
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-ink sm:text-5xl dark:text-[#e4ece5]">
              Build hardware that actually works.
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-fog dark:text-[#9bb0a0]">
              {iot?.description} Each guide takes you from parts to a demo-ready build with a
              simulator to test the logic first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#186a3c]"
              >
                Browse the 15 guides <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('how')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-linelight dark:border-[#2f4234] dark:bg-moss dark:text-[#e4ece5] dark:hover:bg-[#24352a]"
              >
                <BookOpenCheck className="h-4 w-4" /> How a guide works
              </button>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-4 gap-4 border-t border-line pt-4 text-center dark:border-[#24352a]">
              {[
                [String(projects.length), 'guides'],
                [String(sketches), 'sketches'],
                [String(steps), 'steps'],
                [String(Object.keys(datasheets).length), 'datasheets'],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-2xl font-bold text-ink dark:text-[#e4ece5]">{n}</dd>
                  <dd className="text-xs text-fog dark:text-[#9bb0a0]">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className="print-hide overflow-hidden rounded-2xl border border-line bg-card dark:border-[#2f4234] dark:bg-moss">
              <Suspense fallback={<div className="labgrid h-[300px] w-full md:h-[380px]" />}>
                <HeroScene />
              </Suspense>
            </div>
            <p className="mt-2 text-center text-xs text-fog dark:text-[#9bb0a0]">
              Drag to orbit — every guide has its own wired board below.
            </p>
          </div>
        </div>
      </section>

      {/* New to Arduino */}
      <section className="mx-auto max-w-6xl px-4 pt-8" aria-label="New to Arduino">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-card p-5 sm:flex-row sm:items-center dark:border-[#2f4234] dark:bg-moss">
          <div className="flex items-start gap-3">
            <span className="shrink-0 rounded-lg bg-palegreen p-2.5 text-leaf dark:bg-[#1f3626] dark:text-leafbright">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink dark:text-[#e4ece5]">
                New to Arduino? Warm up here first
              </h2>
              <p className="mt-0.5 max-w-2xl text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">
                Learn Arduino is a free beginner site where you wire LEDs, buttons, sensors, motors
                and servos on a 3D Uno and watch the code run. Do a few lessons first — every guide
                below assumes you can blink an LED. Made by Dilum Sanjaya.
              </p>
            </div>
          </div>
          <a
            href="https://learn-arduino-red.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-leaf px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#186a3c]"
          >
            Open Learn Arduino <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink dark:text-[#e4ece5]">Start here</h2>
            <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">
              Four proven builds, ordered by how often students finish them on time.
            </p>
          </div>
          <Link to="/projects" className="hidden shrink-0 text-sm font-semibold text-leaf hover:underline sm:block dark:text-leafbright">
            All guides →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="font-display text-2xl font-bold text-ink dark:text-[#e4ece5]">Tracks</h2>
        <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">
          IoT is live today. The lab is structured so new tracks slot in without breaking anything.
        </p>
        <div className="mt-5 overflow-hidden rounded-xl border border-line dark:border-[#2f4234]">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-start gap-4 bg-card p-4 sm:items-center dark:bg-moss ${
                i > 0 ? 'border-t border-linelight dark:border-[#24352a]' : ''
              }`}
            >
              <span className="rounded-lg bg-palegreen p-2.5 text-leaf dark:bg-[#1f3626] dark:text-leafbright">
                <CategoryIcon icon={c.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-ink dark:text-[#e4ece5]">{c.name}</h3>
                  {c.status === 'live' ? (
                    <span className="rounded-full bg-palegreen px-2.5 py-0.5 text-xs font-bold text-leaf dark:bg-[#1f3626] dark:text-leafbright">
                      LIVE · {projects.filter((p) => p.categoryId === c.id).length} guides
                    </span>
                  ) : (
                    <span className="rounded-full bg-linelight px-2.5 py-0.5 text-xs font-bold text-fog dark:bg-[#24352a] dark:text-[#9bb0a0]">
                      SOON · {c.planned} planned
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-fog dark:text-[#9bb0a0]">
                  <strong className="font-semibold">{c.tagline}.</strong> {c.description}
                </p>
              </div>
              {c.status === 'live' && (
                <Link
                  to="/projects"
                  className="hidden shrink-0 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-leaf hover:text-leaf sm:block dark:border-[#2f4234] dark:text-[#e4ece5]"
                >
                  Open →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How a guide works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12">
        <h2 className="font-display text-2xl font-bold text-ink dark:text-[#e4ece5]">How a guide works</h2>
        <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">
          Same seven sections in every build, so the fifteenth guide feels as familiar as the first.
        </p>
        <ol className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
          {HOW.map(([title, detail], i) => (
            <li key={title} className="flex gap-3">
              <span className="font-display text-2xl font-bold text-leaf/70 dark:text-leafbright/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-semibold text-ink dark:text-[#e4ece5]">{title}</h3>
                <p className="text-sm text-fog dark:text-[#9bb0a0]">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-xl bg-[#14231a] p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-xl font-bold text-white">New to all of this?</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#b9c8b6]">
                Start with Smart Agriculture — it has Basic, Wi-Fi and cloud versions, so you can
                begin offline and upgrade the same hardware as you learn.
              </p>
            </div>
            <Link
              to="/project/smart-agriculture"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-leafbright px-5 py-2.5 font-semibold text-[#14231a] transition-colors hover:bg-white"
            >
              Open the flagship guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
