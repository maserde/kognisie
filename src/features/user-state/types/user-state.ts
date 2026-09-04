export const USER_STATE_SCHEMA_VERSION = 2 as const

export type SyncStatus = 'pending' | 'synced' | 'conflict'
export type SyncEntityType = 'course-progress' | 'widget-state' | 'user-preference'

export interface SyncMetadata {
  syncStatus: SyncStatus
  updatedAt: string
}

export interface CourseProgressRecord extends SyncMetadata {
  courseId: string
  completedLessonIds: string[]
  lastLessonId: string | null
  startedAt: string
  lastAccessedAt: string
}

export interface WidgetStateRecord extends SyncMetadata {
  id: string
  lessonId: string
  widgetId: string
  values: Record<string, unknown>
}

export interface UserPreferences extends SyncMetadata {
  isCatalogSidebarOpen: boolean
  lessonScrollByLessonId: Record<string, number>
}

export interface PendingSyncMutation {
  id: string
  entityType: SyncEntityType
  entityId: string
  operation: 'upsert'
  payload: unknown
  createdAt: string
}

export interface UserStateSnapshot {
  schemaVersion: typeof USER_STATE_SCHEMA_VERSION
  courseProgressByCourseId: Record<string, CourseProgressRecord>
  widgetStateById: Record<string, WidgetStateRecord>
  preferences: UserPreferences
  pendingSyncMutations: PendingSyncMutation[]
}

export function createEmptyUserState(): UserStateSnapshot {
  const timestamp = new Date().toISOString()

  return {
    schemaVersion: USER_STATE_SCHEMA_VERSION,
    courseProgressByCourseId: {},
    widgetStateById: {},
    preferences: {
      isCatalogSidebarOpen: true,
      lessonScrollByLessonId: {},
      syncStatus: 'pending',
      updatedAt: timestamp,
    },
    pendingSyncMutations: [],
  }
}

export function getWidgetStateId(lessonId: string, widgetId: string): string {
  return `${lessonId}:${widgetId}`
}
