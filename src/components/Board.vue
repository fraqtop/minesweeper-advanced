<script setup lang="ts">
import Cell from './Cell.vue'
import type { Cell as MineCell } from '@/types'

const props = defineProps<{
  cells: MineCell[]
  cols: number
  cellSize: number
  longpressMs?: number
}>()

const emit = defineEmits<{
  (e: 'reveal', index: number): void
  (e: 'flag', index: number): void
}>()

const gridStyle = () => ({
  gridTemplateColumns: `repeat(${props.cols}, ${props.cellSize}px)`,
})
</script>

<template>
  <div class="board-wrapper">
    <div
      class="board"
      :style="gridStyle()"
    >
      <Cell
        v-for="(cell, index) in props.cells"
        :key="index"
        :cell="cell"
        :index="index"
        :cell-size="props.cellSize"
        :longpress-ms="props.longpressMs"
        @reveal="emit('reveal', $event)"
        @flag="emit('flag', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.board-wrapper {
  display: flex;
  /* `safe` keeps the left edge reachable when zoom makes the board wider than
     the wrapper; without it centered overflow is clipped on the left. */
  justify-content: safe center;
  align-items: center;
  padding: 16px;
  overflow: auto;
}

.board {
  display: grid;
  /* A flex item shrinks by default. With fixed-width cells that shrinks the
     board border while the cells keep their width and spill outside it. */
  flex: 0 0 auto;
  gap: 2px;
  padding: 6px;
  background: #bdbdbd;
  border: 4px solid;
  border-color: #7b7b7b #ffffff #ffffff #7b7b7b;
}
</style>
