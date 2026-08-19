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

The `retail-store-support` capability profile adapts those role shells without introducing a
second application: Administration becomes the store-support center, Mobile operations becomes
the store-responsible workspace, and Supervision becomes the confirmation and closure queue.

The shared domain contracts live in `src/ove/types.ts`. Initial entities and scenarios live in
`src/demo-config/scenarios/`. `src/ove/seed.ts` is a compatibility adapter that exposes data from
the active scenario to existing screens.

`src/demo-config/active.ts` is the only scenario selection point. Branding, login profiles,
terminals, plants, browser-state identity, distribution classification, and capabilities are read
from the active scenario. Navigation uses capability IDs rather than client-specific conditions.

## State and data flow

`StoreProvider` owns protocols, schedules, executions, incidents, notifications, people, tools,
inventory, reservations, store assignments, support cases, interventions, and simulated
entity-document metadata. State is written to browser
`localStorage` under the active scenario's `persistence.stateKey`. The shared profile and document
increment intentionally moves every scenario to a new key because the persisted shape changed.

There is no remote persistence or multi-user synchronization. Resetting restores the seed data.
Changing the storage schema requires either a new key or an explicit migration.

The runtime clock has two modes. Public builds anchor seeded data to the current calendar date and
advance a logical session clock as actions occur. Setting `VITE_DEMO_DATE` freezes the starting
instant for deterministic QA, screenshots, and scripted walkthroughs. Temporal contract tests
validate execution, evidence, approval, schedule, reservation, and service-request ordering for
every registered scenario.
When a public session opens on a different calendar date than its persisted browser state, the
store restores the current-day seed automatically. This prevents yesterday's mutated demo state
from being presented as today's activity.

Some presentation profiles remain scenario-specific static modules. Move them into the store before
adding editing or remote persistence behavior for those entities.

## Builds and hosting

- `npm run build:pages:all`: assembles the public ATM root and wire-plant `/wire/` route in
  `dist-pages`.
- `npm run build:ssr`: TanStack Start build in `dist`; secondary compatibility artifact.
- GitHub Pages base paths: `/zellship-maintenance-os-demo/` for ATM and
  `/zellship-maintenance-os-demo/wire/` for the neutral wire-plant scenario, and
  `/zellship-maintenance-os-demo/retail/` for the neutral retail scenario.
- `.github/workflows/deploy-pages.yml`: validates all scenarios and deploys all three public routes from
  `main`.
- `.github/workflows/ci.yml`: validates pull requests.

`npm run build:retail:fixed` validates the Retail artifact locally; `build:pages:all` assembles it
under the independent `/retail/` route after its public distribution authorization.

The default Pages base, the wire and retail route build variables, and social image URL must change if the
repository is renamed, forked to a different path, or moved to a custom domain.
