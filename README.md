# Zellship Maintenance OS Demo

Interactive frontend demo for industrial maintenance operations. It connects protocol design,
planning, work orders, mobile execution, evidence, supervisor validation, incidents, resources,
and operational KPIs in one browser-based experience.

[Open the published demo](https://zellship.github.io/zellship-maintenance-os-demo/)

## Demo boundaries

This is not a production CMMS. It has no backend, database, authentication, or real external
integrations. GPS, camera capture, AI validation, notifications, and real-time activity are
simulated with seeded data and browser state.

## Requirements

- Node.js 20
- npm 10

## Setup

```bash
npm ci
npm run dev
```

The default development command runs the same static application used by GitHub Pages.

## Commands

```bash
npm run dev          # Static demo development server
npm run build        # Canonical GitHub Pages build
npm run preview      # Preview the static build
npm run test         # Domain unit tests
npm run typecheck    # TypeScript validation
npm run lint         # ESLint and Prettier rules for source files
npm run format:check # Repository-wide formatting check
npm run check        # Full required validation
npm run build:ssr    # Secondary TanStack Start/Cloudflare build
```

## Architecture

- `src/ove/`: maintenance domain, role applications, state, and seeded scenarios.
- `src/ove/store.tsx`: browser state persisted in `localStorage`.
- `src/ove/admin/`: administration and control-center experience.
- `src/ove/operator/`: mobile technician experience.
- `src/ove/supervisor/`: validation and KPI experience.
- `pages-entry/`: static entry used by GitHub Pages.
- `src/routes/`: secondary TanStack Start/SSR entry.

See [docs/architecture.md](docs/architecture.md) for data flow and deployment details.

## Demo walkthrough

Use the role switcher in the header to move between Administration, Mobile Operations, and
Supervision. The reset button restores the seeded scenario. A repeatable walkthrough is available
in [docs/demo-scenarios.md](docs/demo-scenarios.md).

## Deployment

Pushes to `main` are validated and published by `.github/workflows/deploy-pages.yml`. The workflow
uploads `dist-pages` using GitHub's official Pages actions.
