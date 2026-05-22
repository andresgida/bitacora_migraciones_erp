import { NavLink } from 'react-router-dom'
import { Zap, LayoutDashboard, BookOpen, Settings2, Settings, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bitacora', label: 'Bitácora', icon: BookOpen },
  { to: '/catalogos', label: 'Catálogos', icon: Settings2 },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="px-4 py-5 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-primary">Bitácora</h1>
            <p className="text-xs text-muted-foreground">ERP Migration 2026</p>
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
