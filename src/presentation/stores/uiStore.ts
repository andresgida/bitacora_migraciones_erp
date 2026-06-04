import { create } from 'zustand'

const DARK_MODE_KEY = 'bitacora-dark-mode'
const SIDEBAR_OPEN_KEY = 'bitacora-sidebar-open'

function initDarkMode(): boolean {
  const stored = localStorage.getItem(DARK_MODE_KEY)
  const isDark = stored === 'true'
  if (isDark) document.documentElement.classList.add('dark')
  return isDark
}

function initSidebarOpen(): boolean {
  const stored = localStorage.getItem(SIDEBAR_OPEN_KEY)
  return stored === null ? true : stored === 'true'
}

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: initSidebarOpen(),
  darkMode: initDarkMode(),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarOpen
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(next))
      return { sidebarOpen: next }
    }),
  setSidebarOpen: (open) => {
    localStorage.setItem(SIDEBAR_OPEN_KEY, String(open))
    set({ sidebarOpen: open })
  },
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem(DARK_MODE_KEY, String(next))
      return { darkMode: next }
    }),
}))
