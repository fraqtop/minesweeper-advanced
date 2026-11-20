import { computed, ref } from 'vue'
import { PAGE_MAX_WIDTH } from '@/constants'

type View = 'normal' | 'zoom' | 'overview'

export const useResponsiveGrid = (
  cols: () => number,
  rows: () => number,
) => {
  // `scale` is a direct multiplier on the fit-to-screen cell size:
  // 1.0 = board fills the available width, >1 zooms in, <1 zooms out.
  const scale = ref(1)
  const zoom = scale
  const overview = ref(1)
  const view = ref<View>('normal')

  const minZoom = computed<number>(() => 0.5)
  const maxZoom = computed<number>(() => 2.5)
  const minOverview = computed<number>(() => 0.5)
  const maxOverview = computed<number>(() => 1)

  // Cells are sized to fit the available width, then scaled by zoom.
  const cellSize = computed(() => {
    const vw = window.innerWidth
    const pageWidth = Math.min(vw, PAGE_MAX_WIDTH)
    const cellFromWidth = Math.floor((pageWidth - 32) / (cols() + 1))
    const zoomed = Math.floor(cellFromWidth * scale.value)
    return Math.max(zoomed, 12)
  })

  const boardWidth = computed(() => cols() * cellSize.value + 8)
  const boardHeight = computed(() => rows() * cellSize.value)

  const setView = (value: View): void => {
    view.value = value
  }

  const zoomIn = (): void => {
    zoom.value = Math.min(zoom.value + 0.15, maxZoom.value)
  }

  const zoomOut = (): void => {
    zoom.value = Math.max(zoom.value - 0.15, minZoom.value)
  }

  const overviewIn = (): void => {
    overview.value = Math.max(overview.value - 0.1, minOverview.value)
  }

  const overviewOut = (): void => {
    overview.value = Math.min(overview.value + 0.1, maxOverview.value)
  }

  return {
    zoom,
    overview,
    view,
    cellSize,
    boardWidth,
    boardHeight,
    minZoom,
    maxZoom,
    minOverview,
    maxOverview,
    setView,
    zoomIn,
    zoomOut,
    overviewIn,
    overviewOut,
  }
}
