# Architecture

## Runtime model

The canonical application is a client-side React SPA. `pages-entry/index.html` loads
`src/pages-main.tsx`, which renders `AppShell` directly. Internal navigation is component state, so
the published demo does not require server-side routing or a Pages fallback.

TanStack Start and Cloudflare configuration remain as a secondary compatibility path. They are not
required for the GitHub Pages deployment and should not gain new features unless that hosting path
is explicitly retained. Cloudflare tooling is therefore classified as development-only and its
transitive security advisories must be reviewed before any server deployment.

## Application structure

`AppShell` wraps all experiences in `StoreProvider` and exposes a role switcher:

- Administration: protocols, operational flows, planning, work orders, assets, resources,
  incidents, notifications, audit history, and reports.
- Mobile operations: technician context, assigned work, guided execution, evidence, forms, and
  material consumption.
- Supervision: alerts, pending validations, notifications, and KPIs.

The shared domain contracts live in `src/ove/types.ts`. Initial entities and scenarios live in
`src/ove/seed.ts`.

## State and data flow

`StoreProvider` owns protocols, schedules, executions, incidents, notifications, people, tools,
inventory, and reservations. State is written to browser `localStorage` under
`zellship-maintenance-os-v4`.

There is no remote persistence or multi-user synchronization. Resetting restores the seed data.
Changing the storage schema requires either a new key or an explicit migration.

Some presentation data, including assets and operational-flow seeds, is still consumed directly
from `seed.ts`. Move it into the store before adding editing or persistence behavior for those
entities.

## Builds and hosting

- `npm run build:pages`: static build in `dist-pages`; canonical production artifact.
- `npm run build:ssr`: TanStack Start build in `dist`; secondary compatibility artifact.
- GitHub Pages base path: `/zellship-maintenance-os-demo/`.
- `.github/workflows/deploy-pages.yml`: validates and deploys `main`.
- `.github/workflows/ci.yml`: validates pull requests.

The hard-coded Pages base and social image URL must change if the repository is renamed, forked to
a different path, or moved to a custom domain.
