import { catalogMetadata } from '@/features/catalog/data/catalog.metadata'
import type {
  CatalogCourse,
  CatalogLesson,
  CatalogModule,
  CatalogSnapshot,
} from '@/features/catalog/types/catalog'
import type { CatalogRepository } from '@/features/catalog/repositories/CatalogRepository'
import {
  getParsedLessonSources,
  type ParsedLessonSource,
} from '@/features/lesson/repositories/lesson-sources'

type PublishedLesson = ParsedLessonSource

function createCatalogLesson(lesson: PublishedLesson): CatalogLesson {
  return {
    id: lesson.frontmatter.lessonId,
    slug: lesson.lessonSlug,
    title: lesson.frontmatter.title,
    durationMinutes: lesson.frontmatter.durationMinutes,
  }
}

function createCatalog(publishedLessons: PublishedLesson[]): CatalogSnapshot {
  const courses = catalogMetadata.courses.flatMap<CatalogCourse>((courseMetadata) => {
    const courseLessons = publishedLessons.filter(
      (lesson) =>
        lesson.courseSlug === courseMetadata.slug &&
        lesson.frontmatter.courseId === courseMetadata.id &&
        lesson.frontmatter.domainId === courseMetadata.domainId,
    )
    if (courseLessons.length === 0) return []

    const modules = courseMetadata.modules.flatMap<CatalogModule>((moduleMetadata) => {
      const lessons = courseLessons
        .filter((lesson) => lesson.frontmatter.moduleId === moduleMetadata.id)
        .sort((left, right) => left.frontmatter.order - right.frontmatter.order)
        .map(createCatalogLesson)

      return lessons.length > 0 ? [{ ...moduleMetadata, lessons }] : []
    })
    const lessons = modules.flatMap((module) => module.lessons)

    return [
      {
        ...courseMetadata,
        modules,
        lessonCount: lessons.length,
        durationMinutes: lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0),
      },
    ]
  })

  const domains = catalogMetadata.domains.flatMap((domainMetadata) => {
    const courseCount = courses.filter((course) => course.domainId === domainMetadata.id).length
    return courseCount > 0 ? [{ ...domainMetadata, courseCount }] : []
  })

  return { domains, courses }
}

export class MarkdownCatalogRepository implements CatalogRepository {
  private catalogPromise: Promise<CatalogSnapshot> | null = null

  private getResolvedCatalog(): Promise<CatalogSnapshot> {
    this.catalogPromise ??= getParsedLessonSources().then(createCatalog)
    return this.catalogPromise
  }

  async getCatalog(): Promise<CatalogSnapshot> {
    return structuredClone(await this.getResolvedCatalog())
  }

  async getCourseBySlug(courseSlug: string): Promise<CatalogCourse | null> {
    const catalog = await this.getResolvedCatalog()
    const course = catalog.courses.find((catalogCourse) => catalogCourse.slug === courseSlug)
    return course ? structuredClone(course) : null
  }
}
