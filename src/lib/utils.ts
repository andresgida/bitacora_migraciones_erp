import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDateLocal(date: string): Date {
  // YYYY-MM-DD → local date (avoids UTC midnight → day-shift in UTC-5)
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(date)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseDateLocal(date) : date
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseDateLocal(date) : date
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export type EstadoIncidenciaType = 'Vencido' | 'A tiempo' | 'Resuelto'

export const EstadoIncidenciaValues = ['Vencido', 'A tiempo', 'Resuelto'] as const

export function getTodayISO(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Estado calculado según Fecha Robot Oficial y campo Solucionado. */
export function getEstadoIncidencia(
  fechaRobotOficial: string | null | undefined,
  solucionado: string | null | undefined,
): EstadoIncidenciaType | null {
  const sol = solucionado ?? 'No'

  if (sol === 'Si') return 'Resuelto'
  if (!fechaRobotOficial || sol !== 'No') return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fecha = parseDateLocal(fechaRobotOficial)
  fecha.setHours(0, 0, 0, 0)

  if (fecha.getTime() > today.getTime()) return 'A tiempo'
  if (fecha.getTime() < today.getTime()) return 'Vencido'

  return 'A tiempo'
}
