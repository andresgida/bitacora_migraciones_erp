import { ExternalLink, Image as ImageIcon, Clock, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  PRIORIDAD_COLORS,
  ESTADO_COLORS,
  ESTADO_FDS_COLORS,
  IMPACTO_COLORS,
} from '@/presentation/constants/options'
import type { Bitacora } from '@/domain/entities/Bitacora'
import type { AuditLog } from '@/domain/entities/AuditLog'

interface BitacoraDetailProps {
  record: Bitacora | null
  auditLogs?: AuditLog[]
  open: boolean
  onClose: () => void
}

const FIELD_LABELS: Record<string, string> = {
  nombre_empresa: 'Empresa',
  estado: 'Estado',
  base_datos: 'Base de datos',
  csm: 'CSM',
  lider_novedad: 'Líder novedad',
  suite: 'Suite',
  modulo: 'Módulo',
  clasificacion: 'Clasificación',
  version_anterior: 'Proceso',
  descripcion_error: 'Descripción error',
  link_video: 'Link video',
  prioridad_servicio: 'Prioridad',
  solucionado: 'Solucionado',
  observacion_formacion: 'Obs. formación',
  fecha_novedad: 'Fecha novedad',
  fecha_definiciones: 'Fecha definiciones',
  fecha_tentativa_solucion: 'Fecha Robot Oficial',
  fecha_robot_beta: 'Fecha robot beta',
  estado_fds: 'Estado FDS',
  observaciones_fds: 'Obs. FDS',
  encargado_fds: 'Encargado FDS',
  segmentacion_fds: 'Segmentación FDS',
  impacto_fds: 'Impacto FDS',
  azure_url: 'Azure URL',
}

const IGNORED_FIELDS = new Set(['updated_at', 'created_at', 'id', 'imagen_1_url', 'imagen_2_url'])

function getChangedFields(oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) {
  if (!oldData || !newData) return []
  return Object.keys(newData)
    .filter(k => !IGNORED_FIELDS.has(k) && String(newData[k] ?? '') !== String(oldData[k] ?? ''))
    .map(k => ({
      field: FIELD_LABELS[k] ?? k,
      from: String(oldData[k] ?? '—'),
      to: String(newData[k] ?? '—'),
    }))
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  )
}

function ColorBadge({
  value,
  colorMap,
}: {
  value: string | null
  colorMap: Record<string, string>
}) {
  if (!value) return <span className="text-muted-foreground text-sm">—</span>
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
        colorMap[value] ?? 'bg-muted text-muted-foreground border-transparent',
      )}
    >
      {value}
    </span>
  )
}

export default function BitacoraDetail({
  record,
  auditLogs = [],
  open,
  onClose,
}: BitacoraDetailProps) {
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg">{record.nombre_empresa}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Registro #{record.id} · Creado {formatDateTime(record.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ColorBadge value={record.estado} colorMap={ESTADO_COLORS} />
              <ColorBadge value={record.prioridad_servicio} colorMap={PRIORIDAD_COLORS} />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Información General
              </h3>
              <div className="rounded-lg border p-3 space-y-0.5">
                <DetailRow label="Fecha novedad" value={formatDate(record.fecha_novedad)} />
                <Separator className="my-1" />
                <DetailRow
                  label="Fecha definiciones"
                  value={formatDate(record.fecha_definiciones)}
                />
                <Separator className="my-1" />
                <DetailRow label="Base de datos" value={record.base_datos} />
                <Separator className="my-1" />
                <DetailRow label="Proceso" value={record.version_anterior} />
                <Separator className="my-1" />
                <DetailRow
                  label="Clasificación"
                  value={record.clasificacion && <Badge variant="outline">{record.clasificacion}</Badge>}
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Técnico
              </h3>
              <div className="rounded-lg border p-3 space-y-0.5">
                <DetailRow label="Suite" value={record.suite} />
                <Separator className="my-1" />
                <DetailRow label="Módulo" value={record.modulo} />
                <Separator className="my-1" />
                <DetailRow label="CSM" value={record.csm} />
                <Separator className="my-1" />
                <DetailRow label="Líder novedad" value={record.lider_novedad} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Descripción
              </h3>
              <div className="rounded-lg border p-3 space-y-3">
                {record.descripcion_error ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {record.descripcion_error}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin descripción</p>
                )}

                {(record.imagen_1_url || record.imagen_2_url) && (
                  <div className="flex gap-3 flex-wrap">
                    {record.imagen_1_url && (
                      <a
                        href={record.imagen_1_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline border rounded-md px-2 py-1"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Imagen 1
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {record.imagen_2_url && (
                      <a
                        href={record.imagen_2_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline border rounded-md px-2 py-1"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Imagen 2
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {record.link_video && (
                  <a
                    href={record.link_video}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver video
                  </a>
                )}

                {record.observacion_formacion && (
                  <div className="rounded-md bg-muted/50 p-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Obs. Formación</p>
                    <p className="text-sm">{record.observacion_formacion}</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                FDS
              </h3>
              <div className="rounded-lg border p-3 space-y-0.5">
                <DetailRow
                  label="Estado FDS"
                  value={<ColorBadge value={record.estado_fds} colorMap={ESTADO_FDS_COLORS} />}
                />
                <Separator className="my-1" />
                <DetailRow label="Encargado FDS" value={record.encargado_fds} />
                <Separator className="my-1" />
                <DetailRow
                  label="Fecha Robot Oficial"
                  value={formatDate(record.fecha_tentativa_solucion)}
                />
                <Separator className="my-1" />
                <DetailRow label="Segmentación" value={record.segmentacion_fds} />
                <Separator className="my-1" />
                <DetailRow
                  label="Impacto"
                  value={<ColorBadge value={record.impacto_fds} colorMap={IMPACTO_COLORS} />}
                />
                <Separator className="my-1" />
                <DetailRow
                  label="Solucionado"
                  value={
                    <Badge variant={record.solucionado ? 'default' : 'secondary'}>
                      {record.solucionado ? 'Sí' : 'No'}
                    </Badge>
                  }
                />
                {record.azure_url && (
                  <>
                    <Separator className="my-1" />
                    <DetailRow
                      label="Azure"
                      value={
                        <a
                          href={record.azure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver en Azure
                        </a>
                      }
                    />
                  </>
                )}
                {record.observaciones_fds && (
                  <div className="mt-2 rounded-md bg-muted/50 p-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Observaciones</p>
                    <p className="text-sm">{record.observaciones_fds}</p>
                  </div>
                )}
              </div>
            </section>

            {auditLogs.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Historial de cambios
                </h3>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                        {log.action === 'INSERT' ? (
                          <span className="text-green-600 text-xs font-bold">+</span>
                        ) : log.action === 'DELETE' ? (
                          <span className="text-destructive text-xs font-bold">×</span>
                        ) : (
                          <span className="text-blue-600 text-xs font-bold">~</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {log.action === 'INSERT'
                              ? 'Creado'
                              : log.action === 'UPDATE'
                              ? 'Actualizado'
                              : 'Eliminado'}
                          </span>
                          {log.user_email && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {log.user_email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(log.created_at)}
                        </div>
                        {log.action === 'UPDATE' && (() => {
                          const changes = getChangedFields(log.old_data, log.new_data)
                          return changes.length > 0 ? (
                            <div className="mt-1.5 space-y-1">
                              {changes.map(({ field, from, to }) => (
                                <div key={field} className="text-xs rounded bg-muted/60 px-2 py-1">
                                  <span className="font-medium text-foreground">{field}:</span>{' '}
                                  <span className="text-muted-foreground line-through">{from}</span>
                                  {' → '}
                                  <span className="text-foreground font-medium">{to}</span>
                                </div>
                              ))}
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
