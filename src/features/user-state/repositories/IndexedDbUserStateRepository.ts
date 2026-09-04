import { useSupported } from '@vueuse/core'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import {
  createEmptyUserState,
  USER_STATE_SCHEMA_VERSION,
  type UserStateSnapshot,
} from '@/features/user-state/types/user-state'
import type { UserStateRepository } from '@/features/user-state/repositories/UserStateRepository'

const USER_STATE_STORAGE_KEY = `kognisie:user-state:v${USER_STATE_SCHEMA_VERSION}`

export function createIndexedDbUserStateRepository(): UserStateRepository {
  const { data, isFinished, set } = useIDBKeyval<UserStateSnapshot>(
    USER_STATE_STORAGE_KEY,
    createEmptyUserState(),
    {
      deep: true,
      writeDefaults: true,
    },
  )
  const isSupported = useSupported(() => typeof indexedDB !== 'undefined')

  return {
    state: data,
    isReady: isFinished,
    isSupported,
    save: set,
    reset: () => set(createEmptyUserState()),
  }
}
