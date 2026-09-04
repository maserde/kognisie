<script setup lang="ts">
import type { TocLink } from 'comark/plugins/toc'

const props = defineProps<{ links: TocLink[] }>()
</script>

<template>
  <nav aria-label="On this page">
    <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      On this page
    </p>
    <ol class="mt-3 flex flex-col gap-1">
      <li v-for="link in props.links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="block rounded-md py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          :class="{ 'pl-3': link.depth > 2 }"
        >
          {{ link.text }}
        </a>
      </li>
    </ol>
  </nav>
</template>
