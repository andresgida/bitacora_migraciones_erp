import { supabase } from '../supabase/client'
import type { IBitacoraRepository, BitacoraFilters, PaginationParams, PaginatedResult } from '@/domain/repositories/IBitacoraRepository'
import type { Bitacora, BitacoraCreate, BitacoraUpdate } from '@/domain/entities/Bitacora'

export class SupabaseBitacoraRepository implements IBitacoraRepository {
  private readonly table = 'bitacora'

  async getAll(
    filters?: BitacoraFilters,
    pagination?: PaginationParams,
    orderBy: keyof Bitacora = 'id',
    orderDir: 'asc' | 'desc' = 'desc',
  ): Promise<PaginatedResult<Bitacora>> {
    const page = pagination?.page ?? 1
    const pageSize = pagination?.pageSize ?? 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from(this.table).select('*', { count: 'exact' })

    if (filters?.search) {
      const isNumeric = /^\d+$/.test(filters.search.trim())
      if (isNumeric) {
        query = query.eq('id', Number(filters.search.trim()))
      } else {
        query = query.or(
          `nombre_empresa.ilike.%${filters.search}%,descripcion_error.ilike.%${filters.search}%,base_datos.ilike.%${filters.search}%`,
        )
      }
    }
    if (filters?.nombre_empresa) {
      query = query.eq('nombre_empresa', filters.nombre_empresa)
    }
    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    }
    if (filters?.prioridad_servicio) {
      query = query.eq('prioridad_servicio', filters.prioridad_servicio)
    }
    if (filters?.csm) {
      query = query.eq('csm', filters.csm)
    }
    if (filters?.lider_novedad) {
      query = query.eq('lider_novedad', filters.lider_novedad)
    }
    if (filters?.suite) {
      query = query.eq('suite', filters.suite)
    }
    if (filters?.modulo) {
      query = query.eq('modulo', filters.modulo)
    }
    if (filters?.solucionado !== undefined) {
      query = query.eq('solucionado', filters.solucionado)
    }
    if (filters?.estado_fds) {
      query = query.eq('estado_fds', filters.estado_fds)
    }
    if (filters?.fecha_desde) {
      query = query.gte('fecha_novedad', filters.fecha_desde)
    }
    if (filters?.fecha_hasta) {
      query = query.lte('fecha_novedad', filters.fecha_hasta)
    }

    query = query.order(orderBy as string, { ascending: orderDir === 'asc' }).range(from, to)

    const { data, error, count } = await query

    if (error) throw new Error(error.message)

    const total = count ?? 0
    return {
      data: (data as Bitacora[]) ?? [],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getById(id: number): Promise<Bitacora | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as Bitacora
  }

  async create(data: BitacoraCreate): Promise<Bitacora> {
    const { data: created, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return created as Bitacora
  }

  async update(id: number, data: BitacoraUpdate): Promise<Bitacora> {
    const { data: updated, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return updated as Bitacora
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async getDashboardMetrics() {
    const { data, error } = await supabase.from(this.table).select(
      'estado, prioridad_servicio, estado_fds, solucionado, segmentacion_fds, version_anterior, nombre_empresa',
    )

    if (error) throw new Error(error.message)

    const total = data?.length ?? 0
    const byEstadoEmpresas: Record<string, Set<string>> = {}
    const byPrioridad: Record<string, number> = {}
    const byEstadoFDS: Record<string, number> = {}
    const bySegmentacion: Record<string, number> = {}
    const byVersion: Record<string, number> = {}
    const allEmpresas = new Set<string>()
    let solucionados = 0
    let pendientes = 0

    for (const row of data ?? []) {
      if (row.estado) {
        if (!byEstadoEmpresas[row.estado]) byEstadoEmpresas[row.estado] = new Set()
        if (row.nombre_empresa) byEstadoEmpresas[row.estado].add(row.nombre_empresa)
      }
      if (row.nombre_empresa) allEmpresas.add(row.nombre_empresa)
      if (row.prioridad_servicio)
        byPrioridad[row.prioridad_servicio] = (byPrioridad[row.prioridad_servicio] ?? 0) + 1
      if (row.estado_fds) byEstadoFDS[row.estado_fds] = (byEstadoFDS[row.estado_fds] ?? 0) + 1
      if (row.segmentacion_fds) bySegmentacion[row.segmentacion_fds] = (bySegmentacion[row.segmentacion_fds] ?? 0) + 1
      if (row.version_anterior) byVersion[row.version_anterior] = (byVersion[row.version_anterior] ?? 0) + 1
      if (row.solucionado === 'Si') solucionados++
      else pendientes++
    }

    const byEstado: Record<string, number> = {}
    for (const [estado, set] of Object.entries(byEstadoEmpresas)) {
      byEstado[estado] = set.size
    }
    const totalEmpresas = Object.values(byEstado).reduce((a, b) => a + b, 0)
    const conSegmentacion = Object.values(bySegmentacion).reduce((a, b) => a + b, 0)

    return { total, totalEmpresas, byEstado, byPrioridad, byEstadoFDS, bySegmentacion, byVersion, solucionados, pendientes, conSegmentacion }
  }
}
