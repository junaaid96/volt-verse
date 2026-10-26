import { Suspense, lazy, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, BookOpenCheck, ExternalLink, FlaskConical, GraduationCap } from 'lucide-react'
import { projects } from '../data/projects'
import { categories } from '../data/categories'
import { datasheets } from '../data/datasheets'
import { HERO_BENCHES } from '../data/benches'
import { ProjectCard } from '../components/ProjectCard'
import { CategoryIcon } from '../components/CategoryIcon'
import { Reveal } from '../components/Reveal'

const HeroScene = lazy(() => import('../components/HeroScene').then((m) => ({ default: m.HeroScene })))

const stagger: Variants = { show: { transition: { staggerChildren: 0.08 } } }
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

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
  const liveTracks = categories.filter((c) => c.status === 'live').map((c) => c.name)
  const tracksInline = liveTracks.join(' + ')
  const [bench, setBench] = useState(HERO_BENCHES[0])

  return (
    <div>
      {/* Hero: copy on the left, the 3D bench is the star on the right */}
      <section className="hero-glow relative overflow-hidden border-b border-line dark:border-[#24352a]">
        <div className="labgrid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-16">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span
              variants={rise}
              className="inline-flex items-center gap-1.5 rounded-full border border-leaf/20 bg-palegreen px-3 py-1 text-xs font-semibold text-leaf dark:border-leafbright/20 dark:bg-moss dark:text-leafbright"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              University hardware lab · {tracksInline} live
            </motion.span>
            <motion.h1
              variants={rise}
              className="font-display mt-5 text-5xl font-bold leading-[0.95] tracking-tight text-ink text-balance sm:text-6xl xl:text-7xl dark:text-foam"
            >
              Build hardware that <span className="text-leaf dark:text-leafbright">actually works.</span>
            </motion.h1>
            <motion.p variants={rise} className="mt-5 max-w-md text-lg leading-relaxed text-fog dark:text-mist">
              {projects.length} complete {tracksInline} builds with real wiring, ordered steps, a live logic simulator and
              copy-paste code.
            </motion.p>
            <motion.div variants={rise} className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-1.5 rounded-xl bg-leaf px-5 py-3 font-semibold text-white shadow-[0_10px_24px_-12px_rgba(30,122,70,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#186a3c]"
              >
                Browse the {projects.length} guides
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('how')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-5 py-3 font-semibold text-ink transition-colors hover:bg-linelight dark:border-edge dark:bg-moss dark:text-foam dark:hover:bg-[#24352a]"
              >
                <BookOpenCheck className="h-4 w-4" /> How a guide works
              </button>
            </motion.div>
            <motion.dl
              variants={rise}
              className="mt-10 grid max-w-md grid-cols-4 divide-x divide-line overflow-hidden rounded-xl border border-line bg-card/70 backdrop-blur dark:divide-edge dark:border-edge dark:bg-moss/70"
            >
              {[
                [String(projects.length), 'guides'],
                [String(sketches), 'sketches'],
                [String(steps), 'steps'],
                [String(Object.keys(datasheets).length), 'sheets'],
              ].map(([n, label]) => (
                <div key={label} className="flex flex-col-reverse px-2 py-3 text-center">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-fog dark:text-mist">{label}</dt>
                  <dd className="font-mono text-2xl font-semibold tabular-nums text-ink dark:text-foam">{n}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="print-hide"
          >
            <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_30px_60px_-30px_rgba(20,40,28,0.45)] dark:border-edge dark:bg-moss">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5 dark:border-edge">
                <div role="group" aria-label="Choose a bench" className="flex flex-wrap items-center gap-1">
                  {HERO_BENCHES.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setBench(b)}
                      aria-pressed={bench.name === b.name}
                      title={`${b.name} — ${b.blurb}`}
                      className={
                        bench.name === b.name
                          ? 'rounded-full bg-pine px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-foam uppercase transition-colors dark:bg-foam dark:text-pine'
                          : 'rounded-full bg-linelight px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-fog uppercase transition-colors hover:bg-line hover:text-ink dark:bg-[#24352a] dark:text-mist dark:hover:bg-[#2f4234]'
                      }
                    >
                      {b.short}
                    </button>
                  ))}
                </div>
                <span className="hidden items-center gap-1.5 pr-1 text-xs text-fog sm:inline-flex dark:text-mist">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leafbright" aria-hidden="true" />
                  {bench.blurb}
                </span>
              </div>
              <Suspense fallback={<div className="labgrid h-[380px] w-full sm:h-[460px] lg:h-[540px]" />}>
                <HeroScene bench={bench} />
              </Suspense>
            </div>
            <p className="mt-3 text-center text-xs text-fog dark:text-mist">
              Drag to orbit (two fingers on touch). Zoom from the dock, or tap the bolt to watch current flow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* New to Arduino */}
      <section className="mx-auto max-w-7xl px-4 pt-8" aria-label="New to Arduino">
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
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink dark:text-foam">Start here</h2>
            <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">
              Proven builds, ordered by how often students finish them on time.
            </p>
          </div>
          <Link to="/projects" className="hidden shrink-0 text-sm font-semibold text-leaf hover:underline sm:block dark:text-leafbright">
            All guides →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06} className="h-full">
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <h2 className="font-display text-3xl font-bold text-ink dark:text-foam">Tracks</h2>
        <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">
          {liveTracks.join(' and ')} {liveTracks.length > 1 ? 'are' : 'is'} live today. The lab is
          structured so new tracks slot in without breaking anything.
        </p>
        <Reveal className="mt-5 overflow-hidden rounded-xl border border-line dark:border-[#2f4234]">
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
                  to={`/projects?track=${c.id}`}
                  className="hidden shrink-0 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-leaf hover:text-leaf sm:block dark:border-[#2f4234] dark:text-[#e4ece5]"
                >
                  Open →
                </Link>
              )}
            </div>
          ))}
        </Reveal>
      </section>

      {/* How a guide works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-12">
        <h2 className="font-display text-3xl font-bold text-ink dark:text-foam">How a guide works</h2>
        <p className="mt-1 text-sm text-fog dark:text-[#9bb0a0]">
          Same seven sections in every build, so the newest guide feels as familiar as the first.
        </p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map(([title, detail], i) => (
            <Reveal key={title} delay={(i % 4) * 0.05} className="h-full">
              <li className="flex h-full gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-leaf/50 dark:border-edge dark:bg-moss dark:hover:border-leafbright/40">
                <span className="font-mono text-sm font-semibold tabular-nums text-leaf dark:text-leafbright">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold leading-tight text-ink dark:text-foam">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fog dark:text-mist">{detail}</p>
                </div>
              </li>
            </Reveal>
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
