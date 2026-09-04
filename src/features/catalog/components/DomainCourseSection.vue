<script setup lang="ts">
interface Props {
  headingId: string
  name: string
  description: string
  courseCount: number
}

const props = defineProps<Props>()
</script>

<template>
  <section
    class="flex flex-col gap-8 rounded-2xl border bg-card p-5 shadow-xs sm:p-6"
    :aria-labelledby="props.headingId"
  >
    <header>
      <h3 :id="props.headingId" class="text-xl font-semibold tracking-tight">
        {{ props.name }}
      </h3>
      <p class="mt-1 text-sm text-muted-foreground">{{ props.description }}</p>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ props.courseCount }} {{ props.courseCount === 1 ? 'course' : 'courses' }}
      </p>
    </header>

    <slot />
  </section>
</template>
