<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BookOpen, BookOpenCheck, LayoutGrid, PlayCircle, Server } from '@lucide/vue'
import { useRoute } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalogStore } from '@/features/catalog/stores/catalog'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const route = useRoute()
const catalogStore = useCatalogStore()
const userStateStore = useUserStateStore()
const selectedDomain = computed(() =>
  typeof route.query.domain === 'string' ? route.query.domain : null,
)
const domainIcons = { frontend: LayoutGrid, backend: Server }
const startedCourseIds = computed(() => userStateStore.getStartedCourseIdsByRecentAccess())
const recentStartedCourses = computed(() => {
  const coursesById = new Map(catalogStore.courses.map((course) => [course.id, course]))

  return startedCourseIds.value
    .slice(0, 3)
    .map((courseId) => coursesById.get(courseId))
    .filter((course) => course !== undefined)
})

function getCourseProgressPercentage(courseId: string, lessonCount: number): number {
  return userStateStore.getCourseProgressPercentage(courseId, lessonCount)
}

function getDomainIcon(domainSlug: string) {
  return domainIcons[domainSlug as keyof typeof domainIcons] ?? BookOpen
}

onMounted(catalogStore.loadCatalog)
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="border-b">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <RouterLink to="/catalog">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <BookOpen />
              </div>
              <div class="grid flex-1 text-left leading-tight">
                <span class="truncate font-semibold">Kognisie</span>
                <span class="truncate text-xs text-muted-foreground">Learn by exploring</span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Explore</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="route.name === 'catalog' && !selectedDomain">
                <RouterLink to="/catalog">
                  <LayoutGrid />
                  <span>All courses</span>
                  <SidebarMenuBadge>{{ catalogStore.courses.length }}</SidebarMenuBadge>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="route.name === 'my-learning'">
                <RouterLink :to="{ name: 'my-learning' }">
                  <BookOpenCheck />
                  <span>My learning</span>
                  <SidebarMenuBadge>{{ startedCourseIds.length }}</SidebarMenuBadge>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup v-if="recentStartedCourses.length > 0">
        <SidebarGroupLabel>Continue learning</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="course in recentStartedCourses" :key="course.id">
              <SidebarMenuButton
                as-child
                :is-active="
                  route.name === 'course-detail' && route.params.courseSlug === course.slug
                "
                :tooltip="course.title"
              >
                <RouterLink :to="{ name: 'course-detail', params: { courseSlug: course.slug } }">
                  <PlayCircle />
                  <span>{{ course.title }}</span>
                  <SidebarMenuBadge>
                    {{ getCourseProgressPercentage(course.id, course.lessonCount) }}%
                  </SidebarMenuBadge>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Domains</SidebarGroupLabel>
        <SidebarGroupContent>
          <div v-if="catalogStore.isLoading" class="flex flex-col gap-2 px-2">
            <Skeleton v-for="index in 2" :key="index" class="h-8 w-full" />
          </div>
          <SidebarMenu v-else>
            <SidebarMenuItem v-for="domain in catalogStore.domains" :key="domain.id">
              <SidebarMenuButton as-child :is-active="selectedDomain === domain.slug">
                <RouterLink :to="{ name: 'catalog', query: { domain: domain.slug } }">
                  <component :is="getDomainIcon(domain.slug)" />
                  <span>{{ domain.name }}</span>
                  <SidebarMenuBadge>{{ domain.courseCount }}</SidebarMenuBadge>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
