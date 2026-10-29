import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from './hooks/theme'
import { BookmarksProvider } from './hooks/bookmarks'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Catalog } from './pages/Catalog'
import { ProjectDetail } from './pages/ProjectDetail'
import { NotFound } from './pages/NotFound'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <BookmarksProvider>
          <HashRouter>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col bg-paper text-ink dark:bg-pine dark:text-foam print:bg-white">
              <Navbar />
              <main className="flex-1 pb-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/projects" element={<Catalog />} />
                  <Route path="/project/:slug" element={<ProjectDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </HashRouter>
        </BookmarksProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}
