<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Board from '@/components/Board.vue'
import Controls from '@/components/Controls.vue'
import Leaderboard from '@/components/Leaderboard.vue'
import { useMinesweeper } from '@/composables/useMinesweeper'
import { useLeaderboard } from '@/composables/useLeaderboard'
import { useResponsiveGrid } from '@/composables/useResponsiveGrid'
import { DIFFICULTIES, DEFAULT_LONGPRESS_MS } from '@/constants'
import { DifficultyLevel } from '@/types'
import type { Difficulty } from '@/types'

const levelList = [...DIFFICULTIES] as Difficulty[]
const selectedLevel = ref<DifficultyLevel>(DifficultyLevel.BEGINNER)

const currentDifficulty = computed<Difficulty>(() => {
  const match = levelList.find((d) => d.id === selectedLevel.value)
  return match ?? levelList[0]
})

const store = useMinesweeper(() => currentDifficulty.value)
const leaderboard = useLeaderboard()
const responsiveGrid = useResponsiveGrid(
  () => store.state.cols,
  () => store.state.rows,
)

const onLevelChange = (level: DifficultyLevel): void => {
  selectedLevel.value = level
  store.reset()
}

const onReset = (): void => {
  store.reset()
}

const onReveal = (index: number): void => {
  store.reveal(index)
}

const onFlag = (index: number): void => {
  store.toggleFlag(index)
}

watch(
  () => store.state.status,
  (status) => {
    if (status === 'WON') {
      leaderboard.save(store.state.time, currentDifficulty.value.name)
    }
  },
  { once: true },
)

const difficultyLabel = computed(() => currentDifficulty.value.name)
const secondsLabel = computed(() => `${store.state.time}s`)
const remainingLabel = computed(() => `${store.state.cells.filter((c) => c.isMine).length - store.state.flagsUsed}`)

const statusEmoji = computed(() => {
  if (store.state.status === 'WON') return '😎'
  if (store.state.status === 'LOST') return '😵'
  return '🙂'
})
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="app-title">Minesweeper</h1>
      <p class="app-subtitle">A modern reimagining of a classic.</p>
    </header>

    <section class="panel">
      <Controls
        :current-level="selectedLevel"
        @level-change="onLevelChange"
        @reset="onReset"
      />
    </section>

    <section class="panel">
      <div class="status-bar">
        <div class="status-pill">
          <span class="status-label">Level</span>
          <span class="status-value">{{ difficultyLabel }}</span>
        </div>
        <div class="status-pill">
          <span class="status-label">Time</span>
          <span class="status-value">{{ secondsLabel }}</span>
        </div>
        <button
          class="btn btn-primary"
          @click="onReset"
        >
          New Game
        </button>
        <div class="status-face">{{ statusEmoji }}</div>
        <div class="status-pill">
          <span class="status-label">Mines</span>
          <span class="status-value">{{ remainingLabel }}</span>
        </div>
      </div>

      <Board
        :cells="store.state.cells"
        :cols="store.state.cols"
        :cell-size="responsiveGrid.cellSize.value"
        :longpress-ms="DEFAULT_LONGPRESS_MS"
        @reveal="onReveal"
        @flag="onFlag"
      />

      <div class="status-bar">
        <button
          class="btn btn-sm btn-outline-primary"
          @click="responsiveGrid.zoomIn"
        >
          Zoom +
        </button>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="responsiveGrid.zoomOut"
        >
          Zoom -
        </button>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="store.reset"
        >
          Reset
        </button>
      </div>
    </section>

    <section class="panel">
      <Leaderboard
        :entries="leaderboard.entries.value"
        @clear="leaderboard.clear"
      />
    </section>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  min-width: 100vw;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.app-subtitle {
  color: #6c757d;
  margin: 0;
}

.panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.status-pill {
  display: flex;
  flex-direction: column;
  min-width: 72px;
}

.status-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6c757d;
  letter-spacing: 0.05em;
}

.status-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.status-face {
  font-size: 2rem;
}
</style>
