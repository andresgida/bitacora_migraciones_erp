export const EstadoValues = ['En pruebas', 'En vivo', 'Suspendido', 'Sin iniciar'] as const
export type EstadoType = (typeof EstadoValues)[number]

export const PrioridadValues = [
  'URGENTE',
  'ALTA',
  'MEDIA',
  'BAJA',
  'REVISION FORMACION',
  'SOLUCIONADO',
  'DEVOLUCION DE FDS',
  'DEVOLUCION DE SERVICIOS',
  'REVISIÓN CSM-CLIENTE',
] as const
export type PrioridadType = (typeof PrioridadValues)[number]

export const EstadoFDSValues = ['Solucionado', 'Pendiente', 'En proceso'] as const
export type EstadoFDSType = (typeof EstadoFDSValues)[number]

export const SuiteValues = ['Comercial', 'Contable', 'Nómina', 'Técnico', 'Producción', 'App'] as const
export type SuiteType = (typeof SuiteValues)[number]

export const ModuloValues = [
  'Ventas',
  'Compras',
  'Inventario',
  'Tecnico',
  'Recaudo',
  'Pagos',
  'Contabilidad',
  'Bancos',
  'Activos Fijos',
  'Nómina',
  'Planilla Única',
  'Manufactura',
  'Costos Estandar',
  'Costos Reales',
  'Importaciones',
  'Talleres',
  'Mantenimiento',
  'Gestión Humana',
] as const
export type ModuloType = (typeof ModuloValues)[number]

export const ClasificacionValues = ['Estandar', 'Especifico'] as const
export type ClasificacionType = (typeof ClasificacionValues)[number]

export const VersionAnteriorValues = ['2023', '2024', '2025', '2026'] as const
export type VersionAnteriorType = (typeof VersionAnteriorValues)[number]

export const CSMValues = [
  'Adriana Cárdenas',
  'Javier Cano',
  'Sofia Mora',
  'Pedro Castro',
  'Ociel Espinosa',
  'Natalia Echavarria',
  'Olga Tangarife',
  'Anibal Angulo',
  'Katherine Nieto',
  'Martha Martin',
  'Gustavo Betancur',
  'Johana Cabaleda',
  'Laura Mogonllón',
  'Jonathan',
  'Claudia Restrepo',
  'Carlos Mancipe',
  'Carolina Rozo',
  'Mesa de Soporte',
] as const
export type CSMType = (typeof CSMValues)[number]

export const LiderNovedadValues = [
  'Ana Alvarez',
  'Alejandra Marin',
  'Julian Munera',
  'Patricia Perez',
] as const
export type LiderNovedadType = (typeof LiderNovedadValues)[number]

export const EncargadoFDSValues = ['Guillermo', 'Diana', 'Hernan', 'German', 'Natali'] as const
export type EncargadoFDSType = (typeof EncargadoFDSValues)[number]

export const SegmentacionFDSValues = [
  'Cambios Enterprise',
  'Robot',
  'Pruebas',
  'Específicos',
  'Mejoras de migración',
  'Instalación inicial',
  'Configuración',
] as const
export type SegmentacionFDSType = (typeof SegmentacionFDSValues)[number]

export const ImpactoFDSValues = ['Critico', 'Alto', 'Medio', 'Bajo'] as const
export type ImpactoFDSType = (typeof ImpactoFDSValues)[number]

export const UserRoleValues = ['admin', 'readonly'] as const
export type UserRoleType = (typeof UserRoleValues)[number]
