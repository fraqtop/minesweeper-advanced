<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Board from '@/components/Board.vue'
import Controls from '@/components/Controls.vue'
import Leaderboard from '@/components/Leaderboard.vue'
import { useMinesweeper } from '@/composables/useMinesweeper'
import { useLeaderboard } from '@/composables/useLeaderboard'
import { useResponsiveGrid } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { DIFFICULTIES, DEFAULT_LONGPRESS_MS } from '@/constants'
import { DifficultyLevel } from '@/types'
import type { Difficulty } from '@/types'

const levelList = [...DIFFICULTIES] as Difficulty[]
const settings = useSettings()
// Restore the level the user last played; fall back to Beginner when unset.
const selectedLevel = ref<DifficultyLevel>(
  settings.settings.value.level ?? DifficultyLevel.BEGINNER,
)

const isCustom = computed(() => selectedLevel.value === DifficultyLevel.CUSTOM)

// For a preset level this is the preset; for CUSTOM it reflects the editable
// W/H/💣 inputs (stored in `settings`). Because the store reads this getter as
// its source of truth, the game always uses the size and mines the user chose.
const currentDifficulty = computed<Difficulty>(() => {
  if (isCustom.value) {
    return {
      id: DifficultyLevel.CUSTOM,
      name: 'Custom',
      cols: settings.settings.value.cols,
      rows: settings.settings.value.rows,
      mines: settings.safeMines.value,
    }
  }
  const match = levelList.find((d) => d.id === selectedLevel.value)
  return match ?? levelList[0]
})

const store = useMinesweeper(() => currentDifficulty.value)
const leaderboard = useLeaderboard()
const responsiveGrid = useResponsiveGrid(
  () => store.state.cols,
  () => store.state.rows,
)

// Persist the user's zoom and let it drive the grid zoom so reloads keep the
// zoom the last session used. `useSettings` reads the persisted zoom from
// localStorage synchronously on its first call, so set the grid zoom from it
// here once on mount; the watcher below keeps live zoom changes persisted.
responsiveGrid.zoom.value = settings.settings.value.zoom

watch(() => settings.settings.value.zoom, (zoom) => {
  responsiveGrid.zoom.value = zoom
})
watch(responsiveGrid.zoom, (zoom) => {
  settings.setZoom(zoom)
})

const onLevelChange = (level: DifficultyLevel): void => {
  selectedLevel.value = level
  settings.setLevel(level)
  // CUSTOM resumes the persisted custom config; presets always use their own
  // fixed dimensions. Neither touches zoom, which is kept independent.
  store.reset()
}

const onReset = (): void => {
  store.reset()
}

// Editing a custom board commits the value, persists it, and restarts the
// game so the board reflects the new size/mine count immediately.
const onColsChange = (cols: number): void => {
  settings.setCols(cols)
  if (isCustom.value) store.reset()
}
const onRowsChange = (rows: number): void => {
  settings.setRows(rows)
  if (isCustom.value) store.reset()
}
const onMinesChange = (mines: number): void => {
  settings.setMines(mines)
  if (isCustom.value) store.reset()
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
        :cols="settings.settings.value.cols"
        :rows="settings.settings.value.rows"
        :mines="settings.safeMines.value"
        @level-change="onLevelChange"
        @reset="onReset"
        @cols-change="onColsChange"
        @rows-change="onRowsChange"
        @mines-change="onMinesChange"
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
