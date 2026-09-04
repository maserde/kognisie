<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useWindowScroll, watchDebounced } from '@vueuse/core'
import { List } from '@lucide/vue'
import { MarkdownDocument } from '@comark/vue'
import type { Toc, TocLink } from 'comark/plugins/toc'
import LessonTableOfContents from '@/features/lesson/components/LessonTableOfContents.vue'
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
import type { LessonContent } from '@/features/lesson/types/lesson-content'
import { lessonContentRepository } from '@/features/lesson/repositories'
import { lessonWidgetComponents } from '@/features/lesson/widgets/widget-registry'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const props = defineProps<{
  courseSlug: string
  lessonSlug: string
}>()

const userStateStore = useUserStateStore()
const lessonContent = ref<LessonContent | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const { y: scrollY } = useWindowScroll()
const tocLinks = computed<TocLink[]>(() => {
  const toc = lessonContent.value?.document.meta.toc as Toc | undefined
  return toc?.links ?? []
})

async function restoreScrollPosition(): Promise<void> {
  if (!lessonContent.value) return

  await nextTick()
  window.scrollTo({
    top: userStateStore.getLessonScrollPosition(lessonContent.value.frontmatter.lessonId),
    behavior: 'auto',
  })
}

async function loadLesson(): Promise<void> {
  isLoading.value = true
  errorMessage.value = null

  try {
    lessonContent.value = await lessonContentRepository.getLessonByCourseAndSlug(
      props.courseSlug,
      props.lessonSlug,
    )
    await restoreScrollPosition()
  } catch {
    lessonContent.value = null
    errorMessage.value = 'This lesson could not be loaded.'
  } finally {
    isLoading.value = false
  }
}

watch(() => [props.courseSlug, props.lessonSlug], loadLesson)
watchDebounced(
  scrollY,
  (position) => {
    if (!lessonContent.value) return
    void userStateStore.setLessonScrollPosition(lessonContent.value.frontmatter.lessonId, position)
  },
  { debounce: 300, maxWait: 1000 },
)
onMounted(loadLesson)
</script>

<template>
  <div v-if="isLoading" class="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-10 sm:py-14">
    <Skeleton class="h-10 w-3/4" />
    <Skeleton class="h-5 w-full" />
    <Skeleton class="h-5 w-5/6" />
    <Skeleton class="mt-6 h-80 w-full rounded-3xl" />
  </div>

  <div v-else-if="lessonContent" class="w-full px-5 py-9 sm:px-8 sm:py-14 lg:px-10">
    <article class="lesson-prose mx-auto min-w-0 w-full max-w-[82ch]">
      <div v-if="tocLinks.length" class="mb-7 flex justify-end xl:hidden">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="sm"
              ><List data-icon="inline-start" />On this page</Button
            >
          </SheetTrigger>
          <SheetContent side="right" class="w-[min(88vw,20rem)] gap-0 p-0">
            <SheetHeader class="border-b px-5 py-5 pr-14">
              <SheetTitle>On this page</SheetTitle>
              <SheetDescription>Jump to a section in this lesson.</SheetDescription>
            </SheetHeader>
            <div class="overflow-y-auto px-5 py-6">
              <LessonTableOfContents :links="tocLinks" />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Suspense>
        <MarkdownDocument :value="lessonContent.document" :components="lessonWidgetComponents" />
        <template #fallback>
          <div class="flex flex-col gap-4" aria-label="Loading lesson content">
            <Skeleton class="h-10 w-3/4" />
            <Skeleton class="h-5 w-full" />
            <Skeleton class="h-5 w-5/6" />
          </div>
        </template>
      </Suspense>
    </article>

    <Teleport v-if="tocLinks.length" to="#lesson-table-of-contents">
      <LessonTableOfContents :links="tocLinks" />
    </Teleport>
  </div>

  <div v-else class="mx-auto max-w-2xl px-5 py-20 text-center">
    <h1 class="text-3xl font-semibold">Lesson unavailable</h1>
    <p class="mt-3 text-muted-foreground">
      {{ errorMessage ?? 'This lesson has not been published yet.' }}
    </p>
    <Button as-child class="mt-6"
      ><RouterLink :to="{ name: 'course-detail', params: { courseSlug: props.courseSlug } }"
        >Back to course</RouterLink
      ></Button
    >
  </div>
</template>
