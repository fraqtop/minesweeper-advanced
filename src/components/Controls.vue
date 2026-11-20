<script setup lang="ts">
import { DifficultyLevel } from '@/types'
import { DIFFICULTIES } from '@/constants'

const props = defineProps<{
  currentLevel: DifficultyLevel
}>()

const emit = defineEmits<{
  (e: 'level-change', level: DifficultyLevel): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="controls">
    <div class="control-group">
      <label for="difficulty" class="control-label">Difficulty</label>
      <select
        id="difficulty"
        class="form-select"
        :value="props.currentLevel"
        @change="emit('level-change', ($event.target as HTMLSelectElement).value as DifficultyLevel)"
      >
        <option
          v-for="level in DIFFICULTIES"
          :key="level.id"
          :value="level.id"
        >
          {{ level.name }}
        </option>
      </select>
    </div>

    <button
      class="btn btn-primary"
      @click="emit('reset')"
    >
      New Game
    </button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-label {
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
