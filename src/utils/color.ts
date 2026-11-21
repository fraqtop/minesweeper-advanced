// Number color mapping. Uses a curated, high-contrast set of colors
// (matches the classic Minesweeper palette closely, adapted for readability).
// Numbers are 1-8; returns a CSS color string for text.

const NUMBER_COLORS: Record<number, string> = {
  1: '#2196f3', // Blue
  2: '#43a047', // Green
  3: '#e53935', // Red
  4: '#8e24aa', // Purple
  5: '#a1881f', // Lime
  6: '#00acc1', // Cyan
  7: '#37474f', // Dark gray/black
  8: '#757575', // Gray
}

export const getNumberColor = (n: number): string => {
  return NUMBER_COLORS[n] ?? '#757575'
}
