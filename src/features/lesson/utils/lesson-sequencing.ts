import type { CatalogCourse, CatalogLesson } from '@/features/catalog/types/catalog'

/** Returns published lessons in their authored course order. */
export function getLessonsByCourse(course: CatalogCourse): CatalogLesson[] {
  return course.modules.flatMap((module) => module.lessons)
}

/** Returns the first unfinished lesson, or the final lesson when the course is complete. */
export function getCurrentLessonByCompletedLessonIds(
  lessons: CatalogLesson[],
  completedLessonIds: string[],
): CatalogLesson | null {
  if (lessons.length === 0) return null

  const completedLessonIdSet = new Set(completedLessonIds)
  return lessons.find((lesson) => !completedLessonIdSet.has(lesson.id)) ?? lessons.at(-1) ?? null
}

/** Completed lessons and the current lesson are valid; future lessons remain locked. */
export function canAccessLessonByCompletedLessonIds(
  lesson: CatalogLesson,
  lessons: CatalogLesson[],
  completedLessonIds: string[],
): boolean {
  if (completedLessonIds.includes(lesson.id)) return true

  return getCurrentLessonByCompletedLessonIds(lessons, completedLessonIds)?.id === lesson.id
}
