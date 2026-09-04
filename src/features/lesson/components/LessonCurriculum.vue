<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, CircleDot, LockKeyhole } from '@lucide/vue'
import type { CatalogCourse } from '@/features/catalog/types/catalog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  canAccessLessonByCompletedLessonIds,
  getLessonsByCourse,
} from '@/features/lesson/utils/lesson-sequencing'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const props = defineProps<{
  course: CatalogCourse
  currentLessonSlug: string
}>()

const userStateStore = useUserStateStore()
const availableLessons = computed(() => getLessonsByCourse(props.course))
const completedLessonIds = computed(() =>
  userStateStore.getCompletedLessonIdsByCourseId(props.course.id),
)

function isLessonCompleted(lessonId: string): boolean {
  return completedLessonIds.value.includes(lessonId)
}

function isLessonAccessible(lessonId: string): boolean {
  const lesson = availableLessons.value.find((availableLesson) => availableLesson.id === lessonId)
  return lesson
    ? canAccessLessonByCompletedLessonIds(lesson, availableLessons.value, completedLessonIds.value)
    : false
}
</script>

<template>
  <div class="flex h-full flex-col bg-muted/20">
    <div class="border-b p-5">
      <RouterLink
        :to="{ name: 'course-detail', params: { courseSlug: props.course.slug } }"
        class="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {{ props.course.title }}
      </RouterLink>
      <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Course progress</span>
        <span
          >{{
            userStateStore.getCourseProgressPercentage(props.course.id, props.course.lessonCount)
          }}%</span
        >
      </div>
      <Progress
        class="mt-2"
        :model-value="
          userStateStore.getCourseProgressPercentage(props.course.id, props.course.lessonCount)
        "
      />
    </div>

    <ScrollArea class="min-h-0 flex-1">
      <nav class="flex flex-col gap-6 p-4" aria-label="Course lesson sequence">
        <section v-for="module in props.course.modules" :key="module.id">
          <h2 class="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {{ module.title }}
          </h2>
          <ol class="mt-2 flex flex-col gap-1">
            <li v-for="lesson in module.lessons" :key="lesson.id">
              <RouterLink
                v-if="isLessonAccessible(lesson.id)"
                :to="{
                  name: 'lesson',
                  params: { courseSlug: props.course.slug, lessonSlug: lesson.slug },
                }"
                class="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                :class="{
                  'bg-muted font-medium text-foreground': lesson.slug === props.currentLessonSlug,
                }"
                :aria-current="lesson.slug === props.currentLessonSlug ? 'step' : undefined"
              >
                <CheckCircle2
                  v-if="isLessonCompleted(lesson.id)"
                  class="mt-0.5 size-4 shrink-0 text-primary"
                />
                <CircleDot v-else class="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{{ lesson.title }}</span>
              </RouterLink>
              <div
                v-else
                class="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm text-muted-foreground opacity-60"
                aria-disabled="true"
              >
                <LockKeyhole class="mt-0.5 size-4 shrink-0" />
                <span>{{ lesson.title }}</span>
              </div>
            </li>
          </ol>
        </section>
      </nav>
    </ScrollArea>
  </div>
</template>
