import type { Bitacora, BitacoraCreate, BitacoraUpdate } from '../entities/Bitacora'

export interface BitacoraFilters {
  search?: string
  nombre_empresa?: string
  estado?: string
  estadoEmpty?: boolean
  prioridad_servicio?: string[]
  prioridadEmpty?: boolean
  csm?: string
  lider_novedad?: string
  suite?: string
  modulo?: string
  solucionado?: string
  solucionadoEmpty?: boolean
  estado_fds?: string
  estadoFdsEmpty?: boolean
  fecha_desde?: string
  fecha_hasta?: string
  fecha_robot_desde?: string
  fecha_robot_hasta?: string
  estado_incidencia?: string
  estadoIncidenciaEmpty?: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface IBitacoraRepository {
  getAll(
    filters?: BitacoraFilters,
    pagination?: PaginationParams,
    orderBy?: keyof Bitacora,
    orderDir?: 'asc' | 'desc',
  ): Promise<PaginatedResult<Bitacora>>

  getAllFiltered(
    filters?: BitacoraFilters,
    orderBy?: keyof Bitacora,
    orderDir?: 'asc' | 'desc',
  ): Promise<Bitacora[]>

  getById(id: number): Promise<Bitacora | null>

  create(data: BitacoraCreate): Promise<Bitacora>

  update(id: number, data: BitacoraUpdate): Promise<Bitacora>

  delete(id: number): Promise<void>

  getDashboardMetrics(): Promise<{
    total: number
    totalEmpresas: number
    byEstado: Record<string, number>
    byPrioridad: Record<string, number>
    byEstadoFDS: Record<string, number>
    bySegmentacion: Record<string, number>
    byVersion: Record<string, number>
    solucionados: number
    pendientes: number
    conSegmentacion: number
  }>
}
