import type { PendingSyncMutation, UserStateSnapshot } from '@/features/user-state/types/user-state'

export interface SyncResult {
  /** Mutation ids the backend accepted, so the outbox can drop them. */
  appliedMutationIds: string[]
  /** Authoritative server state after the mutations were applied. */
  snapshot: UserStateSnapshot
}

export interface UserStateSyncGateway {
  /** False when no backend is configured, so the app stays local-only. */
  readonly isEnabled: boolean
  push(mutations: PendingSyncMutation[]): Promise<SyncResult>
  pull(): Promise<UserStateSnapshot>
}
