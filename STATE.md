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
- [x] Phase 3 Pure logic (`src/utils/grid.ts`)
- [ ] Phase 4 Responsive grid
- [ ] Phase 5 Game store
- [ ] Phase 6 Leaderboard
- [ ] Phase 7 Colors
- [ ] Phase 8 UI components
- [ ] Phase 9 Long-press
- [ ] Phase 10 Styling
- [ ] Phase 11 Tests
- [ ] Phase 12 Build & acceptance

## Notes
- All UI in English (plan rule 14).
- localStorage for leaderboard, no backend.
- Mines placed after 1st click; 1st cell + 3×3 safe (plan 4, 10).
- Installed deps: vue, bootstrap, bootstrap-icons + vite/vitest. esbuild postinstall was blocked (needs approval for tests later).

---
Last update: Phase 3 done. Running typecheck before next phase.
