import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import BitacoraTable from '@/presentation/components/bitacora/BitacoraTable'
import BitacoraForm from '@/presentation/components/bitacora/BitacoraForm'
import BitacoraDetail from '@/presentation/components/bitacora/BitacoraDetail'
import ImportModal from '@/presentation/components/bitacora/ImportModal'
import {
  useBitacoraList,
  useCreateBitacora,
  useUpdateBitacora,
  useDeleteBitacora,
  useAuditLogs,
} from '@/presentation/hooks/useBitacora'
import { useAuthStore } from '@/presentation/stores/authStore'
import type { Bitacora } from '@/domain/entities/Bitacora'
import type { BitacoraFormData } from '@/application/dtos/BitacoraDTO'

export default function BitacoraPage() {
  const { isAdmin, user, profile } = useAuthStore()
  const canImport = (profile?.email ?? user?.email) === 'agomez@ofima.com'

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('__ALL__')
  const [filterPrioridad, setFilterPrioridad] = useState('__ALL__')
  const [filterEstadoFDS, setFilterEstadoFDS] = useState('__ALL__')
  const [filterSolucionado, setFilterSolucionado] = useState('__ALL__')

  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<Bitacora | null>(null)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')

  const filters = {
    ...(search ? { search } : {}),
    ...(filterEstado === '__EMPTY__'
      ? { estadoEmpty: true }
      : filterEstado !== '__ALL__'
        ? { estado: filterEstado }
        : {}),
    ...(filterPrioridad === '__EMPTY__'
      ? { prioridadEmpty: true }
      : filterPrioridad !== '__ALL__'
        ? { prioridad_servicio: filterPrioridad }
        : {}),
    ...(filterEstadoFDS === '__EMPTY__'
      ? { estadoFdsEmpty: true }
      : filterEstadoFDS !== '__ALL__'
        ? { estado_fds: filterEstadoFDS }
        : {}),
    ...(filterSolucionado === '__EMPTY__'
      ? { solucionadoEmpty: true }
      : filterSolucionado !== '__ALL__'
        ? { solucionado: filterSolucionado }
        : {}),
  }

  const pagination = { page, pageSize }

  const { data, isLoading } = useBitacoraList(filters, pagination)
  const { mutateAsync: create, isPending: creating } = useCreateBitacora()
  const { mutateAsync: update, isPending: updating } = useUpdateBitacora()
  const { mutateAsync: remove } = useDeleteBitacora()
  const { data: auditLogs } = useAuditLogs(detailOpen ? (selectedRecord?.id ?? null) : null)

  const records = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  const handleNew = useCallback(() => {
    setSelectedRecord(null)
    setEditMode('create')
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((record: Bitacora) => {
    setSelectedRecord(record)
    setEditMode('edit')
    setFormOpen(true)
  }, [])

  const handleView = useCallback((record: Bitacora) => {
    setSelectedRecord(record)
    setDetailOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await remove(id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al eliminar')
      }
    },
    [remove],
  )

  const handleFormSubmit = useCallback(
    async (formData: BitacoraFormData) => {
      try {
        if (editMode === 'create') {
          await create(formData)
          setFormOpen(false)
        } else if (selectedRecord) {
          await update({ id: selectedRecord.id, data: formData })
          setFormOpen(false)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    },
    [editMode, selectedRecord, create, update],
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bitácora</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de incidencias y novedades de migración ERP
          </p>
        </div>
        {canImport && (
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Importar Excel
          </button>
        )}
      </div>

      <BitacoraTable
        data={records}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isLoading}
        isAdmin={!!isAdmin()}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onNew={handleNew}
        filterEstado={filterEstado}
        filterPrioridad={filterPrioridad}
        filterEstadoFDS={filterEstadoFDS}
        filterSolucionado={filterSolucionado}
        search={search}
        onFilterEstado={(v) => {
          setFilterEstado(v)
          setPage(1)
        }}
        onFilterPrioridad={(v) => {
          setFilterPrioridad(v)
          setPage(1)
        }}
        onFilterEstadoFDS={(v) => {
          setFilterEstadoFDS(v)
          setPage(1)
        }}
        onFilterSolucionado={(v) => {
          setFilterSolucionado(v)
          setPage(1)
        }}
        onSearch={handleSearchChange}
      />

      <BitacoraForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={creating || updating}
        defaultValues={editMode === 'edit' ? selectedRecord ?? undefined : undefined}
        mode={editMode}
      />

      <BitacoraDetail
        record={selectedRecord}
        auditLogs={auditLogs ?? []}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  )
}
