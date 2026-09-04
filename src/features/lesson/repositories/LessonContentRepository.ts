import type { LessonContent } from '@/features/lesson/types/lesson-content'

export interface LessonContentRepository {
  getLessonByCourseAndSlug(courseSlug: string, lessonSlug: string): Promise<LessonContent | null>
}
