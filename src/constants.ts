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

export const DEFAULT_CUSTOM = { cols: 10, rows: 10, mines: 10 }

// The default settings applied when nothing has been saved yet.
export const DEFAULT_SETTINGS = {
  level: DifficultyLevel.BEGINNER,
  cols: DEFAULT_CUSTOM.cols,
  rows: DEFAULT_CUSTOM.rows,
  mines: DEFAULT_CUSTOM.mines,
  zoom: 1,
}

// Known difficulty ids, used to validate a persisted level so a stale or
// malformed value can never switch the board to an unknown difficulty.
export const VALID_LEVELS: readonly DifficultyLevel[] = [
  DifficultyLevel.BEGINNER,
  DifficultyLevel.INTERMEDIATE,
  DifficultyLevel.EXPERT,
  DifficultyLevel.CUSTOM,
]

export const isValidLevel = (value: unknown): value is DifficultyLevel =>
  typeof value === 'string' && VALID_LEVELS.includes(value as DifficultyLevel)

// Bounds for the Custom board inputs and the persisted user settings.
export const MIN_COLS = 5
export const MAX_COLS = 30
export const MIN_ROWS = 5
export const MAX_ROWS = 30
export const MIN_MINES = 1
export const MAX_MINES = 500
export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 2.5

// Must match the `.page { max-width }` in App.vue so the grid is sized
// to fit the rendered page, not the full viewport (which is wider on
// desktop and would push the board off the page width).
export const PAGE_MAX_WIDTH = 760

export const LEADERBOARD_KEY = 'minesweeper_leaderboard'

export const SETTINGS_KEY = 'minesweeper_settings'

export const MIN_LONGPRESS_MS = 220

export const DEFAULT_LONGPRESS_MS = 220
