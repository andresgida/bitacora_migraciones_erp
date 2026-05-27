import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SupabaseBitacoraRepository } from '@/infrastructure/repositories/SupabaseBitacoraRepository'
import { SupabaseAuditLogRepository } from '@/infrastructure/repositories/SupabaseAuditLogRepository'
import { CreateBitacoraUseCase } from '@/application/use-cases/bitacora/CreateBitacora'
import { UpdateBitacoraUseCase } from '@/application/use-cases/bitacora/UpdateBitacora'
import { DeleteBitacoraUseCase } from '@/application/use-cases/bitacora/DeleteBitacora'
import { useAuthStore } from '../stores/authStore'
import type { BitacoraFilters, PaginationParams } from '@/domain/repositories/IBitacoraRepository'
import type { BitacoraCreate, BitacoraUpdate, Bitacora } from '@/domain/entities/Bitacora'
import type { BitacoraFormData } from '@/application/dtos/BitacoraDTO'

const bitacoraRepo = new SupabaseBitacoraRepository()
const auditRepo = new SupabaseAuditLogRepository()
const createUC = new CreateBitacoraUseCase(bitacoraRepo, auditRepo)
const updateUC = new UpdateBitacoraUseCase(bitacoraRepo, auditRepo)
const deleteUC = new DeleteBitacoraUseCase(bitacoraRepo, auditRepo)

export const BITACORA_QUERY_KEY = 'bitacora'

export function useBitacoraList(
  filters?: BitacoraFilters,
  pagination?: PaginationParams,
  orderBy?: keyof Bitacora,
  orderDir?: 'asc' | 'desc',
) {
  return useQuery({
    queryKey: [BITACORA_QUERY_KEY, 'list', filters, pagination, orderBy, orderDir],
    queryFn: () => bitacoraRepo.getAll(filters, pagination, orderBy, orderDir),
  })
}

export function useBitacoraById(id: number | null) {
  return useQuery({
    queryKey: [BITACORA_QUERY_KEY, 'detail', id],
    queryFn: () => (id ? bitacoraRepo.getById(id) : null),
    enabled: !!id,
  })
}

export function useAuditLogs(recordId: number | null) {
  return useQuery({
    queryKey: [BITACORA_QUERY_KEY, 'audit', recordId],
    queryFn: () => (recordId ? auditRepo.getByRecordId(recordId, 'bitacora') : []),
    enabled: !!recordId,
  })
}

export function useCreateBitacora() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: (data: BitacoraFormData) =>
      createUC.execute(
        { ...data, created_by: user?.id ?? null } as BitacoraCreate,
        user?.id,
        profile?.email ?? user?.email,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BITACORA_QUERY_KEY] })
      toast.success('Registro creado exitosamente')
    },
    onError: (err: Error) => {
      toast.error(`Error al crear: ${err.message}`)
    },
  })
}

export function useUpdateBitacora() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BitacoraFormData }) =>
      updateUC.execute(id, data as BitacoraUpdate, user?.id, profile?.email ?? user?.email),
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: [BITACORA_QUERY_KEY] })
      toast.success('Registro actualizado exitosamente')
      if (updatedRecord.prioridad_servicio === 'SOLUCIONADO' && !updatedRecord.solucionado) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [BITACORA_QUERY_KEY] })
        }, 3000)
      }
    },
    onError: (err: Error) => {
      toast.error(`Error al actualizar: ${err.message}`)
    },
  })
}

export function useDeleteBitacora() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: (id: number) =>
      deleteUC.execute(id, user?.id, profile?.email ?? user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BITACORA_QUERY_KEY] })
      toast.success('Registro eliminado exitosamente')
    },
    onError: (err: Error) => {
      toast.error(`Error al eliminar: ${err.message}`)
    },
  })
}
