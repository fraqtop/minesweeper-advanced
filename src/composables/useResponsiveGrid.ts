import { computed, ref } from 'vue'

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

  // Bump on window resize so the fit-to-screen cell size recomputes against the
  // new viewport width. `innerWidth` isn't reactive on its own, so we read it
  // through this ref to keep cellSize in sync when the window is resized.
  const frameTick = ref(0)

  // Cells are sized so the board fills the available width — including the side
  // areas on large screens — then scaled by zoom.
  const cellSize = computed(() => {
    // Combined horizontal padding/margins between the viewport and the inner
    // grid: page padding (48) + panel padding (32) + wrapper padding (32) +
    // board padding (12). Kept in sync so the board fits the page at scale 1.
    const horizontalMargins = 124
    const available = Math.max(window.innerWidth - horizontalMargins, 1)
    frameTick.value // read so cellSize depends on the resize trigger
    const cellFromWidth = Math.floor(available / cols())
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

  // Keep the fit-to-screen sizing in sync when the viewport is resized.
  const handleResize = (): void => {
    frameTick.value += 1
  }
  window.addEventListener('resize', handleResize)

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
