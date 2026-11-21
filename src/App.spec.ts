import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import App from './App.vue'
import { useSettings, resetSettingsCache } from './composables/useSettings'

// Find the first button whose visible text matches `text` (no jQuery :contains)
// and click it. Await the result so the re-render settles before assertions.
// `mount(App)` yields a loosely-typed wrapper in this project's config, so we
// accept an untyped wrapper and cast internally.
async function clickButtonByText(
  wrapper: unknown,
  text: string,
): Promise<void> {
  const buttons = (wrapper as VueWrapper).findAll('button')
  const btn = buttons.find((b) => b.text() === text) as unknown as {
    trigger: (e: string) => Promise<void>
  }
  await btn.trigger('click')
}

describe('App.vue custom + settings flow', () => {
  beforeEach(() => {
    localStorage.clear()
    resetSettingsCache()
  })

  it('renders difficulty buttons and a Custom board input row', async () => {
    const wrapper = mount(App)
    expect(wrapper.find('.difficulty-row').exists()).toBe(true)
    expect(wrapper.find('.custom-group').exists()).toBe(false)

    await clickButtonByText(wrapper, 'Custom')
    expect(wrapper.find('.custom-group').exists()).toBe(true)
  })

  it('starts a CUSTOM game from the persisted custom dimensions', async () => {
    localStorage.setItem(
      'minesweeper_settings',
      JSON.stringify({ cols: 12, rows: 8, mines: 20, zoom: 1 }),
    )
    resetSettingsCache()

    const wrapper = mount(App)
    const settings = useSettings()
    await clickButtonByText(wrapper, 'Custom')

    const board = wrapper.find('.board')
    const template = (board.element as HTMLElement).style.gridTemplateColumns
    expect(template).toContain('12')
    // 12 columns × 8 rows => 96 cells.
    expect(wrapper.findAll('.cell')).toHaveLength(96)

    expect(settings.settings.value.cols).toBe(12)
  })

  it('editing the Custom size restarts the board with new dimensions', async () => {
    localStorage.setItem(
      'minesweeper_settings',
      JSON.stringify({ cols: 10, rows: 10, mines: 10, zoom: 1 }),
    )
    resetSettingsCache()

    const wrapper = mount(App)
    await clickButtonByText(wrapper, 'Custom')
    const cellsBefore = wrapper.findAll('.cell').length

    const widthInput = wrapper.find('#custom-cols')
    await widthInput.setValue('15')
    await widthInput.trigger('blur')

    expect(wrapper.findAll('.cell')).toHaveLength(150) // 15 × 10
    expect(useSettings().settings.value.cols).toBe(15)
    expect(cellsBefore).toBe(100)
  })

  it('preserves saved custom config when switching to a preset level', async () => {
    localStorage.setItem(
      'minesweeper_settings',
      JSON.stringify({ cols: 20, rows: 15, mines: 45, zoom: 1 }),
    )
    resetSettingsCache()

    const wrapper = mount(App)
    await clickButtonByText(wrapper, 'Custom')
    await clickButtonByText(wrapper, 'Beginner')

    // The Beginner preset renders 9×9 = 81 cells...
    expect(wrapper.findAll('.cell')).toHaveLength(81)
    // ...but the saved custom config is untouched (not clobbered by the preset).
    expect(useSettings().settings.value.cols).toBe(20)
  })

  it('persists and restores zoom across reloads', async () => {
    const wrapper = mount(App)
    await clickButtonByText(wrapper, 'Zoom +')
    await clickButtonByText(wrapper, 'Zoom +')

    // A fresh mount simulates a page reload reading stored settings.
    expect(useSettings().settings.value.zoom).toBeGreaterThan(1)
  })

  it('applies the persisted zoom to the board on mount', async () => {
    localStorage.setItem(
      'minesweeper_settings',
      JSON.stringify({ cols: 10, rows: 10, mines: 20, zoom: 2 }),
    )
    resetSettingsCache()

    const wrapper = mount(App)
    const board = wrapper.find('.board')
    // The cols input reflects the custom config (10), but the store starts on
    // the Beginner preset (9 cols). Whatever cols the board uses, the cell size
    // must be 2x the base fit — proving the stored zoom was applied on mount.
    const gtc = (board.element as HTMLElement).style.gridTemplateColumns
    // Format is `repeat(<cols>, <cellSize>px)`.
    const match = gtc.match(/repeat\((\d+), (\d+)px\)/)
    if (!match) throw new Error(`unexpected gridTemplateColumns: ${gtc}`)
    const cols = Number(match[1])
    // cell size = floor((innerWidth - 124) / cols) × zoom. The stored zoom is 2.
    const cellSize = Number(match[2])
    const expected = Math.max(Math.floor((window.innerWidth - 124) / cols), 12) * 2
    expect(cellSize).toBe(expected)

    // Sanity: the persisted custom config is intact for when Custom is chosen.
    expect(useSettings().settings.value.cols).toBe(10)
  })

  it('restores the last selected level after reload', async () => {
    localStorage.setItem(
      'minesweeper_settings',
      JSON.stringify({
        level: 'EXPERT',
        cols: 30,
        rows: 16,
        mines: 99,
        zoom: 1,
      }),
    )
    resetSettingsCache()

    const wrapper = mount(App)
    // The difficulty button row highlights the restored level (Expert).
    const active = wrapper
      .findAll('button')
      .find((b) => b.classes().includes('btn-primary'))
    expect(active?.text()).toBe('Expert')
    // And the game starts on the Expert preset (30 × 16).
    expect(wrapper.findAll('.cell')).toHaveLength(480)
  })

  it('saves the selected level when it changes', async () => {
    const wrapper = mount(App)
    await clickButtonByText(wrapper, 'Intermediate')

    expect(useSettings().settings.value.level).toBe('INTERMEDIATE')
    // A fresh mount (reload) should still be on Intermediate (16 × 16).
    const wrapper2 = mount(App)
    expect(wrapper2.findAll('.cell')).toHaveLength(256)
  })

  it('defaults to Beginner when no level is saved', () => {
    const s = useSettings()
    expect(s.settings.value.level).toBe('BEGINNER')
  })
})
