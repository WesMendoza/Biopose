# AGENTS: biopose-frontend

Purpose: quick operational guidance for AI coding agents working on the frontend.

1) Quick commands
- Dev: `npm run dev` (runs Vite dev server from project root)
- Build: `npm run build` (TypeScript build + `vite build`)
- Lint: `npm run lint`

2) Entry points & structure
- App entry: `src/main.tsx`
- Routing: `src/Router.tsx`
- Main layout components: `src/components/Header.tsx`, `src/components/Sidebar.tsx`, `src/components/Layout.tsx`
- Feature hooks: `src/hooks/` (e.g., `useLogin.ts`, `useLiveDetection.ts`, `useVideoDetection.ts`)
- Pages: `src/pages/` (pose, events, dashboard, users)

3) Important conventions & notes
- Two parallel frontend apps exist: the main app at the project root and a copy under `Portal_Biopose/`. Confirm with the developer before making cross-cutting changes.
- No test runner or CI found. Avoid adding CI changes without confirmation.
- Environment configuration: there are no `.env` samples. Avoid hardcoding API URLs — prefer asking for expected backend base URL.
- TypeScript settings are permissive; prefer non-breaking lint/type fixes.

4) Files to consult
- README: README.md
- Build config: vite.config.ts, tsconfig.json

5) Suggested guarded behaviors for agents
- Do not add or modify large binary assets. The repository contains references to model/video files that are not tracked.
- When implementing or changing authentication flows, validate behavior manually — API endpoints are not fully implemented.
