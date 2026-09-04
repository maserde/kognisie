import type { UserStateSyncGateway } from '@/features/user-state/types/user-state-sync'

/**
 * Selected when no backend origin is configured. The app then behaves exactly
 * as it did before sync existed: IndexedDB holds everything and the outbox
 * simply accumulates until a backend is available.
 */
export function createDisabledUserStateSyncGateway(): UserStateSyncGateway {
  return {
    isEnabled: false,

    push() {
      return Promise.reject(new Error('User state sync is not configured'))
    },

    pull() {
      return Promise.reject(new Error('User state sync is not configured'))
    },
  }
}
