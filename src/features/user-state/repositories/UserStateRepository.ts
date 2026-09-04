import type { ComputedRef, Ref } from 'vue'
import type { UserStateSnapshot } from '@/features/user-state/types/user-state'

export interface UserStateRepository {
  state: Ref<UserStateSnapshot>
  isReady: Ref<boolean>
  isSupported: ComputedRef<boolean>
  save(snapshot: UserStateSnapshot): Promise<void>
  reset(): Promise<void>
}
