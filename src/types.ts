export enum CellState {
  HIDDEN = 'HIDDEN',
  FLAGGED = 'FLAGGED',
  REVEALED = 'REVEALED',
  MINESHOOTED = 'MINESHOOTED',
}

export type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMineCount: number
  exploded: boolean
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT',
  CUSTOM = 'CUSTOM',
}

export type Difficulty = {
  id: DifficultyLevel
  name: string
  cols: number
  rows: number
  mines: number
}

export type GameStatus = 'PLAYING' | 'WON' | 'LOST' | 'IDLE'

export type LeaderboardEntry = {
  score: number
  level: string
  createdAt: string
  uid: string
}
