export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    method: req.method,
    nodeVersion: process.version,
    hasFetch: typeof fetch !== 'undefined',
    env: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasNotifyEmail: !!process.env.NOTIFY_EMAIL,
      hasWebhookSecret: !!process.env.WEBHOOK_SECRET,
      hasFdsSolucionadoEmail: !!process.env.NOTIFY_EMAIL_FDS_SOLUCIONADO,
      hasSuspendidoEmail: !!process.env.NOTIFY_EMAIL_SUSPENDIDO,
    },
  })
}
