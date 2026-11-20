import { DifficultyLevel } from '@/types'
import type { Difficulty } from '@/types'

export const DIFFICULTIES: readonly Difficulty[] = [
  {
    id: DifficultyLevel.BEGINNER,
    name: 'Beginner',
    cols: 9,
    rows: 9,
    mines: 10,
  },
  {
    id: DifficultyLevel.INTERMEDIATE,
    name: 'Intermediate',
    cols: 16,
    rows: 16,
    mines: 40,
  },
  {
    id: DifficultyLevel.EXPERT,
    name: 'Expert',
    cols: 30,
    rows: 16,
    mines: 99,
  },
  {
    id: DifficultyLevel.CUSTOM,
    name: 'Custom',
    cols: 10,
    rows: 10,
    mines: 10,
  },
]

export const LEADERBOARD_KEY = 'minesweeper_leaderboard'

export const MIN_LONGPRESS_MS = 220

export const DEFAULT_LONGPRESS_MS = 220
