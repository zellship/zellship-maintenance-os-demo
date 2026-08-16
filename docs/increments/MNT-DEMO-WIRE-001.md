# MNT-DEMO-WIRE-001 — Neutral wire-plant maintenance scenario

## Status

RC1 implementation contract.

## Objective

Prepare a neutral Zellship Maintenance OS scenario that a partner can present to a maintenance
leader without assuming the identity of the plant owner or the maintenance provider.

## Frozen decisions

- Context name: **Planta de Alambres**.
- Scenario id: `wire-plant-maintenance`.
- Main asset: `TRF-03` — Trefiladora 3 · 9 pasos.
- Main story: simulated noise/vibration report, preparation, execution, human validation and release.
- Roles: coordination, technical operation and maintenance supervision.
- Inventory: 26 supplied equipment records across seven areas.
- Team: 11 fictional people preserving the supplied role distribution.
- Branding: Zellship only; no prospect or plant-owner name or logo.
- Distribution: public-safe neutral data with a scenario-specific browser state.

## Truth boundaries

The equipment inventory and personnel-role counts come from the supplied input. Names, states,
criticalities, health, availability, runtime, maintenance history, measurements, tools, materials,
protocols, incidents and evidence are deterministic demonstration data.

The scenario does not claim real GPS, QR, sensor/PLC integration, predictive AI, OEE, production
data, downtime cost, remote persistence, file upload or external messaging.

## Main walkthrough

1. Control center and maintenance attention.
2. Asset inventory and `TRF-03` profile.
3. Simulated condition report and work order.
4. Resource and safety readiness.
5. Focused mobile execution.
6. Three-phase photographic evidence and structured form.
7. Supervisor decision and release/reopen loop.
8. Consolidated result and operational report.

## Release gate

- Scenario registry and schema validation pass.
- Exactly 26 assets and 11 people load after reset.
- `TRF-03`, its protocol, incident and work order remain internally connected.
- No GPS evidence or automated AI validation is required.
- Industrial, ATM and wire builds pass without changing ATM behavior.
- Desktop, tablet and mobile walkthroughs remain usable.
