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
      <section className="hero-glow relative overflow-hidden border-b border-line dark:border-mosslight">
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
                className="group inline-flex items-center gap-1.5 rounded-xl bg-leaf px-5 py-3 font-semibold text-white shadow-[0_10px_24px_-12px_rgba(30,122,70,0.8)] transition-all hover:-translate-y-0.5 hover:bg-leafdeep"
              >
                Browse the {projects.length} guides
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('how')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-5 py-3 font-semibold text-ink transition-colors hover:bg-linelight dark:border-edge dark:bg-moss dark:text-foam dark:hover:bg-mosslight"
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
                          : 'rounded-full bg-linelight px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-fog uppercase transition-colors hover:bg-line hover:text-ink dark:bg-mosslight dark:text-mist dark:hover:bg-edge'
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

      {/* Warm-up path for beginners */}
      <section className="mx-auto max-w-7xl px-4 pt-8" aria-label="Beginner warm-up path">
        <div className="flex items-start gap-3">
          <span className="shrink-0 rounded-lg bg-palegreen p-2.5 text-leaf dark:bg-fern dark:text-leafbright">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink dark:text-foam">
              New to hardware? Warm up first
            </h2>
            <p className="mt-0.5 max-w-3xl text-sm leading-relaxed text-fog dark:text-mist">
              Two free interactive sites where you wire circuits on a 3D board and watch the code
              run. Follow them in order — every guide below assumes you can blink an LED and read
              a sensor.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <a
            href="https://learn-arduino-red.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-line bg-card p-5 transition-colors hover:border-leaf/60 dark:border-edge dark:bg-moss dark:hover:border-leafbright/50"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-pine px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-foam uppercase dark:bg-foam dark:text-pine">
                Step 1 · Start here
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-fog transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-mist" />
            </div>
            <h3 className="font-display mt-3 text-2xl font-bold text-ink dark:text-foam">
              Learn Arduino
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-fog dark:text-mist">
              LEDs, buttons, sensors, motors and servos on a 3D Uno, with guided lessons and a
              built-in simulator. The fastest way to get ready for Uno-based guides.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-leafdeep">
              Open Learn Arduino
            </span>
          </a>
          <a
            href="https://learn-esp32.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-line bg-card p-5 transition-colors hover:border-signal/60 dark:border-edge dark:bg-moss dark:hover:border-signal/70"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-linelight px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-fog uppercase dark:bg-mosslight dark:text-mist">
                Step 2 · Go wireless
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-fog transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-mist" />
            </div>
            <h3 className="font-display mt-3 text-2xl font-bold text-ink dark:text-foam">
              Learn ESP32
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-fog dark:text-mist">
              Wi-Fi, Bluetooth and bigger IoT builds on the ESP32, with pinout and schematic
              reference. Do this after Arduino — or start here if your guide uses an ESP32 or
              NodeMCU board.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-signaldeep">
              Open Learn ESP32
            </span>
          </a>
        </div>
        <p className="mt-2.5 text-xs text-fog dark:text-mist">
          Both sites are free and open in a new tab · Made by Dilum Sanjaya
        </p>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink dark:text-foam">Start here</h2>
            <p className="mt-1 text-sm text-fog dark:text-mist">
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
        <p className="mt-1 text-sm text-fog dark:text-mist">
          {liveTracks.join(' and ')} {liveTracks.length > 1 ? 'are' : 'is'} live today. The lab is
          structured so new tracks slot in without breaking anything.
        </p>
        <Reveal className="mt-5 overflow-hidden rounded-xl border border-line dark:border-edge">
          {categories.map((c, i) => {
            const rowClass = `flex items-start gap-4 bg-card p-4 sm:items-center dark:bg-moss ${
              i > 0 ? 'border-t border-linelight dark:border-mosslight' : ''
            }`
            const content = (
              <>
                <span className="rounded-lg bg-palegreen p-2.5 text-leaf dark:bg-fern dark:text-leafbright">
                  <CategoryIcon icon={c.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-ink dark:text-foam">{c.name}</h3>
                    {c.status === 'live' ? (
                      <span className="rounded-full bg-palegreen px-2.5 py-0.5 text-xs font-bold text-leaf dark:bg-fern dark:text-leafbright">
                        LIVE · {projects.filter((p) => p.categoryId === c.id).length} guides
                      </span>
                    ) : (
                      <span className="rounded-full bg-linelight px-2.5 py-0.5 text-xs font-bold text-fog dark:bg-mosslight dark:text-mist">
                        SOON · {c.planned} planned
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-fog dark:text-mist">
                    <strong className="font-semibold">{c.tagline}.</strong> {c.description}
                  </p>
                </div>
                {c.status === 'live' && (
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink transition-colors group-hover:border-leaf group-hover:text-leaf sm:block dark:border-edge dark:text-foam"
                  >
                    Open →
                  </span>
                )}
              </>
            )
            return c.status === 'live' ? (
              <Link
                key={c.id}
                to={`/projects?track=${c.id}`}
                aria-label={`Open ${c.name} track`}
                className={`${rowClass} group transition-colors hover:bg-linelight/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-leaf dark:hover:bg-mosslight`}
              >
                {content}
              </Link>
            ) : (
              <div key={c.id} className={rowClass}>
                {content}
              </div>
            )
          })}
        </Reveal>
      </section>

      {/* How a guide works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-12">
        <h2 className="font-display text-3xl font-bold text-ink dark:text-foam">How a guide works</h2>
        <p className="mt-1 text-sm text-fog dark:text-mist">
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
        <div className="mt-8 rounded-xl bg-spruce p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Ready to pick a build?</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-sage">
                Browse all {projects.length} {tracksInline} guides — filter by track, board,
                and difficulty to find one that fits your semester.
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-leafbright px-5 py-2.5 font-semibold text-spruce transition-colors hover:bg-white"
            >
              Browse all guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
