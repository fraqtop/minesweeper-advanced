import { computed, ref } from 'vue'
import {
  SETTINGS_KEY,
  MIN_COLS,
  MAX_COLS,
  MIN_ROWS,
  MAX_ROWS,
  MIN_MINES,
  MAX_MINES,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_SETTINGS,
  DEFAULT_CUSTOM,
  isValidLevel,
} from '@/constants'
import { DifficultyLevel } from '@/types'

export type UserSettings = {
  level: DifficultyLevel
  cols: number
  rows: number
  mines: number
  zoom: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

let settingsCache: UserSettings | null = null

export const resetSettingsCache = (): void => {
  settingsCache = null
}

const readFromStorage = (): UserSettings => {
  if (settingsCache) return settingsCache
  try {
    const raw =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(SETTINGS_KEY)
        : null
    const parsed = raw ? (JSON.parse(raw) as Partial<UserSettings>) : {}
    settingsCache = {
      level: isValidLevel(parsed.level)
        ? parsed.level
        : DEFAULT_SETTINGS.level,
      cols: clamp(parsed.cols ?? DEFAULT_CUSTOM.cols, MIN_COLS, MAX_COLS),
      rows: clamp(parsed.rows ?? DEFAULT_CUSTOM.rows, MIN_ROWS, MAX_ROWS),
      mines: clamp(
        parsed.mines ?? DEFAULT_CUSTOM.mines,
        MIN_MINES,
        Math.min(MAX_MINES, parsed.cols ?? DEFAULT_CUSTOM.cols) *
          (parsed.rows ?? DEFAULT_CUSTOM.rows),
      ),
      zoom: clamp(parsed.zoom ?? 1, MIN_ZOOM, MAX_ZOOM),
    }
  } catch {
    settingsCache = { ...DEFAULT_SETTINGS }
  }
  return settingsCache
}

const persist = (settings: UserSettings): void => {
  settingsCache = settings
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    }
  } catch {
    // Storage unavailable (private mode, disabled): ignore.
  }
}

const sanitizeMines = (
  cols: number,
  rows: number,
  mines: number,
): number =>
  clamp(mines, MIN_MINES, Math.min(MAX_MINES, cols * rows))

export const useSettings = () => {
  const settings = ref<UserSettings>(readFromStorage())

  const safeMines = computed<number>(() =>
    sanitizeMines(settings.value.cols, settings.value.rows, settings.value.mines),
  )

  const setCols = (value: number): void => {
    settings.value = { ...settings.value, cols: clamp(value, MIN_COLS, MAX_COLS) }
    persist(settings.value)
  }

  const setRows = (value: number): void => {
    settings.value = { ...settings.value, rows: clamp(value, MIN_ROWS, MAX_ROWS) }
    persist(settings.value)
  }

  const setMines = (value: number): void => {
    settings.value = {
      ...settings.value,
      mines: sanitizeMines(settings.value.cols, settings.value.rows, value),
    }
    persist(settings.value)
  }

  const setZoom = (value: number): void => {
    settings.value = {
      ...settings.value,
      zoom: clamp(value, MIN_ZOOM, MAX_ZOOM),
    }
    persist(settings.value)
  }

  const setLevel = (level: DifficultyLevel): void => {
    if (!isValidLevel(level)) return
    settings.value = { ...settings.value, level }
    persist(settings.value)
  }

  const reset = (): void => {
    settings.value = { ...DEFAULT_SETTINGS }
    persist(settings.value)
  }

  return { settings, safeMines, setCols, setRows, setMines, setZoom, setLevel, reset }
}

export default useSettings
