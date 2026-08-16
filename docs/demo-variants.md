# Demo variants

The repository has one application runtime and a registry of versioned scenario packages. A client
demo must be introduced as a scenario, not as a copy of the application.

## Configuration layers

- `src/demo-config/capabilities.ts`: canonical capability IDs and reusable profiles.
- `src/demo-config/schema.ts`: runtime validation for scenario descriptors.
- `src/demo-config/registry.ts`: allowed scenario IDs.
- `src/demo-config/active.ts`: the single runtime selection point.
- `src/demo-config/scenarios/<scenario-id>/`: scenario data and specialized profiles.
- `docs/baselines/`: immutable evidence for audited source baselines.

The default scenario is `industrial-base`. Select another registered scenario at build time with
`VITE_DEMO_SCENARIO`. An unknown ID fails at runtime instead of silently loading the wrong client
context.

```bash
VITE_DEMO_SCENARIO=industrial-base npm run build:pages
```

Set `VITE_DEMO_DATE` when a sales walkthrough or screenshot must be deterministic. Without it, the
demo anchors its seed data to the current calendar date and advances a logical session clock as the
presenter performs actions.

```bash
VITE_DEMO_DATE=2026-08-14T09:30:00-06:00 npm run dev
```

## Capability profiles

- `full`: execution, Improvement insights, and Executive analytics.
- `execution-only`: operational execution without Improvement insights or Executive analytics.
- `industrial-maintenance`: operational maintenance without service intake, Improvement insights
  or Executive analytics.

`service-request-intake` is a reusable operational capability. Its navigation appears only when the
active scenario also provides service-request data, so adding the capability contract does not
change the audited industrial baseline experience.

Navigation is derived from capabilities. `improvement-insights` controls OEE content inside the
maintenance result; `executive-analytics` controls Reports and supervisor KPIs. Scenario-specific
data must not rely on hiding a menu item alone.

## Distribution policy

Every scenario declares one of these classifications:

- `public-demo`: may contain only fictional, generic, or explicitly approved public data.
- `restricted-client-demo`: required when the scenario contains a prospect's identifiable context.

The schema rejects a `public-demo` marked as containing client-identifiable data. Repository and
hosting visibility still require an explicit release decision; the flag is a guardrail, not an
access-control system.

## Adding a scenario

1. Create `src/demo-config/scenarios/<scenario-id>/` with its data and config.
2. Choose `full` or `execution-only`; override individual capabilities only with a documented
   reason.
3. Give the scenario a unique `persistence.stateKey` so browser data cannot leak across demos.
4. Configure scenario-owned evidence assets and guidance rather than hard-coding client media in
   shared components.
5. Register it in `src/demo-config/registry.ts`.
6. Add contract tests for identity, capabilities, data counts, distribution, and reset behavior.
7. Ensure documents reference valid scenario assets or people and that temporal events cannot move
   backwards or end in the future.
8. Run `npm run check` and a smoke walkthrough for every enabled role.

Do not add real credentials, bank information, exact customer locations, personal contact details,
or other confidential prospect data to a public repository.
