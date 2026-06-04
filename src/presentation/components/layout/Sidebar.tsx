import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Settings2, Settings, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/presentation/stores/authStore'
import OfimaLogo from '@/presentation/components/common/OfimaLogo'

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/bitacora', label: 'Bitácora', icon: BookOpen, adminOnly: false },
  { to: '/catalogos', label: 'Catálogos', icon: Settings2, adminOnly: true },
]

export default function Sidebar() {
  const { isAdmin } = useAuthStore()
  const navItems = baseNavItems.filter(item => !item.adminOnly || isAdmin())

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="px-4 py-5 mb-2">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-lg bg-[#003A6A] px-2 py-1.5">
            <OfimaLogo className="h-8 max-w-[120px]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight text-primary">Bitácora</h1>
            <p className="text-xs text-muted-foreground">ERP Migración 2026</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-4 py-2.5 text-sm transition-all duration-150',
                isActive
                  ? 'border-l-4 border-primary bg-sidebar-accent text-sidebar-accent-foreground rounded-r-xl'
                  : 'rounded-lg text-secondary-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-border px-2 pb-4 pt-3 space-y-0.5">
        <a className="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Settings className="h-4 w-4 shrink-0" />
          <span>Configuración</span>
        </a>
        <a className="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span>Soporte</span>
        </a>
      </div>
    </aside>
  )
}
