import type { CatalogCourse, CatalogSnapshot } from '@/features/catalog/types/catalog'

export interface CatalogRepository {
  getCatalog(): Promise<CatalogSnapshot>
  getCourseBySlug(courseSlug: string): Promise<CatalogCourse | null>
}
