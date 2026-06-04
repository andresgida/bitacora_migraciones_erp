import { cn } from '@/lib/utils'

export const OFIMA_LOGO_URL = '/ofima-logo.webp'

interface OfimaLogoProps {
  className?: string
  alt?: string
}

export default function OfimaLogo({
  className,
  alt = 'Ofima — Líderes en Transformación Digital',
}: OfimaLogoProps) {
  return (
    <img
      src={OFIMA_LOGO_URL}
      alt={alt}
      className={cn('w-auto object-contain', className)}
    />
  )
}
