import { Link } from 'react-router-dom'
import { ArrowUpRight, CodeXml } from 'lucide-react'
import { categories } from '../data/categories'
import { datasheets } from '../data/datasheets'
import { Logo } from './Navbar'

export function Footer() {
  const docs = ['blynk-docs', 'thingspeak-docs', 'firebase-docs', 'arduino-uno']
    .map((k) => datasheets[k])
    .filter(Boolean)

  return (
    <footer className="print-hide mt-16 border-t border-line dark:border-mosslight">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo compact />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-fog dark:text-mist">
            Hands-on hardware guides for university students. Every build ships with versions, wiring,
            steps, a live simulator and code.
          </p>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-fog dark:text-mist">
            Progress, bookmarks and theme stay in your browser (localStorage) — no account needed.
          </p>
        </div>
        <nav aria-label="Tracks">
          <h3 className="font-display text-base font-bold text-ink dark:text-foam">Tracks</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                {c.status === 'live' ? (
                  <Link
                    to={`/projects?track=${c.id}`}
                    className="text-fog hover:text-leaf dark:text-mist dark:hover:text-leafbright"
                  >
                    {c.name} <span className="text-xs">(live)</span>
                  </Link>
                ) : (
                  <span className="text-fog dark:text-mist">
                    {c.name} <span className="text-xs">(coming soon)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="External docs">
          <h3 className="font-display text-base font-bold text-ink dark:text-foam">Platform docs</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {docs.map((d) => (
              <li key={d.key}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fog hover:text-leaf dark:text-mist dark:hover:text-leafbright"
                >
                  {d.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line dark:border-mosslight">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 text-xs text-fog sm:flex-row sm:justify-between dark:text-mist">
          <span className="text-center sm:text-left">VoltVerse · built for coursework and final-year projects</span>
          <a
              href="https://junaidul.pro.bd/codejborg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Developed by CodeJBorg — visit developer website"
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-3 font-mono text-[11px] tracking-wide text-fog transition-colors duration-300 hover:border-leaf hover:text-ink dark:border-edge dark:bg-moss dark:text-mist dark:hover:border-leafbright dark:hover:text-foam"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-leaf text-white">
                <CodeXml className="size-3.5" strokeWidth={2.25} />
              </span>
              <span>Developed by</span>
              <span className="font-semibold text-ink dark:text-foam">
                <span className="text-leaf dark:text-leafbright">&lt;</span>CodeJBorg
                <span className="text-leaf dark:text-leafbright"> /&gt;</span>
              </span>
              <ArrowUpRight className="size-3.5 opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </footer>
  )
}
