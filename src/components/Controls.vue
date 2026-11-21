<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DifficultyLevel } from '@/types'
import { DIFFICULTIES } from '@/constants'
import type { Difficulty } from '@/types'

const props = defineProps<{
  currentLevel: DifficultyLevel
  cols: number
  rows: number
  mines: number
}>()

const emit = defineEmits<{
  (e: 'level-change', level: DifficultyLevel): void
  (e: 'reset'): void
  (e: 'cols-change', cols: number): void
  (e: 'rows-change', rows: number): void
  (e: 'mines-change', mines: number): void
}>()

const isCustom = computed(() => props.currentLevel === DifficultyLevel.CUSTOM)

// Debounce local input edits so we don't persist a half-typed value
// (e.g. an empty string) until the user commits with Enter.
const draftCols = ref(String(props.cols))
const draftRows = ref(String(props.rows))
const draftMines = ref(String(props.mines))

const syncDrafts = (): void => {
  draftCols.value = String(props.cols)
  draftRows.value = String(props.rows)
  draftMines.value = String(props.mines)
}

const submitCols = (): void => {
  const value = parseInt(draftCols.value, 10)
  if (!Number.isNaN(value)) emit('cols-change', value)
  syncDrafts()
}

const submitRows = (): void => {
  const value = parseInt(draftRows.value, 10)
  if (!Number.isNaN(value)) emit('rows-change', value)
  syncDrafts()
}

const submitMines = (): void => {
  const value = parseInt(draftMines.value, 10)
  if (!Number.isNaN(value)) emit('mines-change', value)
  syncDrafts()
}

const resetDrafts = (): void => {
  draftCols.value = String(props.cols)
  draftRows.value = String(props.rows)
  draftMines.value = String(props.mines)
}

// Keep the draft inputs in sync when the level switches (e.g. back to a
// preset), so an input doesn't keep showing the previous level's value.
watch(
  () => [props.cols, props.rows, props.mines] as const,
  ([cols, rows, mines]) => {
    draftCols.value = String(cols)
    draftRows.value = String(rows)
    draftMines.value = String(mines)
  },
)

defineExpose({ syncDrafts, resetDrafts })
</script>

<template>
  <div class="controls">
    <div class="control-group">
      <label class="control-label">Difficulty</label>
      <div class="difficulty-row">
        <button
          v-for="level in DIFFICULTIES as Difficulty[]"
          :key="level.id"
          type="button"
          class="btn btn-sm"
          :class="currentLevel === level.id ? 'btn-primary' : 'btn-outline-primary'"
          @click="emit('level-change', level.id)"
        >
          {{ level.name }}
        </button>
      </div>
    </div>

    <div
      v-if="isCustom"
      class="control-group custom-group"
    >
      <label class="control-label">Custom board</label>
      <div class="custom-row">
        <div class="field">
          <label for="custom-cols">W</label>
          <input
            id="custom-cols"
            v-model="draftCols"
            type="text"
            inputmode="numeric"
            class="form-control custom-input"
            @keyup.enter="submitCols"
            @blur="submitCols"
          />
        </div>
        <div class="field">
          <label for="custom-rows">H</label>
          <input
            id="custom-rows"
            v-model="draftRows"
            type="text"
            inputmode="numeric"
            class="form-control custom-input"
            @keyup.enter="submitRows"
            @blur="submitRows"
          />
        </div>
        <div class="field">
          <label for="custom-mines">💣</label>
          <input
            id="custom-mines"
            v-model="draftMines"
            type="text"
            inputmode="numeric"
            class="form-control custom-input"
            @keyup.enter="submitMines"
            @blur="submitMines"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 16px;
  align-items: flex-start;
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

.difficulty-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.custom-group {
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.custom-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 600;
}

.custom-input {
  width: 64px;
}
</style>
