import { supabase } from '../supabase/client'
import type { ICatalogRepository } from '@/domain/repositories/ICatalogRepository'
import type { Catalog, CatalogCreate, CatalogUpdate } from '@/domain/entities/Catalog'

export class SupabaseCatalogRepository implements ICatalogRepository {
  private readonly table = 'catalogs'

  async getByCategory(category: string): Promise<Catalog[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('category', category)
      .order('order_index', { ascending: true })
      .order('value', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as Catalog[]) ?? []
  }

  async getAllWithCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from(this.table)
      .select('category')

    if (error) throw new Error(error.message)

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      counts[row.category] = (counts[row.category] ?? 0) + 1
    }
    return counts
  }

  async create(data: CatalogCreate): Promise<Catalog> {
    const { data: created, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return created as Catalog
  }

  async update(id: number, data: CatalogUpdate): Promise<Catalog> {
    const { data: updated, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return updated as Catalog
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
}
