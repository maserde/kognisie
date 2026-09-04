import type { CatalogLevel } from '@/features/catalog/types/catalog'

export interface CatalogDomainMetadata {
  id: string
  slug: string
  name: string
  description: string
}

export interface CatalogModuleMetadata {
  id: string
  title: string
}

export interface CatalogCourseMetadata {
  id: string
  slug: string
  domainId: string
  title: string
  description: string
  level: CatalogLevel
  tags: string[]
  accent: string
  modules: CatalogModuleMetadata[]
}

export const catalogMetadata: {
  domains: CatalogDomainMetadata[]
  courses: CatalogCourseMetadata[]
} = {
  domains: [
    {
      id: 'domain-frontend',
      slug: 'frontend',
      name: 'Frontend',
      description: 'Build accessible, responsive interfaces for the web.',
    },
    {
      id: 'domain-backend',
      slug: 'backend',
      name: 'Backend',
      description: 'Design dependable APIs, data models, and services.',
    },
  ],
  courses: [
    {
      id: 'course-css-foundations',
      slug: 'css-foundations',
      domainId: 'domain-frontend',
      title: 'CSS Foundations',
      description: 'Build visual intuition for sizing, spacing, flow, and layout behavior.',
      level: 'beginner',
      tags: ['CSS', 'Layout', 'Interactive'],
      accent: 'amber',
      modules: [
        { id: 'module-box-model', title: 'The box model' },
        { id: 'module-flow', title: 'Normal flow' },
      ],
    },
  ],
}
