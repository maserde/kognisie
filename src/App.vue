<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const userStateStore = useUserStateStore()

// No-op unless VITE_API_BASE_URL is configured; the app stays local-only then.
onMounted(() => userStateStore.startSyncScheduler())
</script>

<template>
  <RouterView />
</template>
