import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Building2,
} from 'lucide-react'
import StatsCard from '@/presentation/components/dashboard/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { useDashboardMetrics } from '@/presentation/hooks/useDashboard'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner'
import { cn } from '@/lib/utils'
import { PRIORIDAD_COLORS, ESTADO_COLORS, ESTADO_FDS_COLORS } from '@/presentation/constants/options'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetrics()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const byEstado = metrics?.byEstado ?? {}
  const byPrioridad = metrics?.byPrioridad ?? {}
  const byEstadoFDS = metrics?.byEstadoFDS ?? {}

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general del proceso de migración
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total registros"
          value={metrics?.total ?? 0}
          subtitle="Incidencias registradas"
          icon={FileText}
          iconColor="text-primary"
        />
        <StatsCard
          title="Solucionados"
          value={metrics?.solucionados ?? 0}
          subtitle={`${metrics?.total ? Math.round(((metrics.solucionados ?? 0) / metrics.total) * 100) : 0}% del total`}
          icon={CheckCircle2}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pendientes"
          value={metrics?.pendientes ?? 0}
          subtitle="Sin resolver"
          icon={Clock}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Urgentes"
          value={byPrioridad['URGENTE'] ?? 0}
          subtitle="Requieren atención inmediata"
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byEstado).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(byEstado)
                .sort(([, a], [, b]) => b - a)
                .map(([estado, count]) => (
                  <div key={estado} className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        ESTADO_COLORS[estado] ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {estado}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{count}</span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byPrioridad).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(byPrioridad)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([prioridad, count]) => (
                  <div key={prioridad} className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                        PRIORIDAD_COLORS[prioridad] ?? 'bg-muted text-muted-foreground border-transparent',
                      )}
                    >
                      {prioridad}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{count}</span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Estado FDS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byEstadoFDS).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(byEstadoFDS)
                .sort(([, a], [, b]) => b - a)
                .map(([estado, count]) => (
                  <div key={estado} className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        ESTADO_FDS_COLORS[estado] ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {estado}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{count}</span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
