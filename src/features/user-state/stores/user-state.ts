import { computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  CourseProgressRecord,
  PendingSyncMutation,
  SyncEntityType,
  WidgetStateRecord,
} from '@/features/user-state/types/user-state'
import { getWidgetStateId } from '@/features/user-state/types/user-state'
import { createUserStateRepository } from '@/features/user-state/repositories'

export const useUserStateStore = defineStore('user-state', () => {
  const repository = createUserStateRepository()
  const state = repository.state
  const isReady = repository.isReady
  const isSupported = repository.isSupported

  function createPendingSyncMutation(
    entityType: SyncEntityType,
    entityId: string,
    payload: unknown,
  ): PendingSyncMutation {
    return {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      operation: 'upsert',
      payload,
      createdAt: new Date().toISOString(),
    }
  }

  async function persistPendingChange(
    entityType: SyncEntityType,
    entityId: string,
    payload: unknown,
  ): Promise<void> {
    const mutation = createPendingSyncMutation(entityType, entityId, payload)
    state.value.pendingSyncMutations = [
      ...state.value.pendingSyncMutations.filter(
        (pendingMutation) =>
          pendingMutation.entityType !== entityType || pendingMutation.entityId !== entityId,
      ),
      mutation,
    ]
    await repository.save(state.value)
  }

  function getCompletedLessonIdsByCourseId(courseId: string): string[] {
    return state.value.courseProgressByCourseId[courseId]?.completedLessonIds ?? []
  }

  function getCourseProgressPercentage(courseId: string, lessonCount: number): number {
    if (lessonCount <= 0) return 0

    const completedLessonCount = getCompletedLessonIdsByCourseId(courseId).length
    return Math.min(100, Math.round((completedLessonCount / lessonCount) * 100))
  }

  function isCourseStarted(courseId: string): boolean {
    return Boolean(state.value.courseProgressByCourseId[courseId])
  }

  function getStartedCourseIdsByRecentAccess(): string[] {
    return Object.values(state.value.courseProgressByCourseId)
      .sort((leftProgress, rightProgress) =>
        rightProgress.lastAccessedAt.localeCompare(leftProgress.lastAccessedAt),
      )
      .map((progress) => progress.courseId)
  }

  function getWidgetStateByLessonAndWidgetId<T extends Record<string, unknown>>(
    lessonId: string,
    widgetId: string,
  ): T | null {
    const widgetState = state.value.widgetStateById[getWidgetStateId(lessonId, widgetId)]
    return (widgetState?.values as T | undefined) ?? null
  }

  async function saveCourseProgress(progress: CourseProgressRecord): Promise<void> {
    state.value.courseProgressByCourseId[progress.courseId] = progress
    await persistPendingChange('course-progress', progress.courseId, progress)
  }

  async function touchCourse(courseId: string): Promise<void> {
    const existingProgress = state.value.courseProgressByCourseId[courseId]
    if (!existingProgress) return

    const timestamp = new Date().toISOString()
    await saveCourseProgress({
      ...existingProgress,
      lastAccessedAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending',
    })
  }

  async function startCourse(courseId: string, firstLessonId: string | null): Promise<void> {
    const existingProgress = state.value.courseProgressByCourseId[courseId]
    const timestamp = new Date().toISOString()

    await saveCourseProgress({
      courseId,
      completedLessonIds: existingProgress?.completedLessonIds ?? [],
      lastLessonId: existingProgress?.lastLessonId ?? firstLessonId,
      startedAt: existingProgress?.startedAt ?? timestamp,
      lastAccessedAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending',
    })
  }

  async function completeLesson(courseId: string, lessonId: string): Promise<void> {
    const timestamp = new Date().toISOString()
    const existingProgress = state.value.courseProgressByCourseId[courseId]
    const completedLessonIds = new Set(existingProgress?.completedLessonIds ?? [])
    completedLessonIds.add(lessonId)

    await saveCourseProgress({
      courseId,
      completedLessonIds: [...completedLessonIds],
      lastLessonId: lessonId,
      startedAt: existingProgress?.startedAt ?? timestamp,
      lastAccessedAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending',
    })
  }

  async function saveWidgetState(
    lessonId: string,
    widgetId: string,
    values: Record<string, unknown>,
  ): Promise<void> {
    const id = getWidgetStateId(lessonId, widgetId)
    const widgetState: WidgetStateRecord = {
      id,
      lessonId,
      widgetId,
      values,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }

    state.value.widgetStateById[id] = widgetState
    await persistPendingChange('widget-state', id, widgetState)
  }

  async function setCatalogSidebarOpen(isOpen: boolean): Promise<void> {
    state.value.preferences = {
      ...state.value.preferences,
      isCatalogSidebarOpen: isOpen,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }
    await persistPendingChange('user-preference', 'catalog-sidebar', state.value.preferences)
  }

  function getLessonScrollPosition(lessonId: string): number {
    return state.value.preferences.lessonScrollByLessonId[lessonId] ?? 0
  }

  async function setLessonScrollPosition(lessonId: string, position: number): Promise<void> {
    state.value.preferences = {
      ...state.value.preferences,
      lessonScrollByLessonId: {
        ...state.value.preferences.lessonScrollByLessonId,
        [lessonId]: Math.max(0, Math.round(position)),
      },
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }
    await persistPendingChange(
      'user-preference',
      `lesson-scroll:${lessonId}`,
      state.value.preferences,
    )
  }

  async function resetAllState(): Promise<void> {
    await repository.reset()
  }

  const isCatalogSidebarOpen = computed(() => state.value.preferences.isCatalogSidebarOpen)

  return {
    state,
    isReady,
    isSupported,
    isCatalogSidebarOpen,
    getCompletedLessonIdsByCourseId,
    getCourseProgressPercentage,
    isCourseStarted,
    getStartedCourseIdsByRecentAccess,
    getWidgetStateByLessonAndWidgetId,
    touchCourse,
    startCourse,
    completeLesson,
    saveWidgetState,
    setCatalogSidebarOpen,
    getLessonScrollPosition,
    setLessonScrollPosition,
    resetAllState,
  }
})
