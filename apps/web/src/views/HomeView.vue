<script setup lang="ts">
import type { PlaylistCheck, PlaylistCheckItem, ProviderMatchStatus } from '@app/contracts'
import { computed, onUnmounted, reactive, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import {
  downloadPlaylistCheckCsv,
  fetchPlaylistCheck,
  rerunPlaylistCheckItem,
  savePlaylistCheckItem,
  startPlaylistCheck,
} from '@/lib/api'

const playlistUrl = ref('')
const check = ref<PlaylistCheck | null>(null)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const editingItemId = ref<string | null>(null)
const editForm = reactive({
  songTitle: '',
  artistName: '',
})
let pollTimer: number | null = null

const progressPercent = computed(() => {
  if (!check.value || check.value.totalItems === 0) {
    return 0
  }

  return Math.round((check.value.completedItems / check.value.totalItems) * 100)
})

const summary = computed(() => {
  const initial = {
    joysoundFound: 0,
    damFound: 0,
    ambiguous: 0,
    errors: 0,
  }

  return (
    check.value?.items.reduce((counts, item) => {
      if (item.providers.joysound.status === 'found') {
        counts.joysoundFound += 1
      }

      if (item.providers.dam.status === 'found') {
        counts.damFound += 1
      }

      if (
        item.providers.joysound.status === 'ambiguous' ||
        item.providers.dam.status === 'ambiguous'
      ) {
        counts.ambiguous += 1
      }

      if (item.providers.joysound.status === 'error' || item.providers.dam.status === 'error') {
        counts.errors += 1
      }

      return counts
    }, initial) ?? initial
  )
})

function statusLabel(status: ProviderMatchStatus): string {
  const labels: Record<ProviderMatchStatus, string> = {
    found: 'Found',
    not_found: 'Not found',
    ambiguous: 'Ambiguous',
    error: 'Error',
  }

  return labels[status]
}

function statusClass(status: ProviderMatchStatus): string {
  const classes: Record<ProviderMatchStatus, string> = {
    found: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    not_found: 'border-slate-200 bg-slate-50 text-slate-600',
    ambiguous: 'border-amber-200 bg-amber-50 text-amber-700',
    error: 'border-red-200 bg-red-50 text-red-700',
  }

  return classes[status]
}

function stopPolling() {
  if (pollTimer) {
    window.clearTimeout(pollTimer)
    pollTimer = null
  }
}

async function pollCheck(id: string) {
  try {
    const response = await fetchPlaylistCheck(id)
    check.value = response.data

    if (response.data.status === 'running' || response.data.status === 'pending') {
      pollTimer = window.setTimeout(() => {
        void pollCheck(id)
      }, 1500)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load playlist check'
  }
}

async function submitPlaylist() {
  stopPolling()
  error.value = null
  isSubmitting.value = true

  try {
    const response = await startPlaylistCheck({
      playlistUrl: playlistUrl.value,
    })
    await pollCheck(response.data.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to start playlist check'
  } finally {
    isSubmitting.value = false
  }
}

function startEdit(item: PlaylistCheckItem) {
  editingItemId.value = item.id
  editForm.songTitle = item.parsed.songTitle
  editForm.artistName = item.parsed.artistName ?? ''
}

async function saveEdit(item: PlaylistCheckItem) {
  if (!check.value) {
    return
  }

  error.value = null

  try {
    const response = await savePlaylistCheckItem(check.value.id, item.id, {
      songTitle: editForm.songTitle,
      artistName: editForm.artistName || undefined,
    })
    check.value = response.data
    editingItemId.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save item'
  }
}

async function recheckItem(item: PlaylistCheckItem) {
  if (!check.value) {
    return
  }

  error.value = null

  try {
    const response = await rerunPlaylistCheckItem(check.value.id, item.id)
    check.value = response.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to recheck item'
  }
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function exportCsv() {
  if (!check.value) {
    return
  }

  const csv = await downloadPlaylistCheckCsv(check.value.id)
  downloadText(`playlist-check-${check.value.id}.csv`, csv, 'text/csv')
}

function exportJson() {
  if (!check.value) {
    return
  }

  downloadText(
    `playlist-check-${check.value.id}.json`,
    JSON.stringify(check.value, null, 2),
    'application/json',
  )
}

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Karaoke Checker</h1>
      <p class="max-w-3xl text-sm text-muted-foreground">
        Import a YouTube playlist, parse each video title, and check JOYSOUND and DAM matches.
      </p>
    </div>

    <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submitPlaylist">
      <Input
        v-model="playlistUrl"
        type="url"
        required
        placeholder="https://www.youtube.com/playlist?list=..."
        aria-label="YouTube playlist URL"
      />
      <Button type="submit" :disabled="isSubmitting || !playlistUrl" class="sm:w-32">
        {{ isSubmitting ? 'Starting' : 'Check' }}
      </Button>
    </form>

    <div
      v-if="error"
      class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div v-if="check" class="space-y-5">
      <div class="rounded-lg border bg-card p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-semibold">{{ check.playlistTitle || check.playlistId }}</h2>
            <p class="text-sm text-muted-foreground">
              {{ check.status }} · {{ check.completedItems }} / {{ check.totalItems }} completed
            </p>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="outline" size="sm" @click="exportJson">JSON</Button>
            <Button type="button" variant="outline" size="sm" @click="exportCsv">CSV</Button>
          </div>
        </div>
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full bg-foreground transition-all"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <p v-if="check.errorMessage" class="mt-3 text-sm text-red-600">{{ check.errorMessage }}</p>
      </div>

      <div class="grid gap-3 sm:grid-cols-4">
        <div class="rounded-lg border p-3">
          <p class="text-sm text-muted-foreground">JOYSOUND Found</p>
          <p class="text-2xl font-semibold">{{ summary.joysoundFound }}</p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-sm text-muted-foreground">DAM Found</p>
          <p class="text-2xl font-semibold">{{ summary.damFound }}</p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-sm text-muted-foreground">Ambiguous</p>
          <p class="text-2xl font-semibold">{{ summary.ambiguous }}</p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-sm text-muted-foreground">Errors</p>
          <p class="text-2xl font-semibold">{{ summary.errors }}</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border">
        <table class="w-full min-w-[960px] text-left text-sm">
          <thead class="border-b bg-muted/60">
            <tr>
              <th class="px-3 py-2 font-medium">YouTube</th>
              <th class="px-3 py-2 font-medium">Song</th>
              <th class="px-3 py-2 font-medium">Artist</th>
              <th class="px-3 py-2 font-medium">Confidence</th>
              <th class="px-3 py-2 font-medium">JOYSOUND</th>
              <th class="px-3 py-2 font-medium">DAM</th>
              <th class="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in check.items" :key="item.id" class="border-b last:border-0">
              <td class="max-w-xs px-3 py-3 align-top">
                <a
                  :href="item.youtubeUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="font-medium underline"
                >
                  {{ item.youtubeTitle }}
                </a>
                <p v-if="item.youtubeChannelTitle" class="mt-1 text-xs text-muted-foreground">
                  {{ item.youtubeChannelTitle }}
                </p>
              </td>
              <td class="px-3 py-3 align-top">
                <Input
                  v-if="editingItemId === item.id"
                  v-model="editForm.songTitle"
                  aria-label="Song title"
                  class="min-w-40"
                />
                <span v-else>{{ item.parsed.songTitle }}</span>
              </td>
              <td class="px-3 py-3 align-top">
                <Input
                  v-if="editingItemId === item.id"
                  v-model="editForm.artistName"
                  aria-label="Artist name"
                  class="min-w-40"
                />
                <span v-else>{{ item.parsed.artistName || '-' }}</span>
              </td>
              <td class="px-3 py-3 align-top">{{ item.parsed.confidence }}</td>
              <td class="px-3 py-3 align-top">
                <a
                  v-if="item.providers.joysound.matches[0]?.url"
                  :href="item.providers.joysound.matches[0]?.url"
                  target="_blank"
                  rel="noreferrer"
                  :class="[
                    'inline-flex rounded-full border px-2 py-1 text-xs',
                    statusClass(item.providers.joysound.status),
                  ]"
                >
                  {{ statusLabel(item.providers.joysound.status) }}
                </a>
                <span
                  v-else
                  :class="[
                    'inline-flex rounded-full border px-2 py-1 text-xs',
                    statusClass(item.providers.joysound.status),
                  ]"
                >
                  {{ statusLabel(item.providers.joysound.status) }}
                </span>
              </td>
              <td class="px-3 py-3 align-top">
                <a
                  v-if="item.providers.dam.matches[0]?.url"
                  :href="item.providers.dam.matches[0]?.url"
                  target="_blank"
                  rel="noreferrer"
                  :class="[
                    'inline-flex rounded-full border px-2 py-1 text-xs',
                    statusClass(item.providers.dam.status),
                  ]"
                >
                  {{ statusLabel(item.providers.dam.status) }}
                </a>
                <span
                  v-else
                  :class="[
                    'inline-flex rounded-full border px-2 py-1 text-xs',
                    statusClass(item.providers.dam.status),
                  ]"
                >
                  {{ statusLabel(item.providers.dam.status) }}
                </span>
              </td>
              <td class="px-3 py-3 align-top">
                <div class="flex flex-wrap gap-2">
                  <template v-if="editingItemId === item.id">
                    <Button type="button" size="sm" @click="saveEdit(item)">Save</Button>
                    <Button type="button" variant="outline" size="sm" @click="editingItemId = null"
                      >Cancel</Button
                    >
                  </template>
                  <template v-else>
                    <Button type="button" variant="outline" size="sm" @click="startEdit(item)"
                      >Edit</Button
                    >
                    <Button type="button" variant="outline" size="sm" @click="recheckItem(item)"
                      >Recheck</Button
                    >
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
