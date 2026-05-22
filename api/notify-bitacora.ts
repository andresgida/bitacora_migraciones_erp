import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

// ── Types ────────────────────────────────────────────────────────────────────

interface BitacoraRecord {
  id: number
  fecha_novedad: string | null
  fecha_definiciones: string | null
  nombre_empresa: string
  estado: string | null
  base_datos: string | null
  csm: string | null
  lider_novedad: string | null
  suite: string | null
  modulo: string | null
  clasificacion: string | null
  descripcion_error: string | null
  prioridad_servicio: string | null
  solucionado: boolean
  estado_fds: string | null
  observaciones_fds: string | null
  encargado_fds: string | null
  fecha_tentativa_solucion: string | null
  created_at: string
  updated_at: string
}

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: BitacoraRecord
  schema: string
  old_record: BitacoraRecord | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: string | null | undefined): string {
  return value ?? '—'
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function prioridadColor(p: string | null): string {
  const map: Record<string, string> = {
    URGENTE: '#dc2626',
    ALTA: '#ea580c',
    MEDIA: '#d97706',
    BAJA: '#65a30d',
    SOLUCIONADO: '#16a34a',
  }
  return p ? (map[p] ?? '#6b7280') : '#6b7280'
}

function estadoColor(e: string | null): string {
  const map: Record<string, string> = {
    'En pruebas': '#2563eb',
    'En vivo': '#16a34a',
    Suspendido: '#dc2626',
    'Sin iniciar': '#9333ea',
  }
  return e ? (map[e] ?? '#6b7280') : '#6b7280'
}

// ── Email HTML ────────────────────────────────────────────────────────────────

function buildEmailHtml(
  type: 'INSERT' | 'UPDATE',
  record: BitacoraRecord,
  old: BitacoraRecord | null,
  appUrl: string,
): string {
  const isNew = type === 'INSERT'
  const accentColor = '#3b82f6'
  const bgMain = '#0f172a'
  const bgCard = '#1e293b'
  const bgSection = '#0f172a'
  const border = '#334155'
  const textPrimary = '#f1f5f9'
  const textMuted = '#94a3b8'

  const stateChanged = !isNew && old?.estado !== record.estado
  const prioChanged = !isNew && old?.prioridad_servicio !== record.prioridad_servicio
  const solChanged = !isNew && old?.solucionado !== record.solucionado

  const badge = (label: string, bg: string) =>
    `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.5px;background:${bg}22;border:1px solid ${bg}44;color:${bg};">${label}</span>`

  const changedRow = (label: string, oldVal: string, newVal: string) => `
    <tr>
      <td style="padding:8px 0;color:${textMuted};font-size:13px;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:13px;color:${textPrimary};vertical-align:top;">
        <span style="text-decoration:line-through;color:${textMuted};margin-right:6px;">${oldVal}</span>
        <span style="color:#4ade80;font-weight:600;">→ ${newVal}</span>
      </td>
    </tr>`

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:${textMuted};font-size:13px;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:13px;color:${textPrimary};vertical-align:top;">${value}</td>
    </tr>`

  const changesSection = !isNew && (stateChanged || prioChanged || solChanged)
    ? `
    <div style="margin-bottom:24px;background:${bgCard};border:1px solid #4ade8033;border-left:4px solid #4ade80;border-radius:8px;padding:16px 20px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#4ade80;">Cambios detectados</p>
      <table style="width:100%;border-collapse:collapse;">
        ${stateChanged ? changedRow('Estado', fmt(old?.estado), fmt(record.estado)) : ''}
        ${prioChanged ? changedRow('Prioridad', fmt(old?.prioridad_servicio), fmt(record.prioridad_servicio)) : ''}
        ${solChanged ? changedRow('Solucionado', old?.solucionado ? 'Sí' : 'No', record.solucionado ? 'Sí' : 'No') : ''}
      </table>
    </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bgMain};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgMain};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${bgCard};border:1px solid ${border};border-radius:12px 12px 0 0;padding:28px 32px;border-bottom:none;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:${accentColor};color:#fff;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:12px;">
                    ${isNew ? '🆕 Nueva incidencia' : '✏️ Incidencia actualizada'}
                  </span>
                  <h1 style="margin:0;font-size:22px;font-weight:700;color:${textPrimary};line-height:1.3;">
                    ${record.nombre_empresa}
                  </h1>
                  <p style="margin:6px 0 0;color:${textMuted};font-size:14px;">
                    ID #${record.id} · ${fmtDate(record.fecha_novedad)}
                  </p>
                </td>
                <td align="right" valign="top">
                  <div style="text-align:right;">
                    ${badge(fmt(record.prioridad_servicio), prioridadColor(record.prioridad_servicio))}
                    <br><br>
                    ${badge(fmt(record.estado), estadoColor(record.estado))}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Changes section (UPDATE only) -->
        ${changesSection ? `<tr><td style="background:${bgSection};border-left:1px solid ${border};border-right:1px solid ${border};padding:0 32px;">${changesSection}</td></tr>` : ''}

        <!-- Details -->
        <tr>
          <td style="background:${bgCard};border:1px solid ${border};border-top:none;border-bottom:none;padding:24px 32px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${textMuted};">Detalles de la incidencia</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              ${row('CSM', fmt(record.csm))}
              ${row('Líder de novedad', fmt(record.lider_novedad))}
              ${row('Suite', fmt(record.suite))}
              ${row('Módulo', fmt(record.modulo))}
              ${row('Base de datos', fmt(record.base_datos))}
              ${row('Clasificación', fmt(record.clasificacion))}
              ${row('Estado FDS', fmt(record.estado_fds))}
              ${row('Encargado FDS', fmt(record.encargado_fds))}
              ${row('Solucionado', record.solucionado ? '✅ Sí' : '❌ No')}
              ${record.fecha_tentativa_solucion ? row('Fecha tentativa', fmtDate(record.fecha_tentativa_solucion)) : ''}
            </table>
          </td>
        </tr>

        <!-- Description -->
        ${record.descripcion_error ? `
        <tr>
          <td style="background:${bgSection};border-left:1px solid ${border};border-right:1px solid ${border};padding:0 32px;">
            <div style="background:${bgCard};border:1px solid ${border};border-radius:8px;padding:16px 20px;margin:0 0 0">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${textMuted};">Descripción del error</p>
              <p style="margin:0;font-size:14px;color:${textPrimary};line-height:1.6;">${record.descripcion_error}</p>
            </div>
          </td>
        </tr>` : ''}

        <!-- Observations FDS -->
        ${record.observaciones_fds ? `
        <tr>
          <td style="background:${bgSection};border-left:1px solid ${border};border-right:1px solid ${border};padding:8px 32px 0;">
            <div style="background:${bgCard};border:1px solid ${border};border-radius:8px;padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${textMuted};">Observaciones FDS</p>
              <p style="margin:0;font-size:14px;color:${textPrimary};line-height:1.6;">${record.observaciones_fds}</p>
            </div>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="background:${bgCard};border:1px solid ${border};border-top:none;border-bottom:none;padding:24px 32px;">
            <a href="${appUrl}/bitacora"
               style="display:inline-block;background:${accentColor};color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Ver en Bitácora →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${bgMain};border:1px solid ${border};border-top:1px solid ${border};border-radius:0 0 12px 12px;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:${textMuted};line-height:1.5;">
              Bitácora ERP Migration 2026 · Mensaje automático, no responder.<br>
              Generado el ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })} (COT)
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook secret
  const incomingSecret = req.headers['x-webhook-secret']
  const expectedSecret = process.env.WEBHOOK_SECRET
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    console.warn('notify-bitacora: unauthorized request')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const payload = req.body as SupabaseWebhookPayload

  // Skip DELETE events
  if (payload.type === 'DELETE') {
    return res.status(200).json({ ok: true, skipped: 'DELETE event ignored' })
  }

  const { type, record, old_record } = payload

  const resend = new Resend(process.env.RESEND_API_KEY)

  const appUrl = process.env.APP_URL ?? 'https://bitacora-erp.vercel.app'
  const fromEmail = process.env.NOTIFY_FROM_EMAIL ?? 'Bitácora ERP <noreply@resend.dev>'
  const toEmails = (process.env.NOTIFY_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (toEmails.length === 0) {
    console.error('notify-bitacora: NOTIFY_EMAIL is not configured')
    return res.status(500).json({ error: 'NOTIFY_EMAIL env var not set' })
  }

  const subject =
    type === 'INSERT'
      ? `[Bitácora] Nueva incidencia — ${record.nombre_empresa}`
      : `[Bitácora] Incidencia actualizada — ${record.nombre_empresa} (#${record.id})`

  const html = buildEmailHtml(type, record, old_record, appUrl)

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: toEmails,
    subject,
    html,
  })

  if (error) {
    console.error('notify-bitacora: Resend error', error)
    return res.status(500).json({ error })
  }

  console.log(`notify-bitacora: email sent (${type}) id=${data?.id}`)
  return res.status(200).json({ ok: true, emailId: data?.id })
}
