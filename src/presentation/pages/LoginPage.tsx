import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

const OFIMA_LOGO_URL = '/ofima-logo.png'

function OfimaLogo() {
  return (
    <img
      src={OFIMA_LOGO_URL}
      alt="Ofima — Líderes en Transformación Digital"
      className="mx-auto max-h-36 w-auto object-contain rounded-xl drop-shadow-lg"
    />
  )
}

export default function LoginPage() {
  const { isAuthenticated, isLoading, signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(data: LoginForm) {
    setIsSubmitting(true)
    try {
      await signIn(data.email, data.password)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Credenciales incorrectas')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #dde9ff 0%, #eff3ff 40%, #e6eeff 70%, #c6dbff 100%)',
      }}
    >
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#007EC3]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-[#003A6A]/10 blur-3xl" />
        <div className="absolute right-1/4 top-10 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
      </div>

      {/* Main card */}
      <div className="relative z-10 flex w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl shadow-[#122945]/20">

        {/* ── Left panel ── */}
        <div
          className="hidden w-[44%] flex-col justify-between p-8 md:flex"
          style={{ background: 'linear-gradient(160deg, #003A6A 0%, #002446 60%, #001830 100%)' }}
        >
          <div>
            <div className="mb-8">
              <OfimaLogo />
            </div>

            <h2 className="text-2xl font-bold leading-snug text-white">
              Potencia su<br />Migración ERP
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-200">
              Visualice el progreso en tiempo real y garantice la integridad de sus datos con
              nuestra plataforma líder en migración empresarial.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="font-mono text-xs text-blue-300">Sistema Operativo v2.0.26</span>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-1 flex-col justify-center bg-white px-8 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#031c38]">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-[#42474f]">
              Gestione sus procesos de migración ERP con precisión y control.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#42474f]">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737780]" />
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@ofima.com"
                  autoComplete="email"
                  className="w-full rounded border border-[#c2c6d0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#031c38] placeholder:text-[#9ca3af] outline-none transition focus:border-[#007EC3] focus:ring-2 focus:ring-[#007EC3]/20"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#42474f]">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737780]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded border border-[#c2c6d0] bg-white py-2.5 pl-10 pr-10 text-sm text-[#031c38] placeholder:text-[#9ca3af] outline-none transition focus:border-[#007EC3] focus:ring-2 focus:ring-[#007EC3]/20"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737780] hover:text-[#003A6A] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Remember / forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#42474f]">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#c2c6d0] accent-[#003A6A]" />
                Recordarme
              </label>
              <button type="button" className="text-sm text-[#007EC3] hover:underline">
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: '#003A6A' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Entrar al Sistema'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#42474f]">
            ¿Necesita asistencia técnica?{' '}
            <a href="mailto:soporte@ofima.com" className="font-medium text-[#007EC3] hover:underline">
              Contactar Soporte
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-6 flex w-full max-w-3xl items-center justify-between text-xs text-[#737780]">
        <span>© 2026 Ofima SAS. Todos los derechos reservados.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#003A6A] hover:underline">Privacidad</a>
          <a href="#" className="hover:text-[#003A6A] hover:underline">Términos</a>
          <a href="#" className="hover:text-[#003A6A] hover:underline">Soporte Técnico</a>
        </div>
      </div>
    </div>
  )
}
