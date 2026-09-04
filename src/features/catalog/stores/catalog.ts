import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  CatalogCourse,
  CatalogDomain,
  CatalogFilters,
  CatalogLevel,
} from '@/features/catalog/types/catalog'
import { catalogRepository } from '@/features/catalog/repositories'

export const useCatalogStore = defineStore('catalog', () => {
  const domains = ref<CatalogDomain[]>([])
  const courses = ref<CatalogCourse[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const filters = ref<CatalogFilters>({ query: '', domainSlug: null, level: null })

  const filteredCourses = computed(() => {
    const normalizedQuery = filters.value.query.trim().toLowerCase()
    const domain = domains.value.find(({ slug }) => slug === filters.value.domainSlug)

    return courses.value.filter((course) => {
      const matchesDomain = !domain || course.domainId === domain.id
      const matchesLevel = !filters.value.level || course.level === filters.value.level
      const searchableText = [course.title, course.description, ...course.tags]
        .join(' ')
        .toLowerCase()
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery)

      return matchesDomain && matchesLevel && matchesQuery
    })
  })

  async function loadCatalog(): Promise<void> {
    if (courses.value.length > 0 || isLoading.value) return

    isLoading.value = true
    errorMessage.value = null

    try {
      const catalog = await catalogRepository.getCatalog()
      domains.value = catalog.domains
      courses.value = catalog.courses
    } catch {
      errorMessage.value = 'The catalog could not be loaded. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  async function getCourseBySlug(courseSlug: string): Promise<CatalogCourse | null> {
    const cachedCourse = courses.value.find((course) => course.slug === courseSlug)
    return cachedCourse ?? catalogRepository.getCourseBySlug(courseSlug)
  }

  function setQuery(query: string): void {
    filters.value.query = query
  }

  function setDomain(domainSlug: string | null): void {
    filters.value.domainSlug = domainSlug
  }

  function setLevel(level: CatalogLevel | null): void {
    filters.value.level = level
  }

  function clearFilters(): void {
    filters.value = { query: '', domainSlug: null, level: null }
  }

  return {
    domains,
    courses,
    isLoading,
    errorMessage,
    filters,
    filteredCourses,
    loadCatalog,
    getCourseBySlug,
    setQuery,
    setDomain,
    setLevel,
    clearFilters,
  }
})
