import { reactive, computed } from 'vue'
import { initGrid, getNeighborCells } from '@/utils/grid'
import type { Cell, Difficulty, GameStatus } from '@/types'

export const useMinesweeper = (difficulty: () => Difficulty) => {
  const initial = initGrid(difficulty().rows, difficulty().cols, difficulty().mines)
  const state = reactive({
    cols: initial.cols,
    rows: initial.rows,
    cells: initial.cells,
    status: 'IDLE' as GameStatus,
    time: 0,
    flagsUsed: 0,
  })

  const timer = {
    id: null as ReturnType<typeof setInterval> | null,
  }

  const startTimer = (): void => {
    stopTimer()
    timer.id = setInterval(() => {
      state.time += 1
    }, 1000)
  }

  const stopTimer = (): void => {
    if (timer.id) {
      clearInterval(timer.id)
      timer.id = null
    }
  }

  const isGameOver = computed(() => state.status !== 'PLAYING')

  const remainingCells = computed(() => state.cells.length - state.flagsUsed)

  const countAdjacentMines = (index: number, cells: Cell[]): number =>
    getNeighborCells(index, { cols: state.cols, rows: state.rows })
      .filter((n) => cells[n].isMine)
      .length

  // Place mines after the first click, keeping the clicked cell and its
  // neighbors mine-free so the opening move is never a loss.
  const placeMines = (firstIndex: number): void => {
    const { rows, cols, mines } = difficulty()
    const total = rows * cols

    const safe = new Set<number>()
    safe.add(firstIndex)
    getNeighborCells(firstIndex, { cols, rows }).forEach((n) => safe.add(n))

    const placement = new Set<number>()
    let attempts = 0
    while (placement.size < mines && attempts < total * 50) {
      attempts += 1
      const candidate = Math.floor(Math.random() * total)
      if (!safe.has(candidate)) placement.add(candidate)
    }
    // Fallback if not enough room (very large mine counts): fill remaining.
    if (placement.size < mines) {
      for (let i = 0; i < total; i++) {
        if (placement.size >= mines) break
        if (!safe.has(i)) placement.add(i)
      }
    }

    const cells: Cell[] = new Array(total).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMineCount: 0,
      exploded: false,
    }))

    placement.forEach((idx) => {
      cells[idx].isMine = true
    })

    for (let i = 0; i < total; i++) {
      if (cells[i].isMine) continue
      cells[i] = { ...cells[i], adjacentMineCount: countAdjacentMines(i, cells) }
    }

    state.cols = cols
    state.rows = rows
    state.cells = cells
  }

  // Flood-reveal: reveal the target and cascade through the region of empty
  // (adjacentMineCount === 0) cells. A numbered cell is revealed on its own and
  // acts as the boundary of the flood — the cascade must NOT cross it, otherwise
  // a single click bleeds across the whole board.
  const floodReveal = (index: number): void => {
    const cells = state.cells
    if (cells[index].isMine || cells[index].isRevealed || cells[index].isFlagged) return

    cells[index] = { ...cells[index], isRevealed: true }

    if (cells[index].adjacentMineCount > 0) return

    const neighbors = getNeighborCells(index, { cols: state.cols, rows: state.rows })
    neighbors.forEach((n) => {
      if (!cells[n].isMine) floodReveal(n)
    })
  }

  const reveal = (index: number): void => {
    if (state.status === 'WON' || state.status === 'LOST') return
    const cell = state.cells[index]
    if (cell.isFlagged || cell.isRevealed) return

    if (state.status === 'IDLE') {
      placeMines(index)
    }

    state.status = 'PLAYING'
    startTimer()

    if (state.cells[index].isMine) {
      state.cells = state.cells.map((c) =>
        c.isMine ? { ...c, isRevealed: true, exploded: c === cell } : c,
      )
      state.status = 'LOST'
      stopTimer()
      return
    }

    floodReveal(index)

    // Win when every NON-mine cell has been revealed. Mine cells are never
    // a win requirement — they're shown only after a loss — so they must be
    // skipped, not treated as an outstanding cell that must be revealed.
    const nonMineRevealed = state.cells.every((cell) => {
      if (!cell.isMine) return cell.isRevealed
      return true
    })
    if (nonMineRevealed) {
      state.status = 'WON'
      stopTimer()
    }
  }

  const toggleFlag = (index: number): void => {
    if (state.status === 'WON' || state.status === 'LOST') return
    const cell = state.cells[index]
    if (cell.isRevealed) return

    if (state.status === 'IDLE') {
      state.status = 'PLAYING'
      startTimer()
    }

    state.cells = state.cells.map((c, i) =>
      i === index ? { ...c, isFlagged: !c.isFlagged } : c,
    )
    state.flagsUsed = state.cells.reduce((acc, c) => acc + (c.isFlagged ? 1 : 0), 0)

    const mineCount = state.cells.filter((c) => c.isMine).length
    if (state.flagsUsed === mineCount) {
      state.status = 'WON'
      stopTimer()
    }
  }

  const reset = (): void => {
    stopTimer()
    Object.assign(state, initGrid(difficulty().rows, difficulty().cols, difficulty().mines))
    state.flagsUsed = 0
    state.time = 0
    state.status = 'IDLE'
  }

  return {
    state,
    remainingCells,
    isGameOver,
    placeMines,
    reveal,
    toggleFlag,
    reset,
  }
}

export default useMinesweeper
