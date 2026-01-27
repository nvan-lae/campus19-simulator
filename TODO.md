# Project TODO — campus19-simulator 🚀

This file contains a prioritized, actionable roadmap with estimates, affected files, and clear acceptance criteria.

---

## 🔄 Perpetual / Maintenance (Recurring)

These items should be checked regularly to ensure project health.

- [ ] **Security Audit**: Run `npm audit` in both frontend and backend to identify vulnerabilities. (Weekly)
- [ ] **Dependency Updates**: Check for outdated packages with `npm outdated` and update. (Monthly)
- [ ] **Code Quality**: Review and clear `TODO` comments in the codebase. (Weekly)
- [ ] **Manual Playtesting**: Verify the full game loop (Join -> Play -> Win/Lose) with the latest mechanics (Global Events, Shop, Betting). (Before Release)
- [ ] **E2E Testing**: Run full E2E suite to ensure no regressions in critical flows (Login, Game Start). (On PRs)

---

## Priority: P0 — Must fix (blocking / user-facing)

### 1) Implement stats & recent matches (Promoted from P1)
- **ETA**: 3–6 hours
- **Why**: `ProfilePage` currently uses hardcoded/mocked stats and empty match history.
- **Files**: `frontend/src/features/profile/ProfilePage.tsx`, `backend/src/users/users.controller.ts`
- **Tasks**:
  - [ ] Add `GET /users/me/stats` endpoint (calculate wins, losses, win rate).
  - [ ] Add `GET /users/me/matches` endpoint with pagination.
  - [ ] Connect frontend `ProfilePage` to real data.
- **Acceptance criteria**:
  - User sees their actual win/loss counts and recent game history.

---

## Priority: P1 — Important (feature-complete / correctness)

### 2) Backend tests for new Game Logic (Game of the Goose)
- **ETA**: 3–6 hours
- **Reasoning**: The game logic has been significantly transformed (42 tiles, Goose mechanics, Global Events, Betting). Old tests may be stale or insufficient.
- **Files**: `backend/src/game/game.logic.spec.ts`
- **Tasks**:
  - [ ] Update unit tests for `GameRoom` to cover new mechanics (Bridge, Well, Prison, Death, Shop Items).
  - [ ] Test Global Events (Gravity Flux, Inflation, Windy).
  - [ ] Test Betting system (Roll bets, Challenge bets).
- **Acceptance criteria**:
  - High coverage of `game.logic.ts`.
  - All critical game paths covered by tests.

---

## Priority: P2 — Quality / polish

### 3) Docs & onboarding
- **ETA**: 1–2 hours
- **Tasks**:
  - [ ] Add example `.env` files.
  - [ ] Update `README.md` with new features (Game of the Goose rules).
  - [ ] Document `VITE_API_URL` usage.

### 4) Accessibility & UX Polish
- **ETA**: 4–8 hours
- **Tasks**:
  - [ ] Add alt text to images (especially Avatar).
  - [ ] Ensure keyboard navigation works on Game Board and Shop.
  - [ ] Add "Toast" notifications for async errors (e.g., Shop purchase failed).

---

## Priority: P3 — Housekeeping / Cleanup

### 5) Verify Styling Consistency
- **ETA**: 0.5 hours
- **Tasks**:
  - [ ] Ensure all new game components use the `gl-` global classes from `index.css` or Tailwind utilities, not ad-hoc styles.

---

## Completed Items ✅

- [x] **Add CI workflow**: GitHub Actions configured for frontend/backend.
- [x] **Codebase Cleanup**: CSS files consolidated, `frontend/src/styles` removed.