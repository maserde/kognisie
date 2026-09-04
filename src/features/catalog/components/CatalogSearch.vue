<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { BookOpen, Search } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCatalogStore } from '@/features/catalog/stores/catalog'

const router = useRouter()
const catalogStore = useCatalogStore()
const isOpen = ref(false)
const courses = computed(() => catalogStore.courses)

function openSearch(): void {
  isOpen.value = true
}

async function selectCourse(courseSlug: string): Promise<void> {
  isOpen.value = false
  await router.push({ name: 'course-detail', params: { courseSlug } })
}

onKeyStroke('k', (event) => {
  if (!event.metaKey && !event.ctrlKey) return

  event.preventDefault()
  openSearch()
})

onMounted(catalogStore.loadCatalog)
</script>

<template>
  <Button
    variant="outline"
    class="h-9 justify-start gap-2 text-muted-foreground"
    @click="openSearch"
  >
    <Search data-icon="inline-start" />
    <span class="hidden sm:inline">Search courses</span>
    <span class="ml-2 hidden rounded border px-1.5 py-0.5 text-xs lg:inline-flex">⌘ K</span>
  </Button>

  <CommandDialog v-model:open="isOpen">
    <CommandInput placeholder="Search courses, skills, or topics..." />
    <CommandList>
      <CommandEmpty>No matching course found.</CommandEmpty>
      <CommandGroup heading="Courses">
        <CommandItem
          v-for="course in courses"
          :key="course.id"
          :value="`${course.title} ${course.tags.join(' ')}`"
          @select="selectCourse(course.slug)"
        >
          <BookOpen />
          <div class="flex min-w-0 flex-col">
            <span class="truncate font-medium">{{ course.title }}</span>
            <span class="truncate text-xs text-muted-foreground">{{ course.description }}</span>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
