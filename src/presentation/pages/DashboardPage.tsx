import {
  FileText,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  Building2,
  Tag,
  Layers,
} from 'lucide-react'
import StatsCard from '@/presentation/components/dashboard/StatsCard'
import { useDashboardMetrics } from '@/presentation/hooks/useDashboard'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner'
import { cn } from '@/lib/utils'
import { PRIORIDAD_COLORS, ESTADO_COLORS, ESTADO_FDS_COLORS, SEGMENTACION_COLORS } from '@/presentation/constants/options'

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

      <div className="grid gap-4 sm:grid-cols-3">
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
          percent={metrics?.total ? Math.round(((metrics.solucionados ?? 0) / metrics.total) * 100) : 0}
          percentColor="bg-green-500"
          icon={CheckCircle2}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pendientes"
          value={metrics?.pendientes ?? 0}
          percent={metrics?.total ? Math.round(((metrics.pendientes ?? 0) / metrics.total) * 100) : 0}
          percentColor="bg-orange-500"
          icon={Clock}
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Por Estado */}
        <div className="rounded-xl border border-border bg-popover p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Estado Cliente
            </span>
            <span className="text-xs font-normal text-muted-foreground">{metrics?.totalEmpresas ?? 0} empresas</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(byEstado).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(byEstado)
                .sort(([, a], [, b]) => b - a)
                .map(([estado, count]) => (
                  <div key={estado} className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        ESTADO_COLORS[estado] ?? 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {estado}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${((count / (metrics?.totalEmpresas ?? 1)) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                      <span className="text-xs font-bold tabular-nums w-10 text-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{((count / (metrics?.totalEmpresas ?? 1)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Por Prioridad */}
        <div className="rounded-xl border border-border bg-popover p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Prioridad Servicio
          </h3>
          <div className="space-y-3">
            {Object.entries(byPrioridad).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(byPrioridad)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([prioridad, count]) => (
                  <div key={prioridad} className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                        PRIORIDAD_COLORS[prioridad] ?? 'border-border bg-secondary text-muted-foreground',
                      )}
                    >
                      {prioridad}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                      <span className="text-xs font-bold tabular-nums w-10 text-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Estado FDS */}
        <div className="rounded-xl border border-border bg-popover p-5 lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Estado FDS
          </h3>
          <div className="space-y-3">
            {Object.entries(byEstadoFDS).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(byEstadoFDS)
                .sort(([, a], [, b]) => b - a)
                .map(([estado, count]) => (
                  <div key={estado} className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        ESTADO_FDS_COLORS[estado] ?? 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {estado}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                      <span className="text-xs font-bold tabular-nums w-10 text-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Versión */}
        <div className="rounded-xl border border-border bg-popover p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            Versión
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics?.byVersion ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(metrics?.byVersion ?? {})
                .sort(([, a], [, b]) => b - a)
                .map(([version, count]) => (
                  <div key={version} className="flex items-center justify-between gap-3">
                    <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                      {version}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                      <span className="text-xs font-bold tabular-nums w-10 text-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Segmentación FDS */}
        <div className="rounded-xl border border-border bg-popover p-5 lg:col-span-2 xl:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            Segmentación FDS
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics?.bySegmentacion ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              Object.entries(metrics?.bySegmentacion ?? {})
                .sort(([, a], [, b]) => b - a)
                .map(([segmentacion, count]) => (
                  <div key={segmentacion} className="flex items-center justify-between gap-3">
                    <span className={cn(
                        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        SEGMENTACION_COLORS[segmentacion] ?? 'bg-secondary text-foreground',
                      )}>
                      {segmentacion}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                      <span className="text-xs font-bold tabular-nums w-10 text-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{((count / (metrics?.total ?? 1)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
