<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b bg-background">
    <div
      class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Inwanding Fullstack
      </RouterLink>

      <nav aria-label="Main navigation" class="flex items-center gap-4 text-sm">
        <RouterLink
          to="/"
          class="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          active-class="text-foreground font-medium"
        >
          Home
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
