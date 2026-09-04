import type { CatalogRepository } from '@/features/catalog/repositories/CatalogRepository'
import { MarkdownCatalogRepository } from '@/features/catalog/repositories/MarkdownCatalogRepository'

export const catalogRepository: CatalogRepository = new MarkdownCatalogRepository()
