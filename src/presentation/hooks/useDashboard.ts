import { useQuery } from '@tanstack/react-query'
import { SupabaseBitacoraRepository } from '@/infrastructure/repositories/SupabaseBitacoraRepository'

const bitacoraRepo = new SupabaseBitacoraRepository()

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => bitacoraRepo.getDashboardMetrics(),
    staleTime: 1000 * 60 * 2,
  })
}
