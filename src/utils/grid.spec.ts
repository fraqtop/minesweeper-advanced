import { describe, expect, it } from 'vitest'
import { getIndex, getCoords, getNeighborCells, initGrid, revealNeighbors } from './grid'

describe('getIndex / getCoords', () => {
  it('round-trips between index and coords for a 3x3 grid', () => {
    const cols = 3
    const index = getIndex(1, 2, cols)
    expect(index).toBe(5)
    expect(getCoords(index, cols)).toEqual({ row: 1, col: 2 })
  })

  it('keeps corners on the edges', () => {
    expect(getIndex(0, 0, 3)).toBe(0)
    expect(getIndex(2, 2, 3)).toBe(8)
  })
})

describe('getNeighborCells', () => {
  const grid = { cols: 3, rows: 3 }
  it('returns 5 neighbors for a non-corner edge cell on the top row', () => {
    const neighbors = getNeighborCells(getIndex(0, 1, 3), grid)
    expect(neighbors.length).toBe(5)
  })

  it('returns 8 neighbors for a center cell', () => {
    const neighbors = getNeighborCells(getIndex(1, 1, 3), grid)
    expect(neighbors.length).toBe(8)
  })

  it('returns 3 neighbors for a corner cell', () => {
    const neighbors = getNeighborCells(0, grid)
    expect(neighbors.length).toBe(3)
  })

  it('never returns out-of-bounds indices', () => {
    const neighbors = getNeighborCells(getIndex(0, 0, 4), { cols: 4, rows: 4 })
    expect(neighbors).toEqual([1, 4, 5])
  })
})

describe('initGrid', () => {
  it('creates the right number of cells', () => {
    const grid = initGrid(3, 3, 2)
    expect(grid.cols).toBe(3)
    expect(grid.rows).toBe(3)
    expect(grid.cells.length).toBe(9)
  })

  it('places exactly the requested number of mines', () => {
    const mines = initGrid(5, 5, 12)
    const mineCount = mines.cells.filter((c) => c.isMine).length
    expect(mineCount).toBe(12)
  })

  it('does not assign an adjacency count to mines', () => {
    const grid = initGrid(5, 5, 5)
    grid.cells.forEach((c) => {
      if (c.isMine) expect(c.adjacentMineCount).toBe(0)
    })
  })

  it('assigns a mine adjacency count only from adjacent mines', () => {
    const cells = Array.from({ length: 9 }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMineCount: 0,
      exploded: false,
    }))
    // Manually build a deterministic grid: mine at index 0 and 8.
    const grid = { cols: 3, rows: 3, cells }
    grid.cells[0].isMine = true
    grid.cells[8].isMine = true
    const centerIdx = getIndex(1, 1, 3)
    let count = 0
    getNeighborCells(centerIdx, grid).forEach((n) => {
      if (grid.cells[n].isMine) count++
    })
    expect(count).toBe(2)
  })
})

describe('revealNeighbors', () => {
  it('reveals adjacent non-mine cells around a given index', () => {
    const grid = initGrid(3, 3, 1)
    // Put the mine away from the corner.
    grid.cells[0].isMine = false
    grid.cells[1].isMine = false
    grid.cells[2].isMine = false
    grid.cells[3].isMine = false
    grid.cells[5].isMine = false
    grid.cells[6].isMine = false
    grid.cells[7].isMine = false
    grid.cells[8].isMine = true

    revealNeighbors(0, grid)

    // Corner 0 neighbors: 1, 3, 4
    expect(grid.cells[1].isRevealed).toBe(true)
    expect(grid.cells[3].isRevealed).toBe(true)
    expect(grid.cells[4].isRevealed).toBe(true)
    // The mine is not revealed.
    expect(grid.cells[8].isRevealed).toBe(false)
  })
})
