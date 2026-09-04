import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { until, useIntervalFn, useOnline, watchDebounced } from '@vueuse/core'
import type {
  CourseProgressRecord,
  PendingSyncMutation,
  SyncEntityType,
  WidgetStateRecord,
} from '@/features/user-state/types/user-state'
import { getWidgetStateId } from '@/features/user-state/types/user-state'
import {
  createUserStateRepository,
  createUserStateSyncGateway,
} from '@/features/user-state/repositories'
import { mergeServerSnapshot } from '@/features/user-state/utils/mergeServerSnapshot'
import { toPlainSnapshot } from '@/features/user-state/utils/toPlainSnapshot'

const SYNC_DEBOUNCE_MS = 1_500
const SYNC_MAX_WAIT_MS = 10_000
const SYNC_RETRY_INTERVAL_MS = 60_000

export const useUserStateStore = defineStore('user-state', () => {
  const repository = createUserStateRepository()
  const syncGateway = createUserStateSyncGateway()
  const state = repository.state
  const isReady = repository.isReady
  const isSupported = repository.isSupported

  const isOnline = useOnline()
  const isSyncing = ref(false)
  const isSyncSchedulerStarted = ref(false)
  const lastSyncedAt = ref<string | null>(null)
  const syncError = ref<string | null>(null)

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
    await repository.save(toPlainSnapshot(state.value))
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

  /**
   * Drains the outbox to the backend, then folds the authoritative snapshot
   * back into local state. Mutations queued while the request is in flight
   * survive, so nothing edited mid-sync is lost.
   */
  async function syncPendingMutations(): Promise<void> {
    if (!syncGateway.isEnabled || isSyncing.value || !isOnline.value || !isReady.value) return

    const mutations = [...state.value.pendingSyncMutations]
    if (mutations.length === 0) return

    isSyncing.value = true
    syncError.value = null

    try {
      const { appliedMutationIds, snapshot } = await syncGateway.push(mutations)
      const appliedIds = new Set(appliedMutationIds)
      const remainingMutations = state.value.pendingSyncMutations.filter(
        (mutation) => !appliedIds.has(mutation.id),
      )

      state.value = mergeServerSnapshot(state.value, snapshot, remainingMutations)
      await repository.save(toPlainSnapshot(state.value))
      lastSyncedAt.value = new Date().toISOString()
    } catch (error) {
      // The outbox is left intact so the next attempt replays it. The backend
      // ignores a replay whose updatedAt is older than the stored record.
      syncError.value = error instanceof Error ? error.message : 'Sync failed'
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Pulls server state on startup so a second device sees existing progress.
   * Records with queued local edits are left alone by the merge.
   */
  async function pullRemoteState(): Promise<void> {
    if (!syncGateway.isEnabled || isSyncing.value || !isOnline.value || !isReady.value) return

    isSyncing.value = true
    syncError.value = null

    try {
      const snapshot = await syncGateway.pull()
      state.value = mergeServerSnapshot(state.value, snapshot, state.value.pendingSyncMutations)
      await repository.save(toPlainSnapshot(state.value))
      lastSyncedAt.value = new Date().toISOString()
    } catch (error) {
      syncError.value = error instanceof Error ? error.message : 'Sync failed'
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Wires the sync triggers. Called once from the app root so the store stays
   * inert until an app is actually running; the watchers live in the store's
   * effect scope and are disposed with it.
   */
  function startSyncScheduler(): void {
    if (!syncGateway.isEnabled || isSyncSchedulerStarted.value) return
    isSyncSchedulerStarted.value = true

    // Watchers are registered synchronously so they belong to the store's
    // effect scope; only the first pull waits, and it must wait for IndexedDB
    // hydration or the adapter would overwrite the merged result.
    void until(isReady)
      .toBe(true)
      .then(async () => {
        await pullRemoteState()
        // Flush anything queued during a previous offline session.
        await syncPendingMutations()
      })

    // Batch bursts of edits into one request instead of one per keystroke.
    // The outbox array identity is watched rather than its length: compaction
    // replaces the queued mutation for an entity in place, so a second edit to
    // the same entity leaves the length unchanged but still needs a sync.
    watchDebounced(
      () => state.value.pendingSyncMutations,
      (mutations) => {
        if (mutations.length > 0) void syncPendingMutations()
      },
      { debounce: SYNC_DEBOUNCE_MS, maxWait: SYNC_MAX_WAIT_MS },
    )

    // Flush whatever accumulated offline as soon as the network returns.
    watch(isOnline, (isBackOnline) => {
      if (isBackOnline) void syncPendingMutations()
    })

    // Backstop for a failed attempt that left the outbox populated.
    useIntervalFn(() => void syncPendingMutations(), SYNC_RETRY_INTERVAL_MS)
  }

  const isCatalogSidebarOpen = computed(() => state.value.preferences.isCatalogSidebarOpen)
  const isSyncEnabled = computed(() => syncGateway.isEnabled)
  const hasPendingSyncMutations = computed(() => state.value.pendingSyncMutations.length > 0)

  return {
    state,
    isReady,
    isSupported,
    isCatalogSidebarOpen,
    isSyncEnabled,
    isSyncing,
    isOnline,
    hasPendingSyncMutations,
    lastSyncedAt,
    syncError,
    syncPendingMutations,
    pullRemoteState,
    startSyncScheduler,
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
