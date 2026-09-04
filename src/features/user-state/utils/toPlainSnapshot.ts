import { toRaw } from 'vue'
import type { UserStateSnapshot } from '@/features/user-state/types/user-state'

/**
 * IndexedDB stores values by structured clone, which throws a DataCloneError
 * on Vue's reactive proxies. Store state is deeply reactive, so `toRaw` alone
 * is not enough. The snapshot is the same JSON-safe shape sent over the wire,
 * so a JSON round-trip is lossless and yields plain, cloneable data.
 */
export function toPlainSnapshot(snapshot: UserStateSnapshot): UserStateSnapshot {
  return JSON.parse(JSON.stringify(toRaw(snapshot))) as UserStateSnapshot
}
