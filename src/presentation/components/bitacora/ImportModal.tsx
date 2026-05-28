import { useRef, useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SupabaseBitacoraRepository } from '@/infrastructure/repositories/SupabaseBitacoraRepository'
import { SupabaseAuditLogRepository } from '@/infrastructure/repositories/SupabaseAuditLogRepository'
import { CreateBitacoraUseCase } from '@/application/use-cases/bitacora/CreateBitacora'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { BITACORA_QUERY_KEY } from '@/presentation/hooks/useBitacora'
import type { BitacoraCreate } from '@/domain/entities/Bitacora'
import {
  EstadoValues, PrioridadValues, EstadoFDSValues, SuiteValues, ModuloValues,
  ClasificacionValues, VersionAnteriorValues, CSMValues, LiderNovedadValues,
  EncargadoFDSValues, SegmentacionFDSValues, ImpactoFDSValues,
} from '@/domain/value-objects/enums'

// ── Column aliases: Excel header → entity field ───────────────────────────────
const ALIASES: Record<string, keyof BitacoraCreate> = {
  empresa: 'nombre_empresa', 'nombre empresa': 'nombre_empresa', nombre_empresa: 'nombre_empresa',
  'fecha novedad': 'fecha_novedad', fecha_novedad: 'fecha_novedad',
  'fecha definiciones': 'fecha_definiciones', fecha_definiciones: 'fecha_definiciones',
  estado: 'estado',
  'base datos': 'base_datos', base_datos: 'base_datos', 'base de datos': 'base_datos',
  csm: 'csm',
  'lider novedad': 'lider_novedad', 'líder novedad': 'lider_novedad', lider_novedad: 'lider_novedad',
  suite: 'suite',
  modulo: 'modulo', módulo: 'modulo',
  clasificacion: 'clasificacion', clasificación: 'clasificacion',
  version: 'version_anterior', versión: 'version_anterior', version_anterior: 'version_anterior', 'version anterior': 'version_anterior',
  'descripcion error': 'descripcion_error', 'descripción error': 'descripcion_error', descripcion_error: 'descripcion_error',
  prioridad: 'prioridad_servicio', 'prioridad servicio': 'prioridad_servicio', prioridad_servicio: 'prioridad_servicio',
  solucionado: 'solucionado',
  'observacion formacion': 'observacion_formacion', 'observación formación': 'observacion_formacion', observacion_formacion: 'observacion_formacion',
  'estado fds': 'estado_fds', estado_fds: 'estado_fds',
  'observaciones fds': 'observaciones_fds', observaciones_fds: 'observaciones_fds',
  'encargado fds': 'encargado_fds', encargado_fds: 'encargado_fds',
  'segmentacion fds': 'segmentacion_fds', 'segmentación fds': 'segmentacion_fds', segmentacion_fds: 'segmentacion_fds',
  'impacto fds': 'impacto_fds', impacto_fds: 'impacto_fds',
  'fecha tentativa': 'fecha_tentativa_solucion', 'fecha robot oficial': 'fecha_tentativa_solucion', fecha_tentativa_solucion: 'fecha_tentativa_solucion',
  'fecha robot beta': 'fecha_robot_beta', fecha_robot_beta: 'fecha_robot_beta',
  'azure url': 'azure_url', azure_url: 'azure_url',
  'link video': 'link_video', link_video: 'link_video',
}

function normalizeHeader(h: string): keyof BitacoraCreate | null {
  const key = h.trim().toLowerCase()
  return ALIASES[key] ?? null
}

// ── Enum normalization (accent + case insensitive) ───────────────────────────
function removeAccents(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function matchEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (value === null || value === undefined || value === '') return null
  const norm = removeAccents(String(value).trim().toLowerCase())
  return allowed.find(a => removeAccents(a.toLowerCase()) === norm) ?? null
}

const ENUM_FIELDS: Partial<Record<keyof BitacoraCreate, readonly string[]>> = {
  estado: EstadoValues,
  prioridad_servicio: PrioridadValues,
  estado_fds: EstadoFDSValues,
  suite: SuiteValues,
  modulo: ModuloValues,
  clasificacion: ClasificacionValues,
  version_anterior: VersionAnteriorValues,
  csm: CSMValues,
  lider_novedad: LiderNovedadValues,
  encargado_fds: EncargadoFDSValues,
  segmentacion_fds: SegmentacionFDSValues,
  impacto_fds: ImpactoFDSValues,
}

function parseBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  const s = String(v ?? '').trim().toLowerCase()
  return ['si', 'sí', 'yes', '1', 'true', 'x'].includes(s)
}

function parseDate(v: unknown): string | null {
  if (!v) return null
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v)
    if (!d) return null
    const mm = String(d.m).padStart(2, '0')
    const dd = String(d.d).padStart(2, '0')
    return `${d.y}-${mm}-${dd}`
  }
  const s = String(v).trim()
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

type ParsedRow = Partial<BitacoraCreate> & { _raw: Record<string, unknown>; _rowNum: number }

function parseSheet(ws: XLSX.WorkSheet): { headers: string[]; mapped: string[]; rows: ParsedRow[] } {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: true })
  if (!raw.length) return { headers: [], mapped: [], rows: [] }

  const excelHeaders = Object.keys(raw[0])
  const mapped = excelHeaders.map(h => normalizeHeader(h) ?? '').filter(Boolean)

  const rows: ParsedRow[] = raw.map((r, i) => {
    const row: ParsedRow = { _raw: r, _rowNum: i + 2 }
    for (const [h, val] of Object.entries(r)) {
      const field = normalizeHeader(h)
      if (!field) continue
      if (field === 'solucionado') { row[field] = parseBoolean(val) as never; continue }
      if (['fecha_novedad', 'fecha_definiciones', 'fecha_tentativa_solucion', 'fecha_robot_beta'].includes(field)) {
        row[field] = parseDate(val) as never; continue
      }
      const allowedEnum = ENUM_FIELDS[field]
      if (allowedEnum) {
        row[field] = matchEnum(val, allowedEnum) as never; continue
      }
      row[field] = val === null || val === '' ? (null as never) : (String(val).trim() as never)
    }
    if (row.nombre_empresa === undefined) row.nombre_empresa = ''
    if (row.solucionado === undefined) row.solucionado = false
    return row
  })

  return { headers: excelHeaders, mapped, rows }
}

// ── Repos ─────────────────────────────────────────────────────────────────────
const bitacoraRepo = new SupabaseBitacoraRepository()
const auditRepo = new SupabaseAuditLogRepository()
const createUC = new CreateBitacoraUseCase(bitacoraRepo, auditRepo)

// ── Component ─────────────────────────────────────────────────────────────────
interface ImportModalProps {
  open: boolean
  onClose: () => void
}

type Stage = 'upload' | 'preview' | 'importing' | 'done'

export default function ImportModal({ open, onClose }: ImportModalProps) {
  const { user, profile } = useAuthStore()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('upload')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [imported, setImported] = useState(0)
  const [errors, setErrors] = useState<{ row: number; msg: string }[]>([])

  const reset = () => { setStage('upload'); setRows([]); setHeaders([]); setFileName(''); setProgress(0); setImported(0); setErrors([]) }

  const processFile = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array', cellDates: false })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const { headers: h, rows: r } = parseSheet(ws)
      setHeaders(h)
      setRows(r)
      setStage('preview')
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleImport = async () => {
    setStage('importing')
    setProgress(0)
    setImported(0)
    setErrors([])
    const errs: { row: number; msg: string }[] = []
    let ok = 0
    const reversedRows = [...rows].reverse()
    for (let i = 0; i < reversedRows.length; i++) {
      const { _raw, _rowNum, ...data } = reversedRows[i]
      void _raw
      if (!data.nombre_empresa) { errs.push({ row: _rowNum, msg: 'Falta nombre de empresa' }); continue }
      try {
        await createUC.execute(data as BitacoraCreate, user?.id, profile?.email ?? user?.email)
        ok++
      } catch (e) {
        errs.push({ row: _rowNum, msg: e instanceof Error ? e.message : 'Error desconocido' })
      }
      setProgress(Math.round(((i + 1) / rows.length) * 100))
    }
    setImported(ok)
    setErrors(errs)
    queryClient.invalidateQueries({ queryKey: [BITACORA_QUERY_KEY] })
    setStage('done')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Importar desde Excel</h2>
          </div>
          <button onClick={() => { reset(); onClose() }} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Upload stage */}
          {stage === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-colors',
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60 hover:bg-secondary/50',
              )}
            >
              <Upload className={cn('h-10 w-10', dragging ? 'text-primary' : 'text-muted-foreground')} />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground mt-1">Formatos aceptados: .xlsx, .xls, .csv</p>
              </div>
              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]) }} />
            </div>
          )}

          {/* Preview stage */}
          {stage === 'preview' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{fileName}</p>
                  <p className="text-xs text-muted-foreground">{rows.length} filas detectadas · {headers.length} columnas</p>
                </div>
                <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline">Cambiar archivo</button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      {headers.slice(0, 8).map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                      {headers.length > 8 && <th className="px-3 py-2 text-muted-foreground">+{headers.length - 8} más</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/40">
                        {headers.slice(0, 8).map(h => (
                          <td key={h} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[140px] truncate">
                            {String(row._raw[h] ?? '—')}
                          </td>
                        ))}
                        {headers.length > 8 && <td />}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 8 && <p className="text-xs text-muted-foreground text-center">Mostrando 8 de {rows.length} filas</p>}
            </>
          )}

          {/* Importing stage */}
          {stage === 'importing' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Importando registros...</p>
              <div className="w-full max-w-xs">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-center text-xs text-muted-foreground">{progress}%</p>
              </div>
            </div>
          )}

          {/* Done stage */}
          {stage === 'done' && (
            <div className="space-y-4">
              <div className={cn('flex items-center gap-3 rounded-lg p-4 border', errors.length === 0 ? 'border-green-500/30 bg-green-500/10' : 'border-yellow-500/30 bg-yellow-500/10')}>
                {errors.length === 0
                  ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  : <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-foreground">{imported} registro{imported !== 1 ? 's' : ''} importado{imported !== 1 ? 's' : ''} correctamente</p>
                  {errors.length > 0 && <p className="text-xs text-muted-foreground">{errors.length} fila{errors.length !== 1 ? 's' : ''} con errores</p>}
                </div>
              </div>
              {errors.length > 0 && (
                <div className="rounded-lg border border-border overflow-y-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border bg-secondary"><th className="px-3 py-2 text-left text-muted-foreground">Fila</th><th className="px-3 py-2 text-left text-muted-foreground">Error</th></tr></thead>
                    <tbody>
                      {errors.map((e, i) => (
                        <tr key={i} className="border-b border-border/50"><td className="px-3 py-2 text-muted-foreground">{e.row}</td><td className="px-3 py-2 text-foreground">{e.msg}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={() => { reset(); onClose() }} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            {stage === 'done' ? 'Cerrar' : 'Cancelar'}
          </button>
          {stage === 'preview' && (
            <button onClick={handleImport} disabled={rows.length === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Importar {rows.length} registro{rows.length !== 1 ? 's' : ''}
            </button>
          )}
          {stage === 'done' && imported > 0 && (
            <button onClick={() => { reset() }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Importar otro archivo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
