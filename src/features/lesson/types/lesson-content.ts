import type { MarkdownDocument } from 'comark'

export interface LessonFrontmatter {
  id: string
  title: string
  description: string
  domainId: string
  courseId: string
  moduleId: string
  lessonId: string
  order: number
  durationMinutes: number
}

export interface LessonContent {
  sourcePath: string
  frontmatter: LessonFrontmatter
  document: MarkdownDocument
}
