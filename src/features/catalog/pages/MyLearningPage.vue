<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BookOpenCheck, SearchX } from '@lucide/vue'
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
import type { CatalogCourse } from '@/features/catalog/types/catalog'
import { useCatalogStore } from '@/features/catalog/stores/catalog'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

type LearningStatus = 'not-started' | 'in-progress' | 'completed'
type LearningStatusFilter = 'all' | LearningStatus

interface LearningStatusGroup {
  status: LearningStatus
  title: string
  courses: CatalogCourse[]
}

interface LearningDomainGroup {
  domainId: string
  domainName: string
  domainDescription: string
  statusGroups: LearningStatusGroup[]
  courseCount: number
}

const catalogStore = useCatalogStore()
const userStateStore = useUserStateStore()
const searchQuery = ref('')
const selectedStatus = ref<LearningStatusFilter>('all')

const startedCourses = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()
  const coursesById = new Map(catalogStore.courses.map((course) => [course.id, course]))

  return userStateStore
    .getStartedCourseIdsByRecentAccess()
    .map((courseId) => coursesById.get(courseId))
    .filter((course): course is CatalogCourse => course !== undefined)
    .filter((course) => {
      const searchableText = [course.title, course.description, ...course.tags]
        .join(' ')
        .toLowerCase()
      return !normalizedQuery || searchableText.includes(normalizedQuery)
    })
})

const statusDefinitions: Array<Omit<LearningStatusGroup, 'courses'>> = [
  { status: 'in-progress', title: 'In progress' },
  { status: 'not-started', title: 'Ready to begin' },
  { status: 'completed', title: 'Completed' },
]

const domainGroups = computed<LearningDomainGroup[]>(() =>
  catalogStore.domains
    .map((domain) => {
      const domainCourses = startedCourses.value.filter((course) => course.domainId === domain.id)
      const statusGroups = statusDefinitions
        .map((definition) => ({
          ...definition,
          courses: domainCourses.filter(
            (course) => getLearningStatusByCourse(course) === definition.status,
          ),
        }))
        .filter(
          (group) =>
            group.courses.length > 0 &&
            (selectedStatus.value === 'all' || selectedStatus.value === group.status),
        )

      return {
        domainId: domain.id,
        domainName: domain.name,
        domainDescription: domain.description,
        courseCount: statusGroups.reduce((total, group) => total + group.courses.length, 0),
        statusGroups,
      }
    })
    .filter((group) => group.courseCount > 0),
)

const visibleCourseCount = computed(() =>
  domainGroups.value.reduce((total, group) => total + group.courseCount, 0),
)
const learningResultsKey = computed(() =>
  [selectedStatus.value, searchQuery.value.trim().toLowerCase()].join(':'),
)

function getLearningStatusByCourse(course: CatalogCourse): LearningStatus {
  const progressPercentage = userStateStore.getCourseProgressPercentage(
    course.id,
    course.lessonCount,
  )

  if (progressPercentage >= 100) return 'completed'
  if (progressPercentage > 0) return 'in-progress'
  return 'not-started'
}

function clearFilters(): void {
  searchQuery.value = ''
  selectedStatus.value = 'all'
}

onMounted(catalogStore.loadCatalog)
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8">
    <header class="flex flex-col gap-5 rounded-3xl border bg-card p-6 shadow-sm sm:p-9">
      <div class="max-w-3xl">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          My learning
        </p>
        <h1 class="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything you are learning, in one place.
        </h1>
        <p class="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Resume recent work, find an enrolled course, or revisit something you completed.
        </p>
      </div>
    </header>

    <section class="flex flex-col gap-6" aria-labelledby="learning-heading">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Your courses</p>
          <h2 id="learning-heading" class="text-2xl font-semibold tracking-tight">
            {{ visibleCourseCount }} courses
          </h2>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <Input
            v-model="searchQuery"
            class="sm:w-72"
            placeholder="Search your courses..."
            aria-label="Search your courses"
          />
          <Select v-model="selectedStatus">
            <SelectTrigger class="sm:w-48" aria-label="Filter by learning status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="not-started">Ready to begin</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Transition name="learning-results" mode="out-in">
        <div :key="learningResultsKey">
          <div
            v-if="catalogStore.isLoading || !userStateStore.isReady"
            class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            <Skeleton v-for="index in 3" :key="index" class="h-80 rounded-2xl" />
          </div>

          <div v-else-if="domainGroups.length" class="flex flex-col gap-12">
            <section
              v-for="domainGroup in domainGroups"
              :key="domainGroup.domainId"
              class="flex flex-col gap-6"
              :aria-labelledby="`learning-domain-${domainGroup.domainId}`"
            >
              <div
                class="flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <h3
                    :id="`learning-domain-${domainGroup.domainId}`"
                    class="text-xl font-semibold tracking-tight"
                  >
                    {{ domainGroup.domainName }}
                  </h3>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ domainGroup.domainDescription }}
                  </p>
                </div>
                <span class="mt-2 text-sm text-muted-foreground sm:mt-0">
                  {{ domainGroup.courseCount }}
                  {{ domainGroup.courseCount === 1 ? 'course' : 'courses' }}
                </span>
              </div>

              <div
                v-for="statusGroup in domainGroup.statusGroups"
                :key="statusGroup.status"
                class="flex flex-col gap-4"
              >
                <h4 class="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {{ statusGroup.title }}
                </h4>
                <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <CourseCard
                    v-for="course in statusGroup.courses"
                    :key="course.id"
                    :course="course"
                  />
                </div>
              </div>
            </section>
          </div>

          <Empty v-else class="rounded-2xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX v-if="searchQuery || selectedStatus !== 'all'" />
                <BookOpenCheck v-else />
              </EmptyMedia>
              <EmptyTitle>
                {{
                  searchQuery || selectedStatus !== 'all'
                    ? 'No courses match'
                    : 'Start your first course'
                }}
              </EmptyTitle>
              <EmptyDescription>
                {{
                  searchQuery || selectedStatus !== 'all'
                    ? 'Try another search or clear the current filters.'
                    : 'Courses appear here after you start learning.'
                }}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                v-if="searchQuery || selectedStatus !== 'all'"
                variant="outline"
                @click="clearFilters"
              >
                Clear filters
              </Button>
              <Button v-else as-child>
                <RouterLink to="/catalog">Browse catalog</RouterLink>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.learning-results-enter-active,
.learning-results-leave-active {
  transition:
    opacity 160ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.learning-results-enter-from {
  opacity: 0;
  transform: translateY(0.375rem);
}

.learning-results-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@media (prefers-reduced-motion: reduce) {
  .learning-results-enter-active,
  .learning-results-leave-active {
    transition-duration: 1ms;
  }

  .learning-results-enter-from,
  .learning-results-leave-to {
    transform: none;
  }
}
</style>
