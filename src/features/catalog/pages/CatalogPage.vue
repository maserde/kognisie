<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { SearchX } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import CourseCard from '@/features/catalog/components/CourseCard.vue'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { CatalogLevel } from '@/features/catalog/types/catalog'
import { useCatalogStore } from '@/features/catalog/stores/catalog'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const { domains, filteredCourses, isLoading, errorMessage } = storeToRefs(catalogStore)
const searchQuery = ref('')
const selectedDomainSlug = ref('all')
const selectedLevel = ref('all')
const selectedDomain = computed(() =>
  domains.value.find((domain) => domain.slug === catalogStore.filters.domainSlug),
)
const courseGroups = computed(() =>
  domains.value
    .map((domain) => ({
      domain,
      courses: filteredCourses.value.filter((course) => course.domainId === domain.id),
    }))
    .filter((group) => group.courses.length > 0),
)
const catalogResultsKey = computed(() =>
  [
    catalogStore.filters.domainSlug ?? 'all-domains',
    catalogStore.filters.level ?? 'all-levels',
    catalogStore.filters.query.trim().toLowerCase(),
  ].join(':'),
)

function readQueryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function updateRouteQuery(changes: Record<string, string | undefined>): Promise<void> {
  await router.replace({
    query: {
      ...route.query,
      ...changes,
    },
  })
}

function clearFilters(): void {
  searchQuery.value = ''
  selectedDomainSlug.value = 'all'
  selectedLevel.value = 'all'
  catalogStore.clearFilters()
  void router.replace({ name: 'catalog' })
}

watch(
  () => route.query,
  (query) => {
    const domain = readQueryValue(query.domain) || null
    const level = readQueryValue(query.level)
    const search = readQueryValue(query.q)

    searchQuery.value = search
    selectedDomainSlug.value = domain ?? 'all'
    selectedLevel.value = level || 'all'
    catalogStore.setQuery(search)
    catalogStore.setDomain(domain)
    catalogStore.setLevel(
      level === 'beginner' || level === 'intermediate' || level === 'advanced' ? level : null,
    )
  },
  { immediate: true },
)

watchDebounced(
  searchQuery,
  (query) => {
    catalogStore.setQuery(query)
    void updateRouteQuery({ q: query || undefined })
  },
  { debounce: 250 },
)

watch(selectedDomainSlug, (domainSlug) => {
  const domain = domainSlug === 'all' ? null : domainSlug
  catalogStore.setDomain(domain)
  void updateRouteQuery({ domain: domain ?? undefined })
})

watch(selectedLevel, (level) => {
  const catalogLevel = level === 'all' ? null : (level as CatalogLevel)
  catalogStore.setLevel(catalogLevel)
  void updateRouteQuery({ level: catalogLevel ?? undefined })
})

onMounted(catalogStore.loadCatalog)
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8">
    <section class="overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-9">
      <div class="max-w-3xl">
        <p class="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Kognisie catalog
        </p>
        <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
          Learn technical concepts by changing the system yourself.
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Choose a course, predict what happens, manipulate the variables, and build intuition
          through immediate feedback.
        </p>
      </div>
    </section>

    <section class="flex flex-col gap-5" aria-labelledby="catalog-heading">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm text-muted-foreground">{{ selectedDomain?.name ?? 'All domains' }}</p>
          <h2 id="catalog-heading" class="text-2xl font-semibold tracking-tight">
            {{ filteredCourses.length }} courses to explore
          </h2>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <Input
            v-model="searchQuery"
            class="sm:w-72"
            placeholder="Filter courses..."
            aria-label="Filter courses"
          />
          <Select v-model="selectedDomainSlug">
            <SelectTrigger class="sm:w-44" aria-label="Filter by domain">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All domains</SelectItem>
                <SelectItem v-for="domain in domains" :key="domain.id" :value="domain.slug">
                  {{ domain.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select v-model="selectedLevel">
            <SelectTrigger class="sm:w-44" aria-label="Filter by level">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Transition name="catalog-results" mode="out-in">
        <div :key="catalogResultsKey">
          <div v-if="isLoading" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton v-for="index in 6" :key="index" class="h-80 rounded-2xl" />
          </div>

          <div
            v-else-if="errorMessage"
            class="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-destructive"
          >
            {{ errorMessage }}
          </div>

          <div v-else-if="filteredCourses.length" class="flex flex-col gap-10">
            <section
              v-for="group in courseGroups"
              :key="group.domain.id"
              class="flex flex-col gap-4"
              :aria-labelledby="`domain-${group.domain.id}`"
            >
              <div
                class="flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <h3
                    :id="`domain-${group.domain.id}`"
                    class="text-xl font-semibold tracking-tight"
                  >
                    {{ group.domain.name }}
                  </h3>
                  <p class="mt-1 text-sm text-muted-foreground">{{ group.domain.description }}</p>
                </div>
                <span class="mt-2 text-sm text-muted-foreground sm:mt-0">
                  {{ group.courses.length }} {{ group.courses.length === 1 ? 'course' : 'courses' }}
                </span>
              </div>
              <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <CourseCard v-for="course in group.courses" :key="course.id" :course="course" />
              </div>
            </section>
          </div>

          <Empty v-else class="rounded-2xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
              <EmptyTitle>No courses match</EmptyTitle>
              <EmptyDescription
                >Try a broader keyword or clear the current filters.</EmptyDescription
              >
            </EmptyHeader>
            <EmptyContent
              ><Button variant="outline" @click="clearFilters">Clear filters</Button></EmptyContent
            >
          </Empty>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.catalog-results-enter-active,
.catalog-results-leave-active {
  transition:
    opacity 160ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.catalog-results-enter-from {
  opacity: 0;
  transform: translateY(0.375rem);
}

.catalog-results-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@media (prefers-reduced-motion: reduce) {
  .catalog-results-enter-active,
  .catalog-results-leave-active {
    transition-duration: 1ms;
  }

  .catalog-results-enter-from,
  .catalog-results-leave-to {
    transform: none;
  }
}
</style>
