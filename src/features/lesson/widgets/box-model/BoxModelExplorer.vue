<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type {
  BoxModelExplorerWidgetProps,
  BoxModelExplorerWidgetState,
} from '@/features/lesson/widgets/widget-registry'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const props = withDefaults(defineProps<BoxModelExplorerWidgetProps>(), {
  minSpacing: 0,
  maxSpacing: 64,
  showComputedSize: true,
})

const userStateStore = useUserStateStore()
const padding = ref([props.initialPadding])
const border = ref([props.initialBorder])
const margin = ref([props.initialMargin])
const hasHydratedState = ref(false)
const outerWidth = computed(
  () => props.initialContentWidth + padding.value[0]! * 2 + border.value[0]! * 2,
)

function getCurrentWidgetState(): BoxModelExplorerWidgetState {
  return {
    padding: padding.value[0]!,
    border: border.value[0]!,
    margin: margin.value[0]!,
  }
}

function hydrateWidgetState(): void {
  const storedState = userStateStore.getWidgetStateByLessonAndWidgetId<BoxModelExplorerWidgetState>(
    props.lessonId,
    props.widgetId,
  )

  if (storedState) {
    padding.value = [storedState.padding]
    border.value = [storedState.border]
    margin.value = [storedState.margin]
  }

  hasHydratedState.value = true
}

async function resetWidget(): Promise<void> {
  padding.value = [props.initialPadding]
  border.value = [props.initialBorder]
  margin.value = [props.initialMargin]
  await userStateStore.saveWidgetState(props.lessonId, props.widgetId, getCurrentWidgetState())
}

watch(
  () => userStateStore.isReady,
  (isReady) => {
    if (isReady && !hasHydratedState.value) hydrateWidgetState()
  },
  { immediate: true },
)

watchDebounced(
  () => [padding.value[0], border.value[0], margin.value[0]],
  () => {
    if (!hasHydratedState.value) return
    void userStateStore.saveWidgetState(props.lessonId, props.widgetId, getCurrentWidgetState())
  },
  { debounce: 250, maxWait: 1000 },
)
</script>

<template>
  <section
    class="lesson-widget my-10 rounded-3xl border bg-card p-5 font-sans text-card-foreground shadow-sm sm:p-7"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-sm font-semibold">Box model explorer</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Change one layer at a time and watch what actually moves.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="resetWidget">Reset</Button>
    </div>

    <div class="mt-6 grid gap-7 lg:grid-cols-[1fr_18rem] lg:items-center">
      <div class="overflow-auto rounded-2xl bg-muted p-6">
        <div
          class="mx-auto flex min-w-[24rem] items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-background py-10"
        >
          <div class="bg-amber-200/80" :style="{ padding: `${margin[0]}px` }">
            <div
              class="bg-emerald-200/90"
              :style="{
                borderWidth: `${border[0]}px`,
                borderStyle: 'solid',
                borderColor: 'oklch(0.55 0.12 160)',
                padding: `${padding[0]}px`,
              }"
            >
              <div
                class="flex h-24 items-center justify-center rounded bg-sky-200 px-4 text-center text-sm font-medium text-sky-950"
                :style="{ width: `${props.initialContentWidth}px` }"
              >
                Content: {{ props.initialContentWidth }}px
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <label class="flex flex-col gap-2 text-sm">
          <span class="flex justify-between"
            ><strong>Padding</strong><span>{{ padding[0] }}px</span></span
          >
          <Slider v-model="padding" :min="props.minSpacing" :max="props.maxSpacing" :step="4" />
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span class="flex justify-between"
            ><strong>Border</strong><span>{{ border[0] }}px</span></span
          >
          <Slider v-model="border" :min="0" :max="16" :step="1" />
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span class="flex justify-between"
            ><strong>Margin</strong><span>{{ margin[0] }}px</span></span
          >
          <Slider v-model="margin" :min="props.minSpacing" :max="props.maxSpacing" :step="4" />
        </label>
        <div v-if="props.showComputedSize" class="rounded-xl border bg-background p-4 text-sm">
          <span class="text-muted-foreground">Rendered width</span>
          <strong class="mt-1 block text-xl tabular-nums">{{ outerWidth }}px</strong>
        </div>
      </div>
    </div>
  </section>
</template>
