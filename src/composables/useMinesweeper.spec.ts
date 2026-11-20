import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useMinesweeper } from './useMinesweeper'
import { getNeighborCells } from '../utils/grid'
import { DifficultyLevel } from '../types'
import type { Difficulty } from '../types'

const smallDifficulty: () => Difficulty = () => ({
  id: DifficultyLevel.CUSTOM,
  name: 'Custom',
  cols: 5,
  rows: 5,
  mines: 3,
})

describe('useMinesweeper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in IDLE status', () => {
    const store = useMinesweeper(smallDifficulty)
    expect(store.state.status).toBe('IDLE')
    expect(store.state.time).toBe(0)
    expect(store.state.cells.length).toBe(25)
  })

  it('places mines after the first click, keeping the click and neighbors safe', () => {
    const store = useMinesweeper(smallDifficulty)
    const click = 12
    store.reveal(click)

    expect(store.state.status).toBe('PLAYING')
    expect(store.state.cells[click].isMine).toBe(false)
    getNeighborCells(click, { cols: 5, rows: 5 }).forEach((n) => {
      expect(store.state.cells[n].isMine).toBe(false)
    })
    const mineCount = store.state.cells.filter((c) => c.isMine).length
    expect(mineCount).toBe(3)
  })

  it('advances the time via the timer during play', () => {
    const store = useMinesweeper(smallDifficulty)
    store.reveal(0)
    vi.advanceTimersByTime(3000)
    expect(store.state.time).toBe(3)
  })

  it('reveals a clicked safe cell', () => {
    const store = useMinesweeper(smallDifficulty)
    store.reveal(0)
    expect(store.state.cells[0].isRevealed).toBe(true)
  })

  it('cannot reveal the same cell twice', () => {
    const store = useMinesweeper(smallDifficulty)
    store.reveal(0)
    store.reveal(0)
    expect(store.state.cells[0].isRevealed).toBe(true)
  })

  it('flags and unflags a cell, tracking flags used', () => {
    const store = useMinesweeper(smallDifficulty)
    store.toggleFlag(0)
    expect(store.state.cells[0].isFlagged).toBe(true)
    expect(store.state.flagsUsed).toBe(1)
    store.toggleFlag(0)
    expect(store.state.cells[0].isFlagged).toBe(false)
    expect(store.state.flagsUsed).toBe(0)
  })

  it('cannot flag a revealed cell', () => {
    const store = useMinesweeper(smallDifficulty)
    store.reveal(0)
    store.toggleFlag(0)
    expect(store.state.cells[0].isFlagged).toBe(false)
  })

  it('loses when clicking a mine', () => {
    const store = useMinesweeper(smallDifficulty)
    // Reveal a central cell to run placeMines; mines now exist.
    store.reveal(12)
    // Pick an index that is a real mine (not the safe opening cell) and reveal it.
    const mineIndex = store.state.cells.findIndex((c) => c.isMine)
    expect(mineIndex).toBeGreaterThanOrEqual(0)
    store.reveal(mineIndex)
    expect(store.state.status).toBe('LOST')
    expect(store.state.cells[mineIndex].isRevealed).toBe(true)
  })

  it('resets to initial state', () => {
    const store = useMinesweeper(smallDifficulty)
    store.reveal(0)
    store.state.cells[0].isRevealed = true
    store.state.time = 5
    store.reset()
    expect(store.state.status).toBe('IDLE')
    expect(store.state.time).toBe(0)
    expect(store.state.flagsUsed).toBe(0)
    expect(store.state.cells.every((c) => !c.isRevealed)).toBe(true)
  })
})
