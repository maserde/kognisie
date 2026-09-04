export type CatalogLevel = 'beginner' | 'intermediate' | 'advanced'
export interface CatalogDomain {
  id: string
  slug: string
  name: string
  description: string
  courseCount: number
}

export interface CatalogLesson {
  id: string
  slug: string
  title: string
  durationMinutes: number
}

export interface CatalogModule {
  id: string
  title: string
  lessons: CatalogLesson[]
}

export interface CatalogCourse {
  id: string
  slug: string
  domainId: string
  title: string
  description: string
  level: CatalogLevel
  durationMinutes: number
  lessonCount: number
  tags: string[]
  accent: string
  modules: CatalogModule[]
}

export interface CatalogSnapshot {
  domains: CatalogDomain[]
  courses: CatalogCourse[]
}

export interface CatalogFilters {
  query: string
  domainSlug: string | null
  level: CatalogLevel | null
}
