<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, ListTree, X } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import LessonCurriculum from '@/features/lesson/components/LessonCurriculum.vue'
import RoutePageTransition from '@/components/navigation/RoutePageTransition.vue'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import type { CatalogCourse, CatalogLesson } from '@/features/catalog/types/catalog'
import {
  canAccessLessonByCompletedLessonIds,
  getLessonsByCourse,
  getCurrentLessonByCompletedLessonIds,
} from '@/features/lesson/utils/lesson-sequencing'
import { useCatalogStore } from '@/features/catalog/stores/catalog'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

interface LessonPosition {
  lesson: CatalogLesson
  index: number
}

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const userStateStore = useUserStateStore()
const course = ref<CatalogCourse | null>(null)
const isLoading = ref(true)
const courseSlug = computed(() => String(route.params.courseSlug ?? ''))
const lessonSlug = computed(() => String(route.params.lessonSlug ?? ''))
const availableLessons = computed(() => (course.value ? getLessonsByCourse(course.value) : []))
const currentPosition = computed<LessonPosition | null>(() => {
  const index = availableLessons.value.findIndex((lesson) => lesson.slug === lessonSlug.value)
  return index >= 0 ? { lesson: availableLessons.value[index]!, index } : null
})
const previousLesson = computed(() =>
  currentPosition.value ? availableLessons.value[currentPosition.value.index - 1] : undefined,
)
const nextLesson = computed(() =>
  currentPosition.value ? availableLessons.value[currentPosition.value.index + 1] : undefined,
)

async function enforceSequentialLessonAccess(): Promise<void> {
  if (!course.value || !currentPosition.value || !userStateStore.isReady) return

  const completedLessonIds = userStateStore.getCompletedLessonIdsByCourseId(course.value.id)
  if (
    canAccessLessonByCompletedLessonIds(
      currentPosition.value.lesson,
      availableLessons.value,
      completedLessonIds,
    )
  ) {
    return
  }

  const currentLesson = getCurrentLessonByCompletedLessonIds(
    availableLessons.value,
    completedLessonIds,
  )
  if (!currentLesson) return

  await router.replace({
    name: 'lesson',
    params: { courseSlug: courseSlug.value, lessonSlug: currentLesson.slug },
  })
}

async function loadCourse(): Promise<void> {
  isLoading.value = true
  course.value = await catalogStore.getCourseBySlug(courseSlug.value)
  if (!course.value) {
    await router.replace({ name: 'catalog' })
    return
  }
  if (!currentPosition.value) {
    await router.replace({ name: 'course-detail', params: { courseSlug: courseSlug.value } })
    return
  }

  await enforceSequentialLessonAccess()
  isLoading.value = false
}

async function completeCurrentLessonAndNavigate(nextLessonSlug?: string): Promise<void> {
  if (!course.value || !currentPosition.value) return

  await userStateStore.completeLesson(course.value.id, currentPosition.value.lesson.id)
  await router.push(
    nextLessonSlug
      ? { name: 'lesson', params: { courseSlug: courseSlug.value, lessonSlug: nextLessonSlug } }
      : { name: 'course-detail', params: { courseSlug: courseSlug.value } },
  )
}

watch(courseSlug, loadCourse)
watch(() => [lessonSlug.value, userStateStore.isReady], enforceSequentialLessonAccess)
onMounted(loadCourse)
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <div v-if="isLoading" class="mx-auto flex max-w-4xl flex-col gap-4 p-8">
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-[60vh] w-full" />
    </div>

    <template v-else-if="course">
      <header
        class="sticky top-0 z-20 flex h-14 items-center border-b bg-background/95 px-3 backdrop-blur sm:px-5"
      >
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="lg:hidden" aria-label="Open course material">
              <ListTree />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[min(88vw,20rem)] p-0">
            <SheetHeader class="sr-only">
              <SheetTitle>Course material</SheetTitle>
              <SheetDescription>Navigate between lessons in this course.</SheetDescription>
            </SheetHeader>
            <LessonCurriculum :course="course" :current-lesson-slug="lessonSlug" />
          </SheetContent>
        </Sheet>

        <div class="flex min-w-0 flex-1 items-center gap-3">
          <Button as-child variant="ghost" size="icon" class="hidden lg:inline-flex">
            <RouterLink
              :to="{ name: 'course-detail', params: { courseSlug } }"
              aria-label="Back to course"
            >
              <ArrowLeft />
            </RouterLink>
          </Button>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">
              {{ currentPosition?.lesson.title ?? course.title }}
            </p>
            <p class="truncate text-xs text-muted-foreground">{{ course.title }}</p>
          </div>
        </div>

        <p v-if="currentPosition" class="hidden text-sm text-muted-foreground sm:block">
          Lesson {{ currentPosition.index + 1 }} of {{ availableLessons.length }}
        </p>
        <Button as-child variant="ghost" size="icon" class="ml-2">
          <RouterLink
            :to="{ name: 'course-detail', params: { courseSlug } }"
            aria-label="Close lesson"
          >
            <X />
          </RouterLink>
        </Button>
      </header>

      <div
        class="grid min-h-[calc(100svh-3.5rem)] lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_14rem]"
      >
        <aside class="sticky top-14 hidden h-[calc(100svh-3.5rem)] border-r bg-background lg:block">
          <LessonCurriculum :course="course" :current-lesson-slug="lessonSlug" />
        </aside>

        <main class="min-w-0 pb-24">
          <RoutePageTransition />
        </main>

        <aside
          id="lesson-table-of-contents"
          class="sticky top-14 hidden h-[calc(100svh-3.5rem)] overflow-y-auto border-l bg-background px-6 py-14 xl:block"
          aria-label="Lesson table of contents"
        />
      </div>

      <footer
        class="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-3 py-3 backdrop-blur lg:left-68 xl:right-56"
      >
        <div class="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Button v-if="previousLesson" as-child variant="outline">
            <RouterLink
              :to="{ name: 'lesson', params: { courseSlug, lessonSlug: previousLesson.slug } }"
            >
              <ArrowLeft data-icon="inline-start" />Previous
            </RouterLink>
          </Button>
          <span v-else />
          <Button v-if="nextLesson" @click="completeCurrentLessonAndNavigate(nextLesson.slug)">
            Next<ArrowRight data-icon="inline-end" />
          </Button>
          <Button v-else @click="completeCurrentLessonAndNavigate()">Finish lesson</Button>
        </div>
      </footer>
    </template>
  </div>
</template>
