import type {
  EstadoType,
  PrioridadType,
  EstadoFDSType,
  SuiteType,
  ModuloType,
  ClasificacionType,
  VersionAnteriorType,
  CSMType,
  LiderNovedadType,
  EncargadoFDSType,
  SegmentacionFDSType,
  ImpactoFDSType,
} from '../value-objects/enums'

export interface Bitacora {
  id: number
  fecha_novedad: string | null
  fecha_definiciones: string | null
  nombre_empresa: string
  estado: EstadoType | null
  base_datos: string | null
  csm: CSMType | null
  lider_novedad: LiderNovedadType | null
  suite: SuiteType | null
  modulo: ModuloType | null
  clasificacion: ClasificacionType | null
  version_anterior: VersionAnteriorType | null
  descripcion_error: string | null
  imagen_1_url: string | null
  imagen_2_url: string | null
  link_video: string | null
  prioridad_servicio: PrioridadType | null
  solucionado: boolean
  observacion_formacion: string | null
  fecha_tentativa_solucion: string | null
  estado_fds: EstadoFDSType | null
  observaciones_fds: string | null
  encargado_fds: EncargadoFDSType | null
  azure_url: string | null
  segmentacion_fds: SegmentacionFDSType | null
  impacto_fds: ImpactoFDSType | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export type BitacoraCreate = Omit<Bitacora, 'id' | 'created_at' | 'updated_at'>
export type BitacoraUpdate = Partial<BitacoraCreate>
