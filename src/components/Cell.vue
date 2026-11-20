<script setup lang="ts">
import { ref } from 'vue'
import type { Cell as MineCell } from '@/types'
import { getNumberColor } from '@/utils/color'

const props = defineProps<{
  cell: MineCell
  index: number
  cellSize: number
  longpressMs?: number
}>()

const emit = defineEmits<{
  (e: 'reveal', index: number): void
  (e: 'flag', index: number): void
}>()

const LONGPRESS_MS = props.longpressMs ?? 220
const cellRef = ref<HTMLDivElement | null>(null)
let pressTimer: ReturnType<typeof setTimeout> | null = null
const longpressTriggered = ref(false)

const startPress = (): void => {
  longpressTriggered.value = false
  pressTimer = setTimeout(() => {
    longpressTriggered.value = true
    emit('flag', props.index)
  }, LONGPRESS_MS)
}

const cancelPress = (): void => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

const onPointerDown = (): void => {
  startPress()
}

const onPointerUp = (): void => {
  cancelPress()
}

const onClick = (): void => {
  // A long-press already flagged; do not reveal as well.
  if (longpressTriggered.value) return
  emit('reveal', props.index)
}

const onContextMenu = (event: MouseEvent): void => {
  event.preventDefault()
  cancelPress()
  emit('flag', props.index)
}
</script>

<template>
  <div
    ref="cellRef"
    class="cell"
    :style="{ width: cellSize + 'px', height: cellSize + 'px', fontSize: cellSize * 0.4 + 'px' }"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="cancelPress"
    @click="onClick"
    @contextmenu="onContextMenu"
  >
    <template v-if="cell.isFlagged">🚩</template>
    <template v-else-if="cell.isRevealed">
      <template v-if="cell.isMine">💣</template>
      <template v-else-if="cell.adjacentMineCount > 0">
        <span
          class="cell-number"
          :style="{ color: getNumberColor(cell.adjacentMineCount) }"
        >
          {{ cell.adjacentMineCount }}
        </span>
      </template>
    </template>
    <template v-else-if="cell.exploded">❌</template>
  </div>
</template>

<style scoped>
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-sizing: border-box;
  cursor: pointer;
  background: #bdbdbd;
  border: 3px solid;
  border-color: #ffffff #7b7b7b #7b7b7b #ffffff;
  font-weight: bold;
}

.cell:active {
  border-color: #ffffff;
}

.cell-number {
  pointer-events: none;
}
</style>
