import { get, set } from 'idb-keyval'
import type { DeviceIdentityRepository } from '@/features/user-state/repositories/DeviceIdentityRepository'

const DEVICE_ID_STORAGE_KEY = 'kognisie:device-id'

/**
 * Uses `idb-keyval` rather than VueUse `useIDBKeyval` because the id is read
 * once from a plain async call outside any component scope, where a reactive
 * watcher would have no owner to dispose it. IndexedDB remains the only
 * durable browser store, per the storage convention in AGENTS.md.
 */
export function createIndexedDbDeviceIdentityRepository(): DeviceIdentityRepository {
  let cachedDeviceId: string | null = null

  return {
    async getDeviceId(): Promise<string> {
      if (cachedDeviceId) return cachedDeviceId

      const storedDeviceId = await get<string>(DEVICE_ID_STORAGE_KEY)
      if (storedDeviceId) {
        cachedDeviceId = storedDeviceId
        return storedDeviceId
      }

      // Hyphens are stripped so the id matches the backend's id pattern.
      const deviceId = crypto.randomUUID().replaceAll('-', '')
      await set(DEVICE_ID_STORAGE_KEY, deviceId)
      cachedDeviceId = deviceId

      return deviceId
    },
  }
}
