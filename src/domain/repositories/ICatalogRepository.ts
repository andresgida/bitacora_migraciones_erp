import type { Catalog, CatalogCreate, CatalogUpdate } from '../entities/Catalog'

export interface ICatalogRepository {
  getByCategory(category: string): Promise<Catalog[]>
  getAllWithCounts(): Promise<Record<string, number>>
  create(data: CatalogCreate): Promise<Catalog>
  update(id: number, data: CatalogUpdate): Promise<Catalog>
  delete(id: number): Promise<void>
}
