# Project TODO — campus19-simulator ✅

This file contains a prioritized, actionable roadmap with estimates, affected files, and clear acceptance criteria so contributors can pick up work quickly.

---

## How to use
- Pick one item, create a branch named `todo/<short-task>` (e.g. `todo/ci-workflow`).
- Open a PR with the matching checklist and link to any related issues.

---

## Priority: P0 — Must fix (blocking / user-facing)

### 1) Add CI workflow (P0) 🛡️
- ETA: 1–2 hours
- Why: prevent regressions and ensure tests/builds run on PRs.
- Files: `.github/workflows/ci.yml`
- Jobs: `frontend: install → lint → build` and `backend: install → lint → test` (run in parallel)
- Acceptance criteria:
  - PR triggers CI and both jobs succeed.
- Status: ✅ Done

---

## Priority: P1 — Important (feature-complete / correctness)

### 2) Implement stats & recent matches (P1)
- ETA: 3–6 hours
- Why: `ProfilePage` shows placeholder stats and an empty recent matches list.
- Frontend files: `frontend/src/features/profile/ProfilePage.tsx`
- Backend files/endpoints: add `GET /users/me/stats` and `GET /users/me/matches?limit=` in `backend/src/users/users.controller.ts` + service
- Tasks:
  - Add API endpoints (with pagination/limit).
  - Frontend: fetch with loading + error states; show skeletons when loading.
  - Add unit + e2e coverage for the happy & error paths.
- Acceptance criteria:
  - Stats and recent matches load for authenticated users; errors show friendly message.

### 3) Backend tests for critical flows (P1)
- ETA: 3–6 hours
- Targets: avatar upload/delete, auth flows, crucial game logic edge-cases
- Files: `backend/src/**/*.spec.ts`, `test/*.e2e-spec.ts`
- Acceptance criteria: meaningful coverage increase for user & game-critical modules; CI passes.

---

## Priority: P2 — Quality / polish

### 4) Docs & onboarding (P2)
- ETA: 1–2 hours
- Add: example `.env`, required env vars (`VITE_API_URL`, JWT secrets), local dev debugging tips, CONTRIBUTING.md
- Files: `README.md`, `frontend/README.md`, `backend/README.md`

### 5) Accessibility, e2e, and UX polish (P2)
- ETA: 4–8 hours (spread across tasks)
- Examples: add alt text, keyboard focus states on avatar control, Playwright e2e for login + avatar upload, toasts for async actions.

---

## Priority: P3 — Housekeeping / Cleanup

### 6) Codebase Cleanup (P3)
- ETA: 0.5 hours
- Tasks:
  - [ ] Remove empty `frontend/src/styles` directory (moved to component library/utility classes).
  - [ ] Verify no unused CSS imports remain.

---

## PR template checklist (use in PR description)
- [ ] Title follows: `feat|fix(scope): short description`
- [ ] Tests added for new/changed behavior
- [ ] Lint and type checks pass (`npm run lint`, `npm run build`)
- [ ] Manual smoke-tested the happy and error paths
- [ ] Updated README or docs if behavior changed

---

## Developer notes / recommendations 💡
- Prefer small, focused PRs (<= 300 LOC).
- When adding API routes, include contract tests verifying response shape.
- Add `VITE_API_URL` guidance in `frontend/README.md` (example: `VITE_API_URL=http://localhost:3000`).

> Important: Before opening a PR, run `npm run lint` and the backend tests (`cd backend && npm test`).

---

### Useful commands
- Frontend (dev): `cd frontend && npm run dev`
- Frontend (build): `cd frontend && npm run build`
- Backend (dev): `cd backend && npm run start:dev`
- Backend (tests): `cd backend && npm test`