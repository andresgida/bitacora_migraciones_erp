import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, ListFilter } from 'lucide-react'
import { Label } from '@/presentation/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import {
  useCatalogOptions,
  useCatalogCounts,
  useCreateCatalogItem,
  useUpdateCatalogItem,
  useDeleteCatalogItem,
} from '@/presentation/hooks/useCatalog'
import { CATALOG_CATEGORIES, type Catalog } from '@/domain/entities/Catalog'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner'
import { useAuthStore } from '@/presentation/stores/authStore'
import { cn } from '@/lib/utils'

export default function CatalogPage() {
  const { isAdmin } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('empresa')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Catalog | null>(null)
  const [deleteItem, setDeleteItem] = useState<Catalog | null>(null)
  const [formValue, setFormValue] = useState('')
  const [formOrderIndex, setFormOrderIndex] = useState('0')

  const { data: counts = {} } = useCatalogCounts()
  const { data: items = [], isLoading } = useCatalogOptions(selectedCategory)
  const { mutateAsync: create, isPending: creating } = useCreateCatalogItem()
  const { mutateAsync: update, isPending: updating } = useUpdateCatalogItem()
  const { mutateAsync: remove, isPending: deleting } = useDeleteCatalogItem()

  const filteredItems = items.filter((i) =>
    i.value.toLowerCase().includes(search.toLowerCase()),
  )

  function openCreate() {
    setEditItem(null)
    setFormValue('')
    setFormOrderIndex(String((items.length ?? 0) + 1))
    setFormOpen(true)
  }

  function openEdit(item: Catalog) {
    setEditItem(item)
    setFormValue(item.value)
    setFormOrderIndex(String(item.order_index))
    setFormOpen(true)
  }

  async function handleFormSubmit() {
    if (!formValue.trim()) return
    if (editItem) {
      await update({ id: editItem.id, data: { value: formValue.trim(), order_index: Number(formOrderIndex) } })
    } else {
      await create({
        category: selectedCategory,
        value: formValue.trim(),
        active: true,
        order_index: Number(formOrderIndex),
      })
    }
    setFormOpen(false)
  }

  async function handleToggleActive(item: Catalog) {
    await update({ id: item.id, data: { active: !item.active } })
  }

  async function handleDelete() {
    if (!deleteItem) return
    await remove(deleteItem.id)
    setDeleteItem(null)
  }

  const categoryLabel = CATALOG_CATEGORIES[selectedCategory]

  return (
    <div className="flex gap-5 animate-fade-in items-start">
      {/* ── Category sidebar ── */}
      <aside className="w-56 shrink-0 rounded-xl border border-border bg-popover p-3 self-start sticky top-0">
        <p className="flex items-center gap-2 px-2 py-1.5 mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <ListFilter className="h-3.5 w-3.5" />
          Catálogos
        </p>
        {Object.entries(CATALOG_CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setSelectedCategory(key); setSearch('') }}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors',
              selectedCategory === key
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-secondary-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <span className="truncate">{label}</span>
            <span className={cn('text-xs ml-2', selectedCategory === key ? 'text-primary font-bold' : 'opacity-40')}>
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </aside>

      {/* ── Items panel ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{categoryLabel}</h1>
            <p className="text-sm text-muted-foreground">
              {items.length} elementos registrados en el catálogo maestro.
            </p>
          </div>
          {isAdmin() && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Agregar {categoryLabel}
            </button>
          )}
        </div>

        {/* Table card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                placeholder={`Buscar en ${categoryLabel}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="md" /></div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {search ? 'Sin resultados' : 'No hay elementos en este catálogo'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Valor</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-20">Orden</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Estado</th>
                  {isAdmin() && (
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 pr-5">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn('group transition-colors hover:bg-secondary', !item.active && 'opacity-50')}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">{item.value}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-xs text-muted-foreground">{item.order_index}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase',
                        item.active
                          ? 'border-primary/20 bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground',
                      )}>
                        {item.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="px-4 py-3.5 pr-5">
                        <div className="flex items-center justify-end gap-2 opacity-30 transition-opacity group-hover:opacity-100">
                          <button
                            title={item.active ? 'Desactivar' : 'Activar'}
                            onClick={() => handleToggleActive(item)}
                            className="text-muted-foreground transition-colors hover:text-primary"
                          >
                            {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            title="Editar"
                            onClick={() => openEdit(item)}
                            className="text-muted-foreground transition-colors hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => setDeleteItem(item)}
                            className="text-muted-foreground transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Editar elemento' : `Agregar a ${categoryLabel}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catalog-value">Valor</Label>
              <input
                id="catalog-value"
                placeholder="Nombre del elemento"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFormSubmit()}
                autoFocus
                className="w-full rounded-lg border border-border bg-popover px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="catalog-order">Orden</Label>
              <input
                id="catalog-order"
                type="number"
                min="0"
                value={formOrderIndex}
                onChange={(e) => setFormOrderIndex(e.target.value)}
                className="w-full rounded-lg border border-border bg-popover px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={!formValue.trim() || creating || updating}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {editItem ? 'Guardar' : 'Agregar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>"{deleteItem?.value}"</strong> permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
