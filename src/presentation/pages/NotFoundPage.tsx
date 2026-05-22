import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="text-lg font-medium text-foreground">Página no encontrada</p>
        <p className="text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard" className="gap-2">
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  )
}
