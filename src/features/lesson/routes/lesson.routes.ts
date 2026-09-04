import type { RouteRecordRaw } from 'vue-router'
import LessonLayout from '@/layouts/LessonLayout.vue'

export const lessonRoutes: RouteRecordRaw[] = [
  {
    path: '/courses/:courseSlug/lessons',
    component: LessonLayout,
    children: [
      {
        path: ':lessonSlug',
        name: 'lesson',
        component: () => import('@/features/lesson/pages/LessonPage.vue'),
        props: true,
      },
    ],
  },
]
