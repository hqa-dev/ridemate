const STORAGE_KEY = 'limo-theme'

export type ThemeMode = 'light' | 'dark'

export function getThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode)
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function initThemeMode() {
  const mode = localStorage.getItem(STORAGE_KEY)
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}
