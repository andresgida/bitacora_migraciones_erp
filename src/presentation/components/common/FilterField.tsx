import { cn } from '@/lib/utils'

interface FilterFieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export default function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-border bg-popover px-2 py-1',
        className,
      )}
    >
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      {children}
    </div>
  )
}
