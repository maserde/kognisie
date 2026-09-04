<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { TocLink } from 'comark/plugins/toc'

const props = defineProps<{ links: TocLink[] }>()

const activeId = ref<string>('')

function updateActiveHeading(): void {
  if (!props.links.length) {
    activeId.value = ''
    return
  }

  // Header offset: 56px (header) + 32px breathing room = 88px
  const headerOffset = 88
  const headingElements = props.links
    .map((link) => ({ id: link.id, el: document.getElementById(link.id) }))
    .filter((item): item is { id: string; el: HTMLElement } => item.el !== null)

  if (!headingElements.length) {
    activeId.value = ''
    return
  }

  let currentActiveId = headingElements[0]?.id ?? ''

  for (const { id, el } of headingElements) {
    const rect = el.getBoundingClientRect()
    if (rect.top <= headerOffset) {
      currentActiveId = id
    } else {
      break
    }
  }

  // If scrolled close to bottom, highlight the last section
  const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50
  if (isBottom) {
    currentActiveId = headingElements[headingElements.length - 1]?.id ?? currentActiveId
  }

  activeId.value = currentActiveId
}

function handleLinkClick(event: MouseEvent, targetId: string): void {
  const targetElement = document.getElementById(targetId)
  if (!targetElement) return

  event.preventDefault()
  activeId.value = targetId

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  targetElement.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  })

  // Update hash in browser without jumping
  history.pushState(null, '', `#${targetId}`)
}

useEventListener('scroll', updateActiveHeading, { passive: true })
watch(
  () => props.links,
  () => {
    setTimeout(updateActiveHeading, 100)
  },
  { deep: true },
)
onMounted(() => {
  setTimeout(updateActiveHeading, 150)
})
</script>

<template>
  <nav aria-label="On this page">
    <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      On this page
    </p>
    <ol class="mt-3 flex flex-col gap-1 border-l border-border/60">
      <li v-for="link in props.links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="-ml-px block border-l-2 py-1.5 text-sm transition-all duration-150"
          :class="[
            link.depth > 2 ? 'pl-5' : 'pl-3.5',
            activeId === link.id
              ? 'border-primary font-medium text-foreground'
              : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
          ]"
          @click="handleLinkClick($event, link.id)"
        >
          {{ link.text }}
        </a>
      </li>
    </ol>
  </nav>
</template>
