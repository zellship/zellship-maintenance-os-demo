# Zellship Maintenance OS Demo

Interactive frontend demo for industrial maintenance operations. It connects protocol design,
planning, work orders, mobile execution, evidence, supervisor validation, incidents, resources,
and operational KPIs in one browser-based experience.

- [Open the ATM field-service demo](https://zellship.github.io/zellship-maintenance-os-demo/)
- [Open the neutral wire-plant demo](https://zellship.github.io/zellship-maintenance-os-demo/wire/)

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

Run the neutral wire-plant maintenance scenario with:

```bash
npm run demo:wire
```

## Commands

```bash
npm run dev          # Static demo development server
npm run demo:atm     # ATM field-service scenario
npm run demo:wire    # Neutral wire-plant maintenance scenario
npm run build        # Canonical GitHub Pages build
npm run build:atm    # ATM production build
npm run build:wire   # Wire-plant production build
npm run build:pages:all # Assemble both public routes
npm run preview      # Preview the static build
npm run test         # Domain unit tests
npm run typecheck    # TypeScript validation
npm run lint         # ESLint and Prettier rules for source files
npm run format:check # Repository-wide formatting check
npm run check        # Full required validation
npm run build:ssr    # Secondary TanStack Start/Cloudflare build
```

## Architecture

- `src/demo-config/`: scenario registry, capability profiles, branding, deterministic clock, and
  distribution guardrails.
- `src/demo-config/scenarios/industrial-base/`: versioned data package for the audited industrial
  baseline.
- `src/ove/`: maintenance domain, role applications, and state.
- `src/ove/store.tsx`: browser state persisted in `localStorage`.
- `src/ove/admin/`: administration and control-center experience.
- `src/ove/operator/`: mobile technician experience.
- `src/ove/supervisor/`: validation and KPI experience.
- `pages-entry/`: static entry used by GitHub Pages.
- `src/routes/`: secondary TanStack Start/SSR entry.

See [docs/architecture.md](docs/architecture.md) for data flow and deployment details.

## Demo variants

The default scenario is `industrial-base`. Variants are registered configuration and data packages;
they do not copy the application. Use `VITE_DEMO_SCENARIO` to select a registered scenario and
`VITE_DEMO_DATE` to freeze the walkthrough clock when repeatable screenshots or scripts are needed.

See [docs/demo-variants.md](docs/demo-variants.md) for capability profiles, distribution rules, and
the scenario authoring process. The audited baseline is recorded in
[`docs/baselines/MNT-DEMO-BASE-001.json`](docs/baselines/MNT-DEMO-BASE-001.json), and the separation
increment is closed in
[`docs/increments/MNT-DEMO-BASE-002.md`](docs/increments/MNT-DEMO-BASE-002.md).
The ATM field-service discovery and scenario contract is frozen in
[`docs/increments/MNT-DEMO-ATM-001.md`](docs/increments/MNT-DEMO-ATM-001.md).
Its eight-scene storyboard and implementation blueprint is defined in
[`docs/increments/MNT-DEMO-ATM-002.md`](docs/increments/MNT-DEMO-ATM-002.md).

## Demo walkthrough

Use the role switcher in the header to move between Administration, Mobile Operations, and
Supervision. The reset button restores the seeded scenario. A repeatable walkthrough is available
in [docs/demo-scenarios.md](docs/demo-scenarios.md).

## Deployment

Pushes to `main` are validated and published by `.github/workflows/deploy-pages.yml`. The workflow
keeps the ATM variant at the repository root, builds the neutral wire-plant variant under `/wire/`,
and uploads the combined `dist-pages` artifact using GitHub's official Pages actions.
