import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Settings2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useUIStore } from '@/presentation/stores/uiStore'
import OfimaLogo from '@/presentation/components/common/OfimaLogo'

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/bitacora', label: 'Bitácora', icon: BookOpen, adminOnly: false },
  { to: '/catalogos', label: 'Catálogos', icon: Settings2, adminOnly: true },
]

export default function Sidebar() {
  const { isAdmin } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const navItems = baseNavItems.filter((item) => !item.adminOnly || isAdmin())

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-[4.5rem]',
      )}
    >
      {/* Logo */}
      <div className={cn('mb-2 py-5', sidebarOpen ? 'px-4' : 'px-2')}>
        <div className={cn('flex items-center', sidebarOpen ? 'gap-3' : 'justify-center')}>
          <div className="shrink-0 rounded-lg bg-[#003A6A] px-2 py-1.5">
            <OfimaLogo className={cn(sidebarOpen ? 'h-8 max-w-[120px]' : 'h-7 max-w-[2rem]')} />
          </div>
          {sidebarOpen && (
            <div className="min-w-0 overflow-hidden">
              <h1 className="text-base font-bold leading-tight text-primary truncate">Bitácora</h1>
              <p className="text-xs text-muted-foreground truncate">ERP Migración 2026</p>
            </div>
          )}
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center text-sm transition-all duration-150',
                sidebarOpen ? 'gap-4 px-4 py-2.5' : 'justify-center px-2 py-2.5',
                isActive
                  ? cn(
                      'bg-sidebar-accent text-sidebar-accent-foreground',
                      sidebarOpen
                        ? 'border-l-4 border-primary rounded-r-xl'
                        : 'rounded-lg border-l-0',
                    )
                  : 'rounded-lg text-secondary-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-border px-2 pb-3 pt-3 space-y-0.5">
        <a
          title={!sidebarOpen ? 'Configuración' : undefined}
          className={cn(
            'flex items-center rounded-lg text-sm text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground',
            sidebarOpen ? 'gap-4 px-4 py-2.5' : 'justify-center px-2 py-2.5',
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Configuración</span>}
        </a>
        <a
          title={!sidebarOpen ? 'Soporte' : undefined}
          className={cn(
            'flex items-center rounded-lg text-sm text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground',
            sidebarOpen ? 'gap-4 px-4 py-2.5' : 'justify-center px-2 py-2.5',
          )}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Soporte</span>}
        </a>

        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
          className={cn(
            'mt-1 flex w-full items-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
            sidebarOpen ? 'gap-4 px-4 py-2.5' : 'justify-center px-2 py-2.5',
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Contraer</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  )
}
