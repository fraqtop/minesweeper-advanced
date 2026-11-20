# STATE — Minesweeper (Vue 3 + Vite + TS + Bootstrap 5)

Source of truth for progress. Read before each step.
Plan: `/home/fraq/.opencode/plan/minesweeper-plan.md`.

## Plan phases
1. Scaffolding & dependencies
2. Types & constants
3. Pure logic (`utils/grid.ts`)
4. Responsive grid (`useResponsiveGrid.ts`)
5. Game store (`useMinesweeper.ts`)
6. Leaderboard (`useLeaderboard.ts`)
7. Number colors (`utils/color.ts`)
8. UI components
9. Long-press
10. Styling & responsive
11. Tests (Vitest)
12. Build & acceptance

## Status
- [x] Locate plan (`/home/fraq/.opencode/plan/minesweeper-plan.md`)
- [x] Phase 1 Scaffolding & dependencies (package.json, tsconfig, index.html, vite/vitest config)
- [x] Phase 2 Types & constants (`src/types.ts`, `src/constants.ts`)
- [x] Phase 3 Pure logic (`utils/grid.ts`)
- [x] Phase 4 Responsive grid (`useResponsiveGrid.ts`)
- [x] Phase 5 Game store (`useMinesweeper.ts`)
- [x] Phase 6 Leaderboard (`useLeaderboard.ts`)
- [x] Phase 7 Colors (`utils/color.ts`)
- [x] Phase 8 UI components (App.vue, Board.vue, Cell.vue, Controls.vue, Leaderboard.vue)
- [x] Phase 9 Long-press (Cell.vue: press=220ms -> flag; click=reveal; right-click=flag)
- [~] Phase 10 Styling (Bootstrap 5 applied, scoped styles)
- [x] Phase 11 Tests (grid 11, useMinesweeper 9, useLeaderboard 6, color 4 = 30 total)
- [x] Phase 12 Build & acceptance

## Notes
- All UI in English (plan rule 14).
- localStorage for leaderboard, no backend.
- Mines placed after 1st click; 1st cell + 3×3 safe.
- FIXED: Cell.vue left-click now reveals (was middle-click only, dead gesture for most users). Long-press flags; right-click flags on desktop.
- FIXED TEST INFRA: vitest jsdom didn't populate `localStorage`. Root cause: Node >=22 ships a disabled built-in `localStorage` on `globalThis`, so setup shim never ran. Fixed by unconditionally installing a jsdom-backed Storage in `test/setup.ts`. Added `resetLeaderboardCache()` to reset the module-level storage cache between tests.
- All 30 tests pass. vue-tsc clean, vite build OK (~76KB JS).
- Phase 12 (Build & acceptance) DONE: `npm run build` (`vue-tsc && vite build`) passes; production preview (:4173) renders fully, left-click reveals (floods open 52 cells on first click), right-click flags. Browser tester verdict PASS.

---
Last update: Phase 11 done (all 30 tests green).
