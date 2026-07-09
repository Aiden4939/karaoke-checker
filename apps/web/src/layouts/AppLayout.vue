<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main id="main-content" class="flex-1">
      <div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
