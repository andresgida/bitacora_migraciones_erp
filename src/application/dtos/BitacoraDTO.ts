import { z } from 'zod'
import { SolucionadoValues } from '@/domain/value-objects/enums'

/** Los selects envían '' cuando no hay valor; normalizar a null antes de validar. */
const emptyToNull = (v: unknown) => (v === '' ? null : v)

const optionalString = z.preprocess(emptyToNull, z.string().nullable().optional())

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToNull, z.enum(values).nullable().optional())

export const BitacoraFormSchema = z.object({
  fecha_novedad: z.preprocess(emptyToNull, z.string().nullable().optional()),
  fecha_definiciones: z.preprocess(emptyToNull, z.string().nullable().optional()),
  nombre_empresa: z.string().min(1, 'La empresa es requerida'),
  estado: optionalString,
  base_datos: optionalString,
  csm: optionalString,
  lider_novedad: optionalString,
  suite: optionalString,
  modulo: optionalString,
  clasificacion: optionalString,
  version_anterior: optionalString,
  descripcion_error: optionalString,
  imagen_1_url: optionalString,
  imagen_2_url: optionalString,
  link_video: z.preprocess(emptyToNull, z.string().max(5000, 'Enlace demasiado largo').nullable().optional()),
  prioridad_servicio: optionalString,
  solucionado: optionalEnum(SolucionadoValues),
  observacion_formacion: optionalString,
  fecha_tentativa_solucion: z.preprocess(emptyToNull, z.string().nullable().optional()),
  estado_fds: optionalString,
  observaciones_fds: optionalString,
  encargado_fds: optionalString,
  azure_url: z.preprocess(
    emptyToNull,
    z.string().url('URL inválida').nullable().optional().or(z.literal('')),
  ),
  segmentacion_fds: optionalString,
  impacto_fds: optionalString,
  fecha_robot_beta: z.preprocess(emptyToNull, z.string().nullable().optional()),
})

export type BitacoraFormData = z.infer<typeof BitacoraFormSchema>
