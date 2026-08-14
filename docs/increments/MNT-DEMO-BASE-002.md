# MNT-DEMO-BASE-002 — Demo configuration separation

## Outcome

The audited industrial demo remains the default experience, while scenario data,
branding, access profiles, persistence, distribution policy, capabilities, and demo time
are now explicit configuration contracts.

## Baseline

- Source: `zellship/zellship-maintenance-os-demo`
- Commit: `f12b7c85ee7ba20ca9df4168c66f4a9765abcccb`
- Candidate local tag: `mnt-demo-base-v1.0.0`
- Default scenario: `industrial-base`

## Included

- Scenario registry with fail-fast selection through `VITE_DEMO_SCENARIO`.
- Runtime schema validation for identity, version, capabilities, roles, persistence, and
  distribution policy.
- `full` and `execution-only` capability profiles.
- Scenario-owned branding, login profiles, contacts, taxonomy, and seed data.
- Unique persistence key per scenario contract.
- Deterministic demo clock through `VITE_DEMO_DATE`.
- Compatibility adapters for the existing OVE imports.
- Governance rules that reject client-identifiable data in a public demo.

## Explicitly excluded

- ATM field-service terminology, workflows, protocols, evidence rules, and data.
- Prospect or bank-identifiable information.
- Changes to the public GitHub Pages demo.
- Remote branch, tag, pull request, or deployment creation.

## Acceptance evidence

- TypeScript typecheck: passed.
- ESLint: passed with seven inherited Fast Refresh warnings and no errors.
- Prettier check: passed.
- Vitest: 13 tests passed.
- GitHub Pages production build: passed.
- Explicit `industrial-base` build with frozen date: passed.
- SSR production build: passed.
- Production artifacts: `dist-pages/index.html`, client assets, and
  `dist/server/server.js` present.
- Agent preview: service reported healthy, but the inspection browser could not access
  it because of an environment-level browser restriction. No source error was observed.

## Next increment

Create the ATM maintenance scenario as a new scenario package using the
`execution-only` profile, after confirming the minimum operational discovery inputs.
