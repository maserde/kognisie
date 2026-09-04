import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { catalogRoutes } from '@/features/catalog/routes/catalog.routes'
import { lessonRoutes } from '@/features/lesson/routes/lesson.routes'

const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  redirect: { name: 'catalog' },
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...catalogRoutes, ...lessonRoutes, fallbackRoute],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
