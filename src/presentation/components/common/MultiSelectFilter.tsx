import * as Popover from '@radix-ui/react-popover'
import * as Checkbox from '@radix-ui/react-checkbox'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectFilterProps {
  label?: string
  placeholder: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  emptyOption?: MultiSelectOption
}

function getTriggerLabel(
  selected: string[],
  placeholder: string,
  options: MultiSelectOption[],
  emptyOption?: MultiSelectOption,
): string {
  if (selected.length === 0) return placeholder
  if (selected.length === 1) {
    const value = selected[0]
    if (emptyOption?.value === value) return emptyOption.label
    return options.find((o) => o.value === value)?.label ?? value
  }
  return `${selected.length} seleccionados`
}

export default function MultiSelectFilter({
  label,
  placeholder,
  options,
  selected,
  onChange,
  className,
  emptyOption,
}: MultiSelectFilterProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  const allOptions = emptyOption ? [emptyOption, ...options] : options

  const trigger = (
    <Popover.Trigger asChild>
      <button
        type="button"
        className={cn(
          'flex h-8 min-w-[7rem] items-center justify-between gap-2 rounded-md border-0 bg-transparent px-1 text-xs text-secondary-foreground hover:bg-accent/50 transition-colors',
          !label && 'h-10 border border-border bg-popover px-3 py-2 text-sm',
          className,
        )}
      >
        <span className="truncate">
          {getTriggerLabel(selected, placeholder, options, emptyOption)}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
    </Popover.Trigger>
  )

  return (
    <Popover.Root>
      {label ? (
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-popover px-2 py-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
          {trigger}
        </div>
      ) : (
        trigger
      )}
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 max-h-80 w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {allOptions.map((option) => {
            const checked = selected.includes(option.value)
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox.Root
                  checked={checked}
                  onCheckedChange={() => toggle(option.value)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span className="truncate">{option.label}</span>
              </label>
            )
          })}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Limpiar selección
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
