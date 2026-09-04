import { createIndexedDbUserStateRepository } from '@/features/user-state/repositories/IndexedDbUserStateRepository'

// Replace this factory with an API-backed implementation when the backend is available.
export const createUserStateRepository = createIndexedDbUserStateRepository
