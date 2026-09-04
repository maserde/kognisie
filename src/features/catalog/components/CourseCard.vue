<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Clock3, Layers3 } from '@lucide/vue'
import type { CatalogCourse } from '@/features/catalog/types/catalog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const props = defineProps<{ course: CatalogCourse }>()
const userStateStore = useUserStateStore()
const progressPercentage = computed(() =>
  userStateStore.getCourseProgressPercentage(props.course.id, props.course.lessonCount),
)
const isStarted = computed(() => userStateStore.isCourseStarted(props.course.id))
</script>

<template>
  <Card class="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
    <div :class="['h-1.5', `course-accent-${props.course.accent}`]" />
    <CardHeader class="gap-3">
      <div class="flex items-center justify-between gap-3">
        <Badge variant="secondary" class="capitalize">{{ props.course.level }}</Badge>
        <span class="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 class="size-3.5" />
          {{ props.course.durationMinutes }} min
        </span>
      </div>
      <div class="flex flex-col gap-2">
        <CardTitle class="text-xl">{{ props.course.title }}</CardTitle>
        <CardDescription class="line-clamp-2 leading-6">{{
          props.course.description
        }}</CardDescription>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2">
        <Badge v-for="tag in props.course.tags" :key="tag" variant="outline">{{ tag }}</Badge>
      </div>
      <div v-if="progressPercentage > 0" class="flex flex-col gap-2">
        <div class="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{{ progressPercentage }}%</span>
        </div>
        <Progress :model-value="progressPercentage" />
      </div>
    </CardContent>
    <CardFooter class="mt-auto flex items-center justify-between border-t pt-4">
      <span class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Layers3 class="size-4" />
        {{ props.course.lessonCount }} lessons
      </span>
      <Button as-child variant="ghost" size="sm">
        <RouterLink :to="{ name: 'course-detail', params: { courseSlug: props.course.slug } }">
          {{ isStarted ? 'Continue' : 'View course' }}
          <ArrowRight data-icon="inline-end" />
        </RouterLink>
      </Button>
    </CardFooter>
  </Card>
</template>
