import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SupabaseCatalogRepository } from '@/infrastructure/repositories/SupabaseCatalogRepository'
import type { CatalogCreate, CatalogUpdate } from '@/domain/entities/Catalog'

const repo = new SupabaseCatalogRepository()

export const CATALOG_QUERY_KEY = 'catalogs'

export function useCatalogOptions(category: string) {
  return useQuery({
    queryKey: [CATALOG_QUERY_KEY, category],
    queryFn: () => repo.getByCategory(category),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCatalogCounts() {
  return useQuery({
    queryKey: [CATALOG_QUERY_KEY, 'counts'],
    queryFn: () => repo.getAllWithCounts(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CatalogCreate) => repo.create(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEY] })
      toast.success(`"${item.value}" agregado correctamente`)
    },
    onError: (err: Error) => {
      toast.error(`Error al agregar: ${err.message}`)
    },
  })
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CatalogUpdate }) => repo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEY] })
      toast.success('Elemento actualizado')
    },
    onError: (err: Error) => {
      toast.error(`Error al actualizar: ${err.message}`)
    },
  })
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => repo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEY] })
      toast.success('Elemento eliminado')
    },
    onError: (err: Error) => {
      toast.error(`Error al eliminar: ${err.message}`)
    },
  })
}
