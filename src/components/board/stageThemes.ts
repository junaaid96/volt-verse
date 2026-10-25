import type { MatPalette } from './textures'

export interface StageTheme {
  background: string
  mat: MatPalette
}

export const STAGE_THEMES: Record<'light' | 'dark', StageTheme> = {
  light: {
    background: '#e9eee6',
    mat: { base: '#cfdccb', minor: 'rgba(30,70,45,0.16)', major: 'rgba(30,70,45,0.32)' },
  },
  dark: {
    background: '#0c140f',
    mat: { base: '#173022', minor: 'rgba(140,220,170,0.10)', major: 'rgba(140,220,170,0.22)' },
  },
}
