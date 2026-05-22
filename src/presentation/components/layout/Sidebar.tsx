import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/presentation/stores/uiStore'
import { ScrollArea } from '../ui/scroll-area'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bitacora', label: 'Bitácora', icon: BookOpen },
  { to: '/catalogos', label: 'Catálogos', icon: Settings2 },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r transition-all duration-300 ease-in-out',
        'bg-sidebar text-sidebar-foreground border-sidebar-border',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          sidebarOpen ? 'justify-between' : 'justify-center',
        )}
      >
        {sidebarOpen && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">Bitácora</p>
              <p className="truncate text-xs text-sidebar-foreground/60">Migraciones 2026</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
            !sidebarOpen && 'absolute -right-3 top-5 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-sm',
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70',
                  !sidebarOpen && 'justify-center px-2',
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
