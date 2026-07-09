<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
</script>

<template>
  <section
    class="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center"
    aria-labelledby="not-found-title"
  >
    <div class="space-y-2">
      <p class="text-sm font-medium text-muted-foreground">404</p>
      <h1 id="not-found-title" class="text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p class="max-w-md text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
    </div>

    <Button as-child>
      <RouterLink to="/">Back to home</RouterLink>
    </Button>
  </section>
</template>
