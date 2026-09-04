import type { LessonContentRepository } from '@/features/lesson/repositories/LessonContentRepository'
import { LocalLessonContentRepository } from '@/features/lesson/repositories/LocalLessonContentRepository'

// Replace this composition root with an API repository when lesson content moves to the backend.
export const lessonContentRepository: LessonContentRepository = new LocalLessonContentRepository()
