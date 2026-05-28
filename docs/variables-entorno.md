# Variables de Entorno — Bitácora ERP

Configuradas en Vercel (Production and Preview).

---

## Variables de correo electrónico

| Variable | Para qué sirve | Qué valor poner |
|---|---|---|
| `NOTIFY_FROM_EMAIL` | Remitente que aparece en todos los correos ("De:") | El correo verificado en Brevo (ej: `agomez@ofima.com`) |
| `NOTIFY_EMAIL` | Destinatarios para: **nueva incidencia (INSERT)** y **cambio de prioridad de servicio** | Correos separados por coma de quienes deben recibir esas alertas | Correos: jmunera@ofima.com, pperez@ofima.com
| `NOTIFY_EMAIL_FDS_SOLUCIONADO` | Destinatarios para: **cualquier cambio de Estado FDS** (Pendiente, En proceso, Solucionado) | Correos del equipo FDS |
Correos: jmunera@ofima.com, pperez@ofima.com
| `NOTIFY_EMAIL_SUSPENDIDO` | Destinatarios para: **cuando una empresa queda en estado "Suspendido"** | Correos de quien deba saber de suspensiones (gerencia, CSM, etc.)Correos: darias@ofima.com, lperez@ofima.com, pperez@ofima.com |

**Ejemplo de múltiples destinatarios:**
```
correo1@empresa.com,correo2@empresa.com
```

---

## Variables de servicios (no son correos)

| Variable | Para qué sirve |
|---|---|
| `BREVO_API_KEY` | Llave de la plataforma Brevo para enviar los correos |
| `WEBHOOK_SECRET` | Contraseña secreta que verifica que el evento viene de Supabase |
| `APP_URL` | URL de la app (ej: `https://bitacora-erp.vercel.app`). Se usa en el botón "Ver en Bitácora" de los correos |
| `SUPABASE_URL` | URL del proyecto Supabase (ej: `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Llave de servicio de Supabase (Project Settings → API → `service_role`). Usada para el auto-marcado de `solucionado = true` desde el webhook |
| `RESEND_API_KEY` | API de Resend — ya reemplazada por Brevo, no se usa |

---

## Reglas de notificación implementadas

| Evento | Variable de destinatarios | Condición |
|---|---|---|
| Nueva incidencia creada | `NOTIFY_EMAIL` | Siempre al insertar |
| Prioridad de servicio cambia | `NOTIFY_EMAIL` | Solo cuando el nuevo valor es distinto a `DEVOLUCION DE FDS` y `REVISION FORMACION` |
| Estado FDS cambia | `NOTIFY_EMAIL_FDS_SOLUCIONADO` | Cualquier cambio de valor |
| Estado cambia a Suspendido | `NOTIFY_EMAIL_SUSPENDIDO` | Solo al cambiar a `Suspendido` |

## Automatizaciones implementadas

- Cuando `prioridad_servicio` se actualiza a **`SOLUCIONADO`**, el campo `solucionado` se marca automáticamente como `true` en la base de datos (via webhook + Supabase REST API).
