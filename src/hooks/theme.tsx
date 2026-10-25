import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

function initialTheme(): Theme {
  try {
    const raw = localStorage.getItem('vv-theme')
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (parsed === 'light' || parsed === 'dark') return parsed
      } catch {
        if (raw === 'light' || raw === 'dark') return raw
      }
    }
  } catch {
    /* ignore */
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('vv-theme', JSON.stringify(theme))
    } catch {
      /* ignore */
    }
  }, [theme])

  // Print/PDF always renders the light theme for readable paper output.
  useEffect(() => {
    const before = () => document.documentElement.classList.remove('dark')
    const after = () => document.documentElement.classList.toggle('dark', theme === 'dark')
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
