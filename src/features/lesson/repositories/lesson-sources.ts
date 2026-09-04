import { parseMarkdown } from 'comark'
import type { MarkdownDocument } from 'comark'
import toc from 'comark/plugins/toc'
import type { LessonFrontmatter } from '@/features/lesson/types/lesson-content'

const lessonSources = import.meta.glob<string>('/src/content/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

export interface ParsedLessonSource {
  sourcePath: string
  courseSlug: string
  lessonSlug: string
  frontmatter: LessonFrontmatter
  document: MarkdownDocument
}

function isLessonFrontmatter(value: unknown): value is LessonFrontmatter {
  if (!value || typeof value !== 'object') return false

  const frontmatter = value as Partial<LessonFrontmatter>
  return (
    typeof frontmatter.id === 'string' &&
    typeof frontmatter.title === 'string' &&
    typeof frontmatter.description === 'string' &&
    typeof frontmatter.domainId === 'string' &&
    typeof frontmatter.courseId === 'string' &&
    typeof frontmatter.moduleId === 'string' &&
    typeof frontmatter.lessonId === 'string' &&
    typeof frontmatter.order === 'number' &&
    typeof frontmatter.durationMinutes === 'number'
  )
}

function getContentPathParts(sourcePath: string): { courseSlug: string; lessonSlug: string } {
  const pathParts = sourcePath.split('/')
  const lessonFilename = pathParts.at(-1)
  const courseSlug = pathParts.at(-3)

  if (!lessonFilename || !courseSlug) {
    throw new Error(`Invalid lesson content path: ${sourcePath}`)
  }

  return { courseSlug, lessonSlug: lessonFilename.replace(/\.md$/, '') }
}

async function parseLessonSource(
  sourcePath: string,
  source: string,
  includeTableOfContents = false,
): Promise<ParsedLessonSource> {
  const document = await parseMarkdown(source, {
    plugins: includeTableOfContents ? [toc({ depth: 2, searchDepth: 3 })] : [],
  })
  if (!isLessonFrontmatter(document.frontmatter)) {
    throw new Error(`Invalid lesson frontmatter in ${sourcePath}`)
  }

  return {
    sourcePath,
    ...getContentPathParts(sourcePath),
    frontmatter: document.frontmatter,
    document,
  }
}

export function getParsedLessonSources(): Promise<ParsedLessonSource[]> {
  return Promise.all(
    Object.entries(lessonSources).map(([sourcePath, source]) =>
      parseLessonSource(sourcePath, source),
    ),
  )
}

export async function getParsedLessonSource(
  courseSlug: string,
  lessonSlug: string,
): Promise<ParsedLessonSource | null> {
  const sourceEntry = Object.entries(lessonSources).find(([sourcePath]) => {
    const pathParts = getContentPathParts(sourcePath)
    return pathParts.courseSlug === courseSlug && pathParts.lessonSlug === lessonSlug
  })
  return sourceEntry ? parseLessonSource(...sourceEntry, true) : null
}
