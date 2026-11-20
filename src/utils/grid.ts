import type { Cell } from '@/types'

export type Grid = {
  cols: number
  rows: number
  cells: Cell[]
}

export const getIndex = (row: number, col: number, cols: number): number => {
  return row * cols + col
}

export const getCoords = (index: number, cols: number): { row: number; col: number } => {
  return { row: Math.floor(index / cols), col: index % cols }
}

export const isInBounds = (row: number, col: number, rows: number, cols: number): boolean =>
  row >= 0 && row < rows && col >= 0 && col < cols

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export const getNeighborCells = (
  index: number,
  grid: { cols: number; rows: number },
): number[] => {
  const { row, col } = getCoords(index, grid.cols)
  const neighbors: number[] = []

  for (const [dRow, dCol] of DIRECTIONS) {
    const nRow = row + dRow
    const nCol = col + dCol

    if (isInBounds(nRow, nCol, grid.rows, grid.cols)) {
      neighbors.push(getIndex(nRow, nCol, grid.cols))
    }
  }

  return neighbors
}

const makeCell = (isMine: boolean): Cell => ({
  isMine,
  isRevealed: false,
  isFlagged: false,
  adjacentMineCount: 0,
  exploded: false,
})

export const initGrid = (rows: number, cols: number, mines: number): Grid => {
  const totalCells = rows * cols
  const grid: Grid = {
    cols,
    rows,
    cells: Array.from({ length: totalCells }, () => makeCell(false)),
  }

  const mineSet = new Set<number>()
  while (mineSet.size < mines) {
    mineSet.add(Math.floor(Math.random() * totalCells))
  }

  mineSet.forEach((idx) => {
    grid.cells[idx] = makeCell(true)
  })

  for (let i = 0; i < totalCells; i++) {
    if (grid.cells[i].isMine) continue

    let count = 0
    for (const n of getNeighborCells(i, grid)) {
      if (grid.cells[n].isMine) count++
    }
    grid.cells[i].adjacentMineCount = count
  }

  return grid
}

export const revealNeighbors = (index: number, grid: Grid): void => {
  const { row, col } = getCoords(index, grid.cols)
  for (const [dRow, dCol] of DIRECTIONS) {
    const nRow = row + dRow
    const nCol = col + dCol
    if (isInBounds(nRow, nCol, grid.rows, grid.cols)) {
      const nIdx = getIndex(nRow, nCol, grid.cols)
      if (!grid.cells[nIdx].isMine) {
        grid.cells[nIdx].isRevealed = true
      }
    }
  }
}
