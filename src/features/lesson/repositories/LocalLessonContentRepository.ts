import type { LessonContentRepository } from '@/features/lesson/repositories/LessonContentRepository'
import { getParsedLessonSource } from '@/features/lesson/repositories/lesson-sources'

export class LocalLessonContentRepository implements LessonContentRepository {
  async getLessonByCourseAndSlug(courseSlug: string, lessonSlug: string) {
    return getParsedLessonSource(courseSlug, lessonSlug)
  }
}
