import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Bookmark, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '../hooks/theme'
import { useBookmarks } from '../hooks/bookmarks'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="7" className="fill-[#14231a] dark:fill-leafbright" />
        <path d="M18.5 4 7 18.2h6.6L13.5 28 25 13.4h-6.9L18.5 4z" className="fill-leafbright dark:fill-[#14231a]" />
        <circle cx="23.5" cy="7.5" r="2" className="fill-amberbright" />
      </svg>
      <span className="font-display text-xl font-bold text-ink dark:text-[#e4ece5]">
        VoltVerse {!compact && <span className="text-sm font-normal text-fog dark:text-[#9bb0a0]">lab</span>}
      </span>
    </Link>
  )
}

const cls = (active: boolean) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? 'bg-palegreen text-leaf dark:bg-moss dark:text-leafbright'
      : 'text-ink hover:bg-linelight dark:text-[#e4ece5] dark:hover:bg-moss'
  }`

const linkCls = ({ isActive }: { isActive: boolean }) => cls(isActive)

export function Navbar() {
  const { theme, toggle } = useTheme()
  const { saved } = useBookmarks()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  // Guides and Saved share the /projects path, so highlight manually from the URL.
  const onSaved =
    location.pathname === '/projects' &&
    new URLSearchParams(location.search).get('saved') === '1'
  const onGuides = location.pathname === '/projects' && !onSaved

  return (
    <header className="print-hide sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur dark:border-[#24352a] dark:bg-pine/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <NavLink to="/" end className={linkCls}>
            Home
          </NavLink>
          <Link to="/projects" className={cls(onGuides)} aria-current={onGuides ? 'page' : undefined}>
            Guides
          </Link>
          <Link
            to="/projects?saved=1"
            className={cls(onSaved)}
            aria-current={onSaved ? 'page' : undefined}
          >
            <span className="inline-flex items-center gap-1.5">
              <Bookmark className="h-4 w-4" />
              Saved{saved.length > 0 && <span className="text-xs font-bold">({saved.length})</span>}
            </span>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg border border-line p-2 text-ink transition-colors hover:bg-linelight dark:border-[#2f4234] dark:text-[#e4ece5] dark:hover:bg-moss"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/projects"
            className="hidden rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#186a3c] md:block"
          >
            Browse guides
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="rounded-lg border border-line p-2 text-ink md:hidden dark:border-[#2f4234] dark:text-[#e4ece5]"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line px-4 py-3 md:hidden dark:border-[#24352a]" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end className={linkCls} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <Link
              to="/projects"
              className={cls(onGuides)}
              aria-current={onGuides ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              Guides
            </Link>
            <Link
              to="/projects?saved=1"
              className={cls(onSaved)}
              aria-current={onSaved ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              Saved ({saved.length})
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
