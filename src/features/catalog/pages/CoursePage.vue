<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, Clock3 } from '@lucide/vue'
import type { CatalogCourse } from '@/features/catalog/types/catalog'
import {
  getCurrentLessonByCompletedLessonIds,
  getLessonsByCourse,
} from '@/features/lesson/utils/lesson-sequencing'
import { useCatalogStore } from '@/features/catalog/stores/catalog'
import { useUserStateStore } from '@/features/user-state/stores/user-state'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{ courseSlug: string }>()
const router = useRouter()
const catalogStore = useCatalogStore()
const userStateStore = useUserStateStore()
const course = ref<CatalogCourse | null>(null)
const isLoading = ref(true)
const courseProgressPercentage = computed(() =>
  course.value
    ? userStateStore.getCourseProgressPercentage(course.value.id, course.value.lessonCount)
    : 0,
)
const isCourseStarted = computed(() =>
  course.value ? userStateStore.isCourseStarted(course.value.id) : false,
)

async function startCourse(): Promise<void> {
  if (!course.value) return

  const lessons = getLessonsByCourse(course.value)
  const targetLesson = getCurrentLessonByCompletedLessonIds(
    lessons,
    userStateStore.getCompletedLessonIdsByCourseId(course.value.id),
  )
  await userStateStore.startCourse(course.value.id, targetLesson?.id ?? null)

  if (targetLesson) {
    await router.push({
      name: 'lesson',
      params: { courseSlug: course.value.slug, lessonSlug: targetLesson.slug },
    })
  }
}

async function loadCourse(): Promise<void> {
  isLoading.value = true
  course.value = await catalogStore.getCourseBySlug(props.courseSlug)
  if (course.value && userStateStore.isCourseStarted(course.value.id)) {
    await userStateStore.touchCourse(course.value.id)
  }
  isLoading.value = false
}

watch(() => props.courseSlug, loadCourse)
onMounted(loadCourse)
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div v-if="isLoading" class="flex flex-col gap-5">
      <Skeleton class="h-5 w-32" />
      <Skeleton class="h-14 w-3/4" />
      <Skeleton class="h-36 w-full rounded-2xl" />
    </div>

    <div v-else-if="course" class="flex flex-col gap-8">
      <Button as-child variant="ghost" class="w-fit">
        <RouterLink to="/catalog"><ArrowLeft data-icon="inline-start" />Back to catalog</RouterLink>
      </Button>

      <header
        class="grid gap-8 rounded-3xl border bg-card p-6 shadow-sm lg:grid-cols-[1fr_18rem] lg:p-9"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Badge class="capitalize">{{ course.level }}</Badge>
            <Badge v-for="tag in course.tags" :key="tag" variant="outline">{{ tag }}</Badge>
          </div>
          <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">{{ course.title }}</h1>
          <p class="max-w-2xl text-lg leading-8 text-muted-foreground">{{ course.description }}</p>
        </div>
        <aside class="flex flex-col justify-between gap-6 rounded-2xl bg-muted p-5">
          <div class="flex flex-col gap-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Lessons</span
              ><strong>{{ course.lessonCount }}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Duration</span
              ><strong>{{ course.durationMinutes }} min</strong>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Course progress</span><span>{{ courseProgressPercentage }}%</span>
            </div>
            <Progress :model-value="courseProgressPercentage" />
          </div>
          <Button @click="startCourse">{{
            isCourseStarted ? 'Continue learning' : 'Start course'
          }}</Button>
        </aside>
      </header>

      <section class="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <h2 class="mb-4 text-2xl font-semibold tracking-tight">Course material</h2>
          <Accordion
            type="multiple"
            :default-value="course.modules.map((module) => module.id)"
            class="rounded-2xl border px-5"
          >
            <AccordionItem v-for="module in course.modules" :key="module.id" :value="module.id">
              <AccordionTrigger>
                <span class="text-left">{{ module.title }}</span>
              </AccordionTrigger>
              <AccordionContent>
                <ol class="flex flex-col gap-1 pb-2">
                  <li v-for="lesson in module.lessons" :key="lesson.id">
                    <RouterLink
                      :to="{
                        name: 'lesson',
                        params: { courseSlug: course.slug, lessonSlug: lesson.slug },
                      }"
                      class="flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-muted"
                    >
                      <div class="flex min-w-0 items-center gap-3">
                        <CheckCircle2 class="size-4 shrink-0 text-primary" />
                        <span class="truncate text-sm font-medium">{{ lesson.title }}</span>
                      </div>
                      <span class="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
                        ><Clock3 class="size-3" />{{ lesson.durationMinutes }} min</span
                      >
                    </RouterLink>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <aside class="rounded-2xl border p-5 lg:sticky lg:top-20 lg:self-start">
          <p class="font-medium">What you will practice</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Predict outcomes, manipulate visual systems, explain what changed, and transfer the
            concept to a new challenge.
          </p>
        </aside>
      </section>
    </div>

    <div v-else class="rounded-2xl border p-8 text-center">
      <h1 class="text-2xl font-semibold">Course not found</h1>
      <p class="mt-2 text-muted-foreground">This course may have moved or is not available yet.</p>
      <Button as-child class="mt-5"><RouterLink to="/catalog">Browse catalog</RouterLink></Button>
    </div>
  </div>
</template>
