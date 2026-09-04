<script setup lang="ts">
import CatalogSearch from '@/features/catalog/components/CatalogSearch.vue'
import RoutePageTransition from '@/components/navigation/RoutePageTransition.vue'
import CatalogSidebar from '@/features/catalog/components/CatalogSidebar.vue'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useUserStateStore } from '@/features/user-state/stores/user-state'

const userStateStore = useUserStateStore()
</script>

<template>
  <SidebarProvider
    :open="userStateStore.isCatalogSidebarOpen"
    @update:open="userStateStore.setCatalogSidebarOpen"
  >
    <CatalogSidebar />
    <SidebarInset>
      <header
        class="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6"
      >
        <SidebarTrigger />
        <Separator orientation="vertical" class="h-5" />
        <div class="flex min-w-0 flex-1 items-center justify-between gap-3">
          <p class="truncate text-sm font-medium">Interactive learning catalog</p>
          <CatalogSearch />
        </div>
      </header>
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RoutePageTransition :query-keys="['domain']" />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
