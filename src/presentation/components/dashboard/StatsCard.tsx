import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: { value: number; label: string }
  className?: string
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#a2c9ff]',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-border bg-popover p-4 transition-all hover:bg-secondary',
        className,
      )}
    >
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
}
