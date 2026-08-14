# AGENTS.md

## Purpose

This repository is an interactive frontend demo of Zellship Maintenance OS. Data, evidence,
notifications, GPS, AI analysis, and real-time behavior are simulated unless documented otherwise.

## Toolchain

- Use Node 20 and npm.
- `package-lock.json` is the canonical lockfile.
- GitHub Pages is the canonical demo deployment.
- TanStack Start/Cloudflare remains a secondary compatibility build.

## Project map

- `src/ove/`: domain types, seed data, state, and role experiences.
- `src/components/ui/`: reusable UI primitives inherited from the starter.
- `pages-entry/` and `vite.pages.config.ts`: static GitHub Pages entry and build.
- `src/routes/`, `src/server.ts`, and `vite.config.ts`: secondary SSR path.
- `.github/workflows/`: pull-request checks and Pages deployment.

## Working rules

- Preserve the GitHub Pages base path unless the repository or hosting URL changes.
- Keep demo state compatible with `zellship-maintenance-os-v4`, or add an explicit migration.
- Add client variants through `src/demo-config/scenarios/`; do not copy the application runtime.
- Use canonical capability IDs for navigation and behavior. Do not add client-name conditionals.
- Give every variant a unique browser-state key and distribution classification.
- Never place client-identifiable data in a scenario classified as `public-demo`.
- Clearly distinguish simulated behavior from real integrations in UI and documentation.
- Do not edit `src/routeTree.gen.ts` manually.
- Avoid new backend or hosting dependencies without an explicit architecture decision.
- Split large screens into focused components when making substantial changes.

## Validation

Run `npm run check` before handoff. Add or update domain tests with behavior changes. If the SSR
path changes, also run `npm run build:ssr`.
