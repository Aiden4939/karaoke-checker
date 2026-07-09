import { ref, onMounted } from 'vue'
import type { HealthResponse } from '@/schemas/health'
import { fetchHealth } from '@/lib/api'

export type HealthState = 'loading' | 'success' | 'error'

export function useHealth() {
  const state = ref<HealthState>('loading')
  const data = ref<HealthResponse | null>(null)
  const error = ref<string | null>(null)

  async function refetch() {
    state.value = 'loading'
    error.value = null

    try {
      data.value = await fetchHealth()
      state.value = 'success'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      state.value = 'error'
    }
  }

  onMounted(() => {
    void refetch()
  })

  return {
    state,
    data,
    error,
    refetch,
  }
}
