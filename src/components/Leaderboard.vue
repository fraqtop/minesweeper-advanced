<script setup lang="ts">
import { computed } from 'vue'
import type { LeaderboardEntry } from '@/types'

const props = defineProps<{
  entries: LeaderboardEntry[]
}>()

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const formattedEntries = computed(() =>
  props.entries.map((entry) => ({
    ...entry,
    formattedTime: new Date(entry.createdAt).toLocaleTimeString(),
    formattedDate: new Date(entry.createdAt).toLocaleDateString(),
  })),
)
</script>

<template>
  <div class="leaderboard">
    <div class="leaderboard-header">
      <h2 class="leaderboard-title">Leaderboard</h2>
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>

    <div v-if="formattedEntries.length === 0" class="leaderboard-empty">
      No scores yet. Play a game!
    </div>

    <table v-else class="table table-sm table-striped leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Level</th>
          <th>Time</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in formattedEntries" :key="entry.uid">
          <td>{{ index + 1 }}</td>
          <td>{{ entry.level }}</td>
          <td>{{ entry.formattedTime }}</td>
          <td>{{ entry.formattedDate }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.leaderboard {
  margin-top: 1.5rem;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leaderboard-title {
  margin: 0;
  font-size: 1.25rem;
}

.leaderboard-empty {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
}
</style>
