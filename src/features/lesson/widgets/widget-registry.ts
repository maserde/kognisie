import type { Component } from 'vue'
import BoxModelExplorer from '@/features/lesson/widgets/box-model/BoxModelExplorer.vue'

export interface BoxModelExplorerWidgetProps {
  lessonId: string
  widgetId: string
  initialContentWidth: number
  initialPadding: number
  initialBorder: number
  initialMargin: number
  minSpacing?: number
  maxSpacing?: number
  showComputedSize?: boolean
}

export interface BoxModelExplorerWidgetState extends Record<string, unknown> {
  padding: number
  border: number
  margin: number
}

export interface LessonWidgetPropsByName {
  'box-model-explorer': BoxModelExplorerWidgetProps
}

export type LessonWidgetName = keyof LessonWidgetPropsByName

export const lessonWidgetComponents: Record<LessonWidgetName, Component> = {
  'box-model-explorer': BoxModelExplorer,
}
