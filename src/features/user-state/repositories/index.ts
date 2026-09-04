import { createHttpClient } from '@/lib/http-client'
import { createIndexedDbUserStateRepository } from '@/features/user-state/repositories/IndexedDbUserStateRepository'
import { createIndexedDbDeviceIdentityRepository } from '@/features/user-state/repositories/IndexedDbDeviceIdentityRepository'
import { createHttpUserStateSyncGateway } from '@/features/user-state/repositories/HttpUserStateSyncGateway'
import { createDisabledUserStateSyncGateway } from '@/features/user-state/repositories/DisabledUserStateSyncGateway'
import type { UserStateSyncGateway } from '@/features/user-state/types/user-state-sync'

// IndexedDB stays the durable local store and the offline queue. The gateway
// only pushes that queue to the backend and folds the server answer back in.
export const createUserStateRepository = createIndexedDbUserStateRepository

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

export function createUserStateSyncGateway(): UserStateSyncGateway {
  if (!apiBaseUrl) {
    return createDisabledUserStateSyncGateway()
  }

  return createHttpUserStateSyncGateway(
    createHttpClient(apiBaseUrl),
    createIndexedDbDeviceIdentityRepository(),
  )
}
