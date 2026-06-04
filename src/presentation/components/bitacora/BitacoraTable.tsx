import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  Eye,
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import MultiSelectFilter from '@/presentation/components/common/MultiSelectFilter'
import FilterField from '@/presentation/components/common/FilterField'
import { cn, formatDate, getEstadoIncidencia } from '@/lib/utils'
import {
  PRIORIDAD_COLORS,
  ESTADO_COLORS,
  ESTADO_FDS_COLORS,
  ESTADO_INCIDENCIA_COLORS,
} from '@/presentation/constants/options'
import type { Bitacora } from '@/domain/entities/Bitacora'
import {
  EstadoValues,
  PrioridadValues,
  EstadoFDSValues,
  SolucionadoValues,
} from '@/domain/value-objects/enums'

interface BitacoraTableProps {
  data: Bitacora[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  isLoading: boolean
  isAdmin: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (record: Bitacora) => void
  onDelete: (id: number) => void
  onView: (record: Bitacora) => void
  onNew: () => void
  filterEstado: string
  filterPrioridad: string[]
  filterEstadoFDS: string
  filterSolucionado: string
  filterFechaDesde: string
  filterFechaHasta: string
  filterFechaRobotDesde: string
  filterFechaRobotHasta: string
  search: string
  onFilterEstado: (v: string) => void
  onFilterPrioridad: (v: string[]) => void
  onFilterEstadoFDS: (v: string) => void
  onFilterSolucionado: (v: string) => void
  onFilterFechaDesde: (v: string) => void
  onFilterFechaHasta: (v: string) => void
  onFilterFechaRobotDesde: (v: string) => void
  onFilterFechaRobotHasta: (v: string) => void
  onSearch: (v: string) => void
}

function PriorityBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        PRIORIDAD_COLORS[value] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {value}
    </span>
  )
}

function EstadoBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        ESTADO_COLORS[value] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {value}
    </span>
  )
}

function EstadoIncidenciaBadge({
  fechaRobotOficial,
  solucionado,
}: {
  fechaRobotOficial: string | null
  solucionado: string | null
}) {
  const estado = getEstadoIncidencia(fechaRobotOficial, solucionado)
  if (!estado) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        ESTADO_INCIDENCIA_COLORS[estado] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {estado}
    </span>
  )
}

const selectFilterTriggerClass =
  'h-8 min-w-[6.5rem] border-0 bg-transparent px-1 text-xs shadow-none focus:ring-0 focus:ring-offset-0 text-secondary-foreground'

export default function BitacoraTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  isLoading,
  isAdmin,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  onNew,
  filterEstado,
  filterPrioridad,
  filterEstadoFDS,
  filterSolucionado,
  filterFechaDesde,
  filterFechaHasta,
  filterFechaRobotDesde,
  filterFechaRobotHasta,
  search,
  onFilterEstado,
  onFilterPrioridad,
  onFilterEstadoFDS,
  onFilterSolucionado,
  onFilterFechaDesde,
  onFilterFechaHasta,
  onFilterFechaRobotDesde,
  onFilterFechaRobotHasta,
  onSearch,
}: BitacoraTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Bitacora>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        size: 60,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'fecha_novedad',
        header: 'Fecha novedad',
        size: 110,
        cell: ({ row }) => (
          <span className="text-xs text-secondary-foreground">{formatDate(row.original.fecha_novedad)}</span>
        ),
      },
      {
        accessorKey: 'nombre_empresa',
        header: 'Empresa',
        size: 180,
        cell: ({ row }) => (
          <span className="font-semibold text-sm text-foreground">{row.original.nombre_empresa}</span>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 110,
        cell: ({ row }) => <EstadoBadge value={row.original.estado} />,
      },
      {
        accessorKey: 'prioridad_servicio',
        header: 'Prioridad',
        size: 160,
        cell: ({ row }) => <PriorityBadge value={row.original.prioridad_servicio} />,
      },
      {
        accessorKey: 'suite',
        header: 'Suite',
        size: 100,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.suite ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'modulo',
        header: 'Módulo',
        size: 110,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.modulo ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'csm',
        header: 'CSM',
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.csm ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'lider_novedad',
        header: 'Líder',
        size: 120,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.lider_novedad ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'estado_fds',
        header: 'Estado FDS',
        size: 110,
        cell: ({ row }) => {
          const v = row.original.estado_fds
          if (!v) return <span className="text-muted-foreground text-xs">—</span>
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                ESTADO_FDS_COLORS[v] ?? 'bg-muted text-muted-foreground',
              )}
            >
              {v}
            </span>
          )
        },
      },
      {
        accessorKey: 'fecha_tentativa_solucion',
        header: 'Fecha Robot Oficial',
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs text-secondary-foreground">
            {formatDate(row.original.fecha_tentativa_solucion)}
          </span>
        ),
      },
      {
        accessorKey: 'solucionado',
        header: 'Solucionado',
        size: 100,
        cell: ({ row }) => {
          const val = row.original.solucionado
          const isPositive = val === 'Si'
          const isNegative = val === 'No' || !val
          return (
            <Badge
              variant={isPositive ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isPositive && 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
                isNegative && 'bg-secondary text-muted-foreground',
                !isPositive && !isNegative && 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
              )}
            >
              {val ?? 'No'}
            </Badge>
          )
        },
      },
      {
        id: 'estado_incidencias',
        header: 'Estado de incidencias',
        size: 140,
        cell: ({ row }) => (
          <EstadoIncidenciaBadge
            fechaRobotOficial={row.original.fecha_tentativa_solucion}
            solucionado={row.original.solucionado}
          />
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha registro',
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => onView(row.original)}
              title="Ver detalle"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(row.original)}
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el registro{' '}
                        <strong>#{row.original.id}</strong> de{' '}
                        <strong>{row.original.nombre_empresa}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(row.original.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        ),
      },
    ],
    [isAdmin, onView, onEdit, onDelete],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  function exportToExcel() {
    const rows = data.map((r) => ({
      ID: r.id,
      'Fecha Novedad': r.fecha_novedad ?? '',
      'Fecha Definiciones': r.fecha_definiciones ?? '',
      Empresa: r.nombre_empresa,
      Estado: r.estado ?? '',
      'Base de Datos': r.base_datos ?? '',
      CSM: r.csm ?? '',
      'Líder Novedad': r.lider_novedad ?? '',
      Suite: r.suite ?? '',
      Módulo: r.modulo ?? '',
      Clasificación: r.clasificacion ?? '',
      Proceso: r.version_anterior ?? '',
      'Descripción Error': r.descripcion_error ?? '',
      'Link Video': r.link_video ?? '',
      Prioridad: r.prioridad_servicio ?? '',
      Solucionado: r.solucionado ?? 'No',
      'Estado de incidencias':
        getEstadoIncidencia(r.fecha_tentativa_solucion, r.solucionado) ?? '',
      'Estado FDS': r.estado_fds ?? '',
      'Encargado FDS': r.encargado_fds ?? '',
      'Segmentación FDS': r.segmentacion_fds ?? '',
      'Impacto FDS': r.impacto_fds ?? '',
      'Azure URL': r.azure_url ?? '',
      'Fecha Robot Oficial': r.fecha_tentativa_solucion ?? '',
      'Fecha robot beta': r.fecha_robot_beta ?? '',
      'Observaciones FDS': r.observaciones_fds ?? '',
      Creado: r.created_at,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bitácora')
    XLSX.writeFile(wb, `bitacora_migraciones_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por #, empresa, descripción..."
              className="pl-9 border-border bg-popover text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30 focus-visible:border-primary"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <FilterField label="Estado">
            <Select value={filterEstado} onValueChange={onFilterEstado}>
              <SelectTrigger className={selectFilterTriggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todos los estados</SelectItem>
                <SelectItem value="__EMPTY__">Estado no configurado</SelectItem>
                {EstadoValues.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <MultiSelectFilter
            label="Prioridad"
            placeholder="Todas"
            selected={filterPrioridad}
            onChange={onFilterPrioridad}
            emptyOption={{ value: '__EMPTY__', label: 'Estado no configurado' }}
            options={PrioridadValues.map((v) => ({ value: v, label: v }))}
          />

          <FilterField label="Estado FDS">
            <Select value={filterEstadoFDS} onValueChange={onFilterEstadoFDS}>
              <SelectTrigger className={selectFilterTriggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todo FDS</SelectItem>
                <SelectItem value="__EMPTY__">Estado no configurado</SelectItem>
                {EstadoFDSValues.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Solucionado">
            <Select value={filterSolucionado} onValueChange={onFilterSolucionado}>
              <SelectTrigger className={selectFilterTriggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todo solucionado</SelectItem>
                <SelectItem value="__EMPTY__">Estado no configurado</SelectItem>
                {SolucionadoValues.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Fecha novedad">
            <Input
              type="date"
              aria-label="Fecha novedad desde"
              value={filterFechaDesde}
              max={filterFechaHasta || undefined}
              onChange={(e) => onFilterFechaDesde(e.target.value)}
              className="h-8 w-[130px] border-0 bg-transparent px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <span className="text-xs text-muted-foreground">—</span>
            <Input
              type="date"
              aria-label="Fecha novedad hasta"
              value={filterFechaHasta}
              min={filterFechaDesde || undefined}
              onChange={(e) => onFilterFechaHasta(e.target.value)}
              className="h-8 w-[130px] border-0 bg-transparent px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {(filterFechaDesde || filterFechaHasta) && (
              <button
                type="button"
                aria-label="Limpiar filtro de fecha novedad"
                onClick={() => {
                  onFilterFechaDesde('')
                  onFilterFechaHasta('')
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </FilterField>

          <FilterField label="F. Robot Oficial">
            <Input
              type="date"
              aria-label="Fecha Robot Oficial desde"
              value={filterFechaRobotDesde}
              max={filterFechaRobotHasta || undefined}
              onChange={(e) => onFilterFechaRobotDesde(e.target.value)}
              className="h-8 w-[130px] border-0 bg-transparent px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <span className="text-xs text-muted-foreground">—</span>
            <Input
              type="date"
              aria-label="Fecha Robot Oficial hasta"
              value={filterFechaRobotHasta}
              min={filterFechaRobotDesde || undefined}
              onChange={(e) => onFilterFechaRobotHasta(e.target.value)}
              className="h-8 w-[130px] border-0 bg-transparent px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {(filterFechaRobotDesde || filterFechaRobotHasta) && (
              <button
                type="button"
                aria-label="Limpiar filtro de Fecha Robot Oficial"
                onClick={() => {
                  onFilterFechaRobotDesde('')
                  onFilterFechaRobotHasta('')
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </FilterField>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="gap-2 border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              onClick={onNew}
              className="gap-2 bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Nueva incidencia
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-secondary/50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className={cn(
                            'flex items-center gap-1 hover:text-foreground transition-colors',
                            header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <>
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3 opacity-40" />
                              )}
                            </>
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                      Cargando registros...
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-12 text-center text-muted-foreground">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-border/30 transition-colors hover:bg-secondary cursor-pointer"
                    onDoubleClick={() => onView(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {total === 0 ? '0' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}`} de {total}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border bg-secondary text-secondary-foreground hover:bg-accent"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm text-secondary-foreground">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border bg-secondary text-secondary-foreground hover:bg-accent"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
