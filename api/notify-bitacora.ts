import type { VercelRequest, VercelResponse } from '@vercel/node'

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
  solucionado: string | null
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
        ${solChanged ? changedRow('Solucionado', old?.solucionado ?? 'No', record.solucionado ?? 'No') : ''}
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
              ${row('Solucionado', record.solucionado === 'Si' ? '✅ Si' : (record.solucionado ?? 'No'))}
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

// ── Email sender helper (Brevo) ──────────────────────────────────────────────

async function sendEmail(opts: {
  apiKey: string
  fromName: string
  fromEmail: string
  to: string[]
  subject: string
  html: string
}): Promise<{ id?: string; error?: unknown }> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': opts.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: opts.fromName, email: opts.fromEmail },
      to: opts.to.map((email: string) => ({ email })),
      subject: opts.subject,
      htmlContent: opts.html,
    }),
  })
  const data = await res.json() as { messageId?: string; code?: string; message?: string }
  if (!res.ok) return { error: data }
  return { id: data.messageId }
}

// ── Targeted email templates ──────────────────────────────────────────────────

function buildFdsSolucionadoHtml(record: BitacoraRecord, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid #16a34a;border-radius:8px;padding:32px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#16a34a;">✅ FDS Solucionado</p>
            <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0f172a;">${record.nombre_empresa}</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Incidencia #${record.id} · ${fmtDate(record.fecha_novedad)}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid #f1f5f9;">
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;width:150px;">CSM</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.csm)}</td></tr>
              <tr style="background:#f8fafc;"><td style="padding:10px 4px;color:#64748b;font-size:13px;">Encargado FDS</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.encargado_fds)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Suite / Módulo</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.suite)} / ${fmt(record.modulo)}</td></tr>
              <tr style="background:#f8fafc;"><td style="padding:10px 4px;color:#64748b;font-size:13px;">Observaciones</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.observaciones_fds)}</td></tr>
            </table>
            <div style="margin-top:24px;">
              <a href="${appUrl}/bitacora" style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none;">Ver incidencia →</a>
            </div>
          </td>
        </tr>
        <tr><td style="padding:16px 0;text-align:center;font-size:12px;color:#94a3b8;">Bitácora ERP · notificación automática</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildSuspendidoHtml(record: BitacoraRecord, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid #dc2626;border-radius:8px;padding:32px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#dc2626;">⚠️ Empresa Suspendida</p>
            <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0f172a;">${record.nombre_empresa}</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Incidencia #${record.id} · ${fmtDate(record.fecha_novedad)}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid #f1f5f9;">
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;width:150px;">CSM</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.csm)}</td></tr>
              <tr style="background:#f8fafc;"><td style="padding:10px 4px;color:#64748b;font-size:13px;">Prioridad</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.prioridad_servicio)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Suite / Módulo</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.suite)} / ${fmt(record.modulo)}</td></tr>
              <tr style="background:#f8fafc;"><td style="padding:10px 4px;color:#64748b;font-size:13px;">Base de datos</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.base_datos)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Descripción</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${fmt(record.descripcion_error)}</td></tr>
            </table>
            <div style="margin-top:24px;">
              <a href="${appUrl}/bitacora" style="display:inline-block;background:#dc2626;color:#fff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none;">Ver incidencia →</a>
            </div>
          </td>
        </tr>
        <tr><td style="padding:16px 0;text-align:center;font-size:12px;color:#94a3b8;">Bitácora ERP · notificación automática</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
    if (!payload || !payload.type) {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    if (payload.type === 'DELETE') {
      return res.status(200).json({ ok: true, skipped: 'DELETE ignored' })
    }

    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'BREVO_API_KEY env var not set' })
    }

    const { type, record, old_record } = payload
    const appUrl = process.env.APP_URL ?? 'https://bitacora-erp.vercel.app'
    const fromName = 'Bitácora ERP'
    const fromEmail = process.env.NOTIFY_FROM_EMAIL ?? 'agomez@ofima.com'

    console.log('notify-bitacora: event', JSON.stringify({
      type,
      id: record?.id,
      prioridad_nuevo: record?.prioridad_servicio,
      prioridad_anterior: old_record?.prioridad_servicio,
      estado_fds_nuevo: record?.estado_fds,
      estado_fds_anterior: old_record?.estado_fds,
      estado_nuevo: record?.estado,
      estado_anterior: old_record?.estado,
      solucionado_nuevo: record?.solucionado,
      solucionado_anterior: old_record?.solucionado,
      has_old_record: !!old_record,
    }))

    const sent: string[] = []
    const errors: unknown[] = []

    // ── Case 1: Nueva incidencia (INSERT) ──────────────────────────────────────
    if (type === 'INSERT') {
      const toEmails = (process.env.NOTIFY_EMAIL ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)
      if (toEmails.length > 0) {
        const result = await sendEmail({
          apiKey, fromName, fromEmail, to: toEmails,
          subject: `[Bitácora] Nueva incidencia — ${record.nombre_empresa}`,
          html: buildEmailHtml('INSERT', record, null, appUrl),
        })
        if (result.error) errors.push(result.error)
        else sent.push(`nueva-incidencia:${result.id}`)
      }
    }

    // ── Case 2: Estado FDS cambia a cualquier valor ───────────────────────────
    if (
      type === 'UPDATE' &&
      record.estado_fds &&
      record.estado_fds !== old_record?.estado_fds
    ) {
      const toEmails = (process.env.NOTIFY_EMAIL_FDS_SOLUCIONADO ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)
      if (toEmails.length > 0) {
        const isSolucionado = record.estado_fds === 'Solucionado'
        const result = await sendEmail({
          apiKey, fromName, fromEmail, to: toEmails,
          subject: isSolucionado
            ? `[Bitácora] ✅ FDS Solucionado — ${record.nombre_empresa} (#${record.id})`
            : `[Bitácora] Estado FDS → ${record.estado_fds} — ${record.nombre_empresa} (#${record.id})`,
          html: isSolucionado
            ? buildFdsSolucionadoHtml(record, appUrl)
            : buildEmailHtml('UPDATE', record, old_record, appUrl),
        })
        if (result.error) errors.push(result.error)
        else sent.push(`estado-fds:${result.id}`)
      } else {
        console.warn('notify-bitacora: Estado FDS changed but NOTIFY_EMAIL_FDS_SOLUCIONADO is not set')
      }
    }

    // ── Case 3: Estado → Suspendido ────────────────────────────────────────────
    if (
      type === 'UPDATE' &&
      record.estado === 'Suspendido' &&
      old_record?.estado !== 'Suspendido'
    ) {
      const toEmails = (process.env.NOTIFY_EMAIL_SUSPENDIDO ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)
      if (toEmails.length > 0) {
        const result = await sendEmail({
          apiKey, fromName, fromEmail, to: toEmails,
          subject: `[Bitácora] ⚠️ Empresa Suspendida — ${record.nombre_empresa} (#${record.id})`,
          html: buildSuspendidoHtml(record, appUrl),
        })
        if (result.error) errors.push(result.error)
        else sent.push(`suspendido:${result.id}`)
      } else {
        console.warn('notify-bitacora: Suspendido triggered but NOTIFY_EMAIL_SUSPENDIDO is not set')
      }
    }

    // ── Case 4: Prioridad servicio cambia (excluye DEVOLUCION DE FDS y REVISION FORMACION) ──
    const PRIORIDAD_EXCLUIDAS = ['DEVOLUCION DE FDS', 'REVISION FORMACION']
    console.log('notify-bitacora: case4 eval', {
      isUpdate: type === 'UPDATE',
      tienePrioridad: !!record.prioridad_servicio,
      cambio: record.prioridad_servicio !== old_record?.prioridad_servicio,
      noExcluida: !PRIORIDAD_EXCLUIDAS.includes(record.prioridad_servicio ?? ''),
      notifyEmail: !!(process.env.NOTIFY_EMAIL),
    })
    if (
      type === 'UPDATE' &&
      record.prioridad_servicio &&
      record.prioridad_servicio !== old_record?.prioridad_servicio &&
      !PRIORIDAD_EXCLUIDAS.includes(record.prioridad_servicio)
    ) {
      const toEmails = (process.env.NOTIFY_EMAIL ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)
      if (toEmails.length > 0) {
        const result = await sendEmail({
          apiKey, fromName, fromEmail, to: toEmails,
          subject: `[Bitácora] Prioridad → ${record.prioridad_servicio} — ${record.nombre_empresa} (#${record.id})`,
          html: buildEmailHtml('UPDATE', record, old_record, appUrl),
        })
        if (result.error) errors.push(result.error)
        else sent.push(`prioridad:${result.id}`)
      } else {
        console.warn('notify-bitacora: Prioridad changed but NOTIFY_EMAIL is not set')
      }
    }

    // ── Case 5: Solucionado cambia ─────────────────────────────────────────────
    console.log('notify-bitacora: case5 eval', {
      isUpdate: type === 'UPDATE',
      solucionado_nuevo: record.solucionado,
      solucionado_anterior: old_record?.solucionado,
      cambio: record.solucionado !== old_record?.solucionado,
      notifyEmail: !!(process.env.NOTIFY_EMAIL_SOLUCIONADO),
    })
    if (
      type === 'UPDATE' &&
      record.solucionado !== old_record?.solucionado
    ) {
      const toEmails = (process.env.NOTIFY_EMAIL_SOLUCIONADO ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)
      if (toEmails.length > 0) {
        const result = await sendEmail({
          apiKey, fromName, fromEmail, to: toEmails,
          subject: `[Bitácora] Solucionado → ${record.solucionado} — ${record.nombre_empresa} (#${record.id})`,
          html: buildEmailHtml('UPDATE', record, old_record, appUrl),
        })
        if (result.error) errors.push(result.error)
        else sent.push(`solucionado:${result.id}`)
      } else {
        console.warn('notify-bitacora: Solucionado changed but NOTIFY_EMAIL_SOLUCIONADO is not set')
      }
    }

    if (errors.length > 0) {
      console.error('notify-bitacora: errors', JSON.stringify(errors))
      return res.status(500).json({ errors })
    }

    console.log('notify-bitacora: done, sent:', sent)
    return res.status(200).json({ ok: true, sent })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('notify-bitacora: unhandled exception:', message)
    return res.status(500).json({ error: message })
  }
}
