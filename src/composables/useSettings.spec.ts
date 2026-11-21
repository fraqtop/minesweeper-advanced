import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useSettings, resetSettingsCache, type UserSettings } from './useSettings'
import { SETTINGS_KEY, DEFAULT_CUSTOM } from '@/constants'

const read = (): Partial<UserSettings> =>
  JSON.parse(localStorage.getItem(SETTINGS_KEY) as string) as UserSettings

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear()
    resetSettingsCache()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts from persisted settings when present', () => {
    const saved = {
      level: 'EXPERT',
      cols: 20,
      rows: 20,
      mines: 60,
      zoom: 1.4,
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved))
    const s = useSettings()
    expect(s.settings.value.level).toBe('EXPERT')
    expect(s.settings.value.cols).toBe(20)
    expect(s.settings.value.rows).toBe(20)
    expect(s.settings.value.mines).toBe(60)
    expect(s.settings.value.zoom).toBe(1.4)
  })

  it('defaults to Beginner when nothing is saved', () => {
    const s = useSettings()
    expect(s.settings.value.level).toBe('BEGINNER')
  })

  it('clamps out-of-range values on load', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ cols: 999, rows: 0, mines: 999999, zoom: 100 }),
    )
    const s = useSettings()
    expect(s.settings.value.cols).toBeLessThanOrEqual(30)
    expect(s.settings.value.rows).toBeGreaterThanOrEqual(5)
    expect(s.settings.value.zoom).toBeLessThanOrEqual(2.5)
  })

  it('persists updates and round-trips through storage', () => {
    const s = useSettings()
    s.setCols(12)
    s.setRows(14)
    s.setMines(40)
    s.setZoom(1.8)

    const stored = read()
    expect(stored.cols).toBe(12)
    expect(stored.rows).toBe(14)
    expect(stored.mines).toBe(40)
    expect(stored.zoom).toBe(1.8)

    const restored = useSettings()
    expect(restored.settings.value).toEqual(s.settings.value)
  })

  it('clamps cols and rows within bounds', () => {
    const s = useSettings()
    s.setCols(50)
    s.setRows(-3)
    expect(s.settings.value.cols).toBe(30)
    expect(s.settings.value.rows).toBe(5)
  })

  it('caps mines at the number of cells', () => {
    const s = useSettings()
    s.setCols(10)
    s.setRows(10)
    s.setMines(5000)
    expect(s.safeMines.value).toBe(100)
    expect(s.settings.value.mines).toBe(100)
  })

  it('clamps zoom within bounds', () => {
    const s = useSettings()
    s.setZoom(10)
    expect(s.settings.value.zoom).toBe(2.5)
    s.setZoom(-5)
    expect(s.settings.value.zoom).toBe(0.5)
  })

  it('reset restores defaults', () => {
    const s = useSettings()
    s.setCols(25)
    s.reset()
    expect(s.settings.value.cols).toBe(DEFAULT_CUSTOM.cols)
    expect(s.settings.value.zoom).toBe(1)
  })
})
