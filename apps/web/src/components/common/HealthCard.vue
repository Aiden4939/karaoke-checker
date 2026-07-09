<script setup lang="ts">
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useHealth } from '@/composables/useHealth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const { state, data, error, refetch } = useHealth()
</script>

<template>
  <Card aria-live="polite" class="w-full max-w-xl">
    <CardHeader>
      <CardTitle>API Health</CardTitle>
      <CardDescription>Status from the backend health endpoint.</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <div v-if="state === 'loading'" class="space-y-3" data-testid="health-loading">
        <Skeleton class="h-4 w-1/3" />
        <Skeleton class="h-4 w-2/3" />
        <Skeleton class="h-4 w-1/2" />
      </div>

      <Alert v-else-if="state === 'success' && data" data-testid="health-success">
        <CheckCircle2 class="size-4" aria-hidden="true" />
        <AlertTitle>Service is healthy</AlertTitle>
        <AlertDescription>
          <p>Status: {{ data.data.status }}</p>
          <p>Service: {{ data.data.service }}</p>
          <p>Request ID: {{ data.meta.requestId }}</p>
        </AlertDescription>
      </Alert>

      <Alert v-else-if="state === 'error'" variant="destructive" data-testid="health-error">
        <AlertCircle class="size-4" aria-hidden="true" />
        <AlertTitle>Health check failed</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </CardContent>

    <CardFooter>
      <Button type="button" variant="outline" :disabled="state === 'loading'" @click="refetch">
        Retry
      </Button>
    </CardFooter>
  </Card>
</template>
