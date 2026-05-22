import { create } from 'zustand'

const DARK_MODE_KEY = 'bitacora-dark-mode'

function initDarkMode(): boolean {
  const stored = localStorage.getItem(DARK_MODE_KEY)
  const isDark = stored === 'true'
  if (isDark) document.documentElement.classList.add('dark')
  return isDark
}

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: initDarkMode(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
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
