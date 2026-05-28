import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  percent?: number
  percentColor?: string
  icon: LucideIcon
  iconColor?: string
  trend?: { value: number; label: string }
  className?: string
}

export default function StatsCard({
  title,
  value,
  subtitle,
  percent,
  percentColor = 'bg-primary',
  icon: Icon,
  iconColor = 'text-[#a2c9ff]',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-popover p-4 transition-all hover:bg-secondary',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {percent !== undefined && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">del total</span>
            <span className={cn(
              'text-xs font-bold tabular-nums px-2 py-0.5 rounded-full',
              percentColor === 'bg-green-500' ? 'bg-green-500/15 text-green-400' :
              percentColor === 'bg-orange-500' ? 'bg-orange-500/15 text-orange-400' :
              'bg-primary/15 text-primary'
            )}>
              {percent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full transition-all duration-500', percentColor)}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
