# MNT-DEMO-ATM-003D — Scheduling Action and GitHub Release

## Status

- Release candidate: `RC4`
- Scenario: `atm-field-service`
- Scenario version: `0.4.1`
- Distribution: public demo with fictional data
- Publication: authorized for GitHub Pages

## Brief

- Objective: make the control-center scheduling action reviewable before creating a work order and
  publish the approved ATM variant through the existing GitHub Pages workflow.
- Included: the `Programar protocolo ahora` action, navigation to Planning, automatic opening of the
  existing scheduling modal with an active on-demand protocol selected, and an explicit ATM release
  build in Pages.
- Excluded: changes to recurrence emulation, real integrations, and client-identifiable data.

## Acceptance criteria

1. In `Centro operativo`, `Acciones > Programar protocolo ahora` opens `Programación`.
2. The scheduling modal opens automatically with an active on-demand protocol preselected.
3. No schedule or work order is created until the user validates and confirms the modal.
4. The release gate validates both scenarios and leaves the ATM build in `dist-pages` for Pages.
5. The industrial scenario continues to pass its regression build.

## Release boundary

The GitHub Pages workflow deploys only on `main` or by manual dispatch. The public demo remains
simulated and uses fictional ATM data.
