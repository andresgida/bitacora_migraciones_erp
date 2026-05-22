import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
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
  iconColor = 'text-primary',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
