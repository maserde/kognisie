import type {
  CourseProgressRecord,
  PendingSyncMutation,
  UserStateSnapshot,
  WidgetStateRecord,
} from '@/features/user-state/types/user-state'
import { toPlainSnapshot } from '@/features/user-state/utils/toPlainSnapshot'

function hasPendingMutation(
  mutations: PendingSyncMutation[],
  entityType: PendingSyncMutation['entityType'],
  entityId: string,
): boolean {
  return mutations.some(
    (mutation) => mutation.entityType === entityType && mutation.entityId === entityId,
  )
}

/**
 * Folds the authoritative server snapshot into local state.
 *
 * Two rules keep this safe:
 * 1. A record with a still-pending mutation keeps its local value, so an edit
 *    made while the request was in flight is never overwritten.
 * 2. Local records the server does not know about are kept. The API has no
 *    delete-record operation, so a missing record means "not synced yet",
 *    never "deleted elsewhere".
 */
export function mergeServerSnapshot(
  localState: UserStateSnapshot,
  serverSnapshot: UserStateSnapshot,
  remainingMutations: PendingSyncMutation[],
): UserStateSnapshot {
  const courseProgressByCourseId: Record<string, CourseProgressRecord> = {
    ...localState.courseProgressByCourseId,
  }

  for (const [courseId, serverProgress] of Object.entries(
    serverSnapshot.courseProgressByCourseId,
  )) {
    if (hasPendingMutation(remainingMutations, 'course-progress', courseId)) continue
    courseProgressByCourseId[courseId] = serverProgress
  }

  const widgetStateById: Record<string, WidgetStateRecord> = { ...localState.widgetStateById }

  for (const [widgetStateId, serverWidgetState] of Object.entries(serverSnapshot.widgetStateById)) {
    if (hasPendingMutation(remainingMutations, 'widget-state', widgetStateId)) continue
    widgetStateById[widgetStateId] = serverWidgetState
  }

  const hasPendingPreference = remainingMutations.some(
    (mutation) => mutation.entityType === 'user-preference',
  )

  return toPlainSnapshot({
    schemaVersion: localState.schemaVersion,
    courseProgressByCourseId,
    widgetStateById,
    preferences: hasPendingPreference ? localState.preferences : serverSnapshot.preferences,
    pendingSyncMutations: remainingMutations,
  })
}
