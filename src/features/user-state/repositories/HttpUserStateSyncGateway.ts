import type { HttpClient } from '@/lib/http-client'
import type { DeviceIdentityRepository } from '@/features/user-state/repositories/DeviceIdentityRepository'
import type { PendingSyncMutation, UserStateSnapshot } from '@/features/user-state/types/user-state'
import type { SyncResult, UserStateSyncGateway } from '@/features/user-state/types/user-state-sync'

const USER_STATE_PATH = '/api/v1/user-state'
const USER_ID_HEADER = 'X-Kognisie-User-Id'

export function createHttpUserStateSyncGateway(
  httpClient: HttpClient,
  deviceIdentityRepository: DeviceIdentityRepository,
): UserStateSyncGateway {
  async function authHeaders(): Promise<Record<string, string>> {
    return { [USER_ID_HEADER]: await deviceIdentityRepository.getDeviceId() }
  }

  return {
    isEnabled: true,

    async push(mutations: PendingSyncMutation[]): Promise<SyncResult> {
      return httpClient.request<SyncResult>(`${USER_STATE_PATH}/sync`, {
        method: 'POST',
        headers: await authHeaders(),
        body: { mutations },
      })
    },

    async pull(): Promise<UserStateSnapshot> {
      return httpClient.request<UserStateSnapshot>(USER_STATE_PATH, {
        headers: await authHeaders(),
      })
    },
  }
}
