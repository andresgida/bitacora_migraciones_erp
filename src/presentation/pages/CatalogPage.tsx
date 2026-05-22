import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Settings2 } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
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

  return (
    <div className="flex h-full gap-4 animate-fade-in">
      {/* Category sidebar */}
      <aside className="w-64 shrink-0 rounded-xl border bg-card p-3 space-y-1 self-start sticky top-0">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Catálogos</span>
        </div>
        {Object.entries(CATALOG_CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setSelectedCategory(key); setSearch('') }}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
              selectedCategory === key
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span className="truncate">{label}</span>
            <Badge
              variant="secondary"
              className={cn(
                'ml-2 shrink-0 text-xs h-5 px-1.5',
                selectedCategory === key && 'bg-primary-foreground/20 text-primary-foreground',
              )}
            >
              {counts[key] ?? 0}
            </Badge>
          </button>
        ))}
      </aside>

      {/* Items panel */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {CATALOG_CATEGORIES[selectedCategory]}
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} elementos
            </p>
          </div>
          {isAdmin() && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          )}
        </div>

        {/* Search */}
        <Input
          placeholder={`Buscar en ${CATALOG_CATEGORIES[selectedCategory]}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="md" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {search ? 'Sin resultados para la búsqueda' : 'No hay elementos en este catálogo'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Orden</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Estado</th>
                  {isAdmin() && (
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-28">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'transition-colors hover:bg-muted/30',
                      !item.active && 'opacity-50',
                    )}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.value}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.order_index}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={item.active ? 'default' : 'secondary'} className="text-xs">
                        {item.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    {isAdmin() && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title={item.active ? 'Desactivar' : 'Activar'}
                            onClick={() => handleToggleActive(item)}
                          >
                            {item.active
                              ? <ToggleRight className="h-4 w-4 text-primary" />
                              : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            }
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Editar"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Eliminar"
                            onClick={() => setDeleteItem(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Editar elemento' : `Agregar a ${CATALOG_CATEGORIES[selectedCategory]}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catalog-value">Valor</Label>
              <Input
                id="catalog-value"
                placeholder="Nombre del elemento"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFormSubmit()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="catalog-order">Orden</Label>
              <Input
                id="catalog-order"
                type="number"
                min="0"
                value={formOrderIndex}
                onChange={(e) => setFormOrderIndex(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={!formValue.trim() || creating || updating}
            >
              {editItem ? 'Guardar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
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
