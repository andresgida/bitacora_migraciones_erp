import { Moon, Sun, Bell, Search, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useUIStore } from '@/presentation/stores/uiStore'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/bitacora': 'Bitácora',
  '/catalogos': 'Catálogos',
}

export default function Header() {
  const { profile, signOut } = useAuth()
  const { darkMode, toggleDarkMode } = useUIStore()
  const { pathname } = useLocation()

  const routeLabel = ROUTE_LABELS[pathname] ?? 'Inicio'
  const initials = (profile?.full_name ?? profile?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Bitácora</span>
        <span className="text-border">/</span>
        <span className="font-semibold text-primary border-b-2 border-primary pb-0.5">{routeLabel}</span>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-popover px-4 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Buscar..."
            className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 border-l border-border pl-5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground">
              {profile?.email ?? 'Usuario'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {profile?.role === 'admin' ? 'Administrador' : 'Solo lectura'}
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-accent bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <button
            onClick={signOut}
            title="Cerrar sesión"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
