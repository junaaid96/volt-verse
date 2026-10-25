import { useEffect } from 'react'

/** Sets the tab title (also the default "Save as PDF" file name) while mounted. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
