<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterView } from 'vue-router'

interface Props {
  name?: string
  queryKeys?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  name: 'page',
  queryKeys: () => [],
})

function serializeRouteRecord(record: Record<string, unknown>): string {
  return Object.entries(record)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|')
}

function getRouteKey(route: RouteLocationNormalizedLoaded): string {
  const selectedQuery = Object.fromEntries(
    props.queryKeys.map((queryKey) => [queryKey, route.query[queryKey] ?? '']),
  )

  return [
    String(route.name ?? route.path),
    serializeRouteRecord(route.params),
    serializeRouteRecord(selectedQuery),
  ].join(':')
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="name" mode="out-in" appear>
      <component :is="Component" :key="getRouteKey(route)" />
    </Transition>
  </RouterView>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 180ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.995);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem) scale(0.998);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition-duration: 1ms;
  }

  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
