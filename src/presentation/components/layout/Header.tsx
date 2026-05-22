import { Moon, Sun, LogOut, User } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useUIStore } from '@/presentation/stores/uiStore'
import { cn } from '@/lib/utils'

export default function Header() {
  const { profile, signOut } = useAuth()
  const { darkMode, toggleDarkMode } = useUIStore()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Bitácora Migraciones 2026</h1>
          <p className="text-xs text-muted-foreground">Sistema de gestión de incidencias ERP</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {profile?.full_name ?? profile?.email ?? 'Usuario'}
            </p>
            <p
              className={cn(
                'text-xs mt-0.5',
                profile?.role === 'admin' ? 'text-primary font-medium' : 'text-muted-foreground',
              )}
            >
              {profile?.role === 'admin' ? 'Administrador' : 'Solo lectura'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            title="Cerrar sesión"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
