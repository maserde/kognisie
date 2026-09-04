import type { RouteRecordRaw } from 'vue-router'
import CatalogPage from '@/features/catalog/pages/CatalogPage.vue'
import CatalogLayout from '@/layouts/CatalogLayout.vue'

export const catalogRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: CatalogLayout,
    children: [
      {
        path: '',
        redirect: { name: 'catalog' },
      },
      {
        path: 'catalog',
        name: 'catalog',
        component: CatalogPage,
      },
      {
        path: 'my-learning',
        name: 'my-learning',
        component: () => import('@/features/catalog/pages/MyLearningPage.vue'),
      },
      {
        path: 'courses/:courseSlug',
        name: 'course-detail',
        component: () => import('@/features/catalog/pages/CoursePage.vue'),
        props: true,
      },
    ],
  },
]
