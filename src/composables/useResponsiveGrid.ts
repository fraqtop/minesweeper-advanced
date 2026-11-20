import { computed, ref } from 'vue'

type View = 'normal' | 'zoom' | 'overview'

export const useResponsiveGrid = (
  cols: () => number,
  rows: () => number,
) => {
  const zoom = ref(1.6)
  const overview = ref(1)
  const view = ref<View>('normal')

  const minZoom = computed<number>(() => 1.05)
  const maxZoom = computed<number>(() => 2.1)
  const minOverview = computed<number>(() => 0.5)
  const maxOverview = computed<number>(() => 1)

  // Cells grow in viewport-height terms so the board fits on small screens.
  const cellSize = computed(() => {
    const vw = window.innerWidth
    const cellFromWidth = Math.floor((vw - 16) / (cols() + 1))
    const cellMax = view.value === 'normal' ? zoom.value : overview.value
    return Math.max(Math.floor(cellFromWidth / cellMax), 12)
  })

  const boardWidth = computed(() => cols() * cellSize.value + 8)
  const boardHeight = computed(() => rows() * cellSize.value)

  const setView = (value: View): void => {
    view.value = value
  }

  const zoomIn = (): void => {
    zoom.value = Math.min(zoom.value + 0.2, maxZoom.value)
  }

  const zoomOut = (): void => {
    zoom.value = Math.max(zoom.value - 0.2, minZoom.value)
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
