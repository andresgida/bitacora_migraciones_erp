import * as XLSX from 'xlsx'
import { getEstadoIncidencia } from '@/lib/utils'
import type { Bitacora } from '@/domain/entities/Bitacora'

export function bitacoraRecordsToExcelRows(records: Bitacora[]) {
  return records.map((r) => ({
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
}

export function downloadBitacoraExcel(records: Bitacora[]) {
  const rows = bitacoraRecordsToExcelRows(records)
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bitácora')
  XLSX.writeFile(wb, `bitacora_migraciones_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
