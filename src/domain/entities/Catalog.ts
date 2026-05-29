export interface Catalog {
  id: number
  category: string
  value: string
  active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export type CatalogCreate = Omit<Catalog, 'id' | 'created_at' | 'updated_at'>
export type CatalogUpdate = Partial<CatalogCreate>

export const CATALOG_CATEGORIES: Record<string, string> = {
  empresa: 'Empresas',
  csm: 'CSM',
  lider_novedad: 'Líderes de Novedad',
  suite: 'Suite',
  modulo: 'Módulo',
  estado: 'Estado',
  prioridad: 'Prioridad servicio',
  estado_fds: 'Estado FDS',
  clasificacion: 'Clasificación',
  version_anterior: 'Versión Anterior',
  encargado_fds: 'Encargado FDS',
  segmentacion_fds: 'Segmentación FDS',
  impacto_fds: 'Impacto FDS',
  solucionado: 'Solucionado',
}
