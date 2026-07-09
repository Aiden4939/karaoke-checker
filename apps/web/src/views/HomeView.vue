<script setup lang="ts">
import HealthCard from '@/components/common/HealthCard.vue'
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Welcome</h1>
      <p class="max-w-2xl text-muted-foreground">
        This starter connects the Vue frontend to the API through the shared
        <code class="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">@app/api-client</code>
        package.
      </p>
    </div>

    <HealthCard />
  </section>
</template>
