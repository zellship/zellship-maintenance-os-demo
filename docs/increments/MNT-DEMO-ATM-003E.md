# MNT-DEMO-ATM-003E — Focused Mobile Presentation

## Status

- Release candidate: `RC5`
- Scenario: `atm-field-service`
- Scenario version: `0.4.2`
- Distribution: public demo with fictional data

## Brief

- Objective: reduce visual and cognitive load during the mobile-operation walkthrough without
  removing the contextual explanation from the demo.
- Included: one reversible control that hides or restores both panels surrounding the centered
  device.
- Excluded: changes to navigation, device content, operational data, execution behavior, and the
  responsive layout used on physical mobile screens.

## Frozen interaction

1. The default view hides the two contextual panels and keeps the device centered with its frame.
2. `Mostrar contexto` restores both panels when their explanatory content is needed.
3. The same control changes to `Ocultar contexto` and returns to the focused presentation.
4. At widths where the panels are already hidden responsively, the redundant control is not shown.

## Acceptance criteria

- The toggle does not reset the active tab or execution.
- The device does not change form factor when context is hidden.
- The desktop presentation can move between explanatory and focused modes without navigation.
- Existing ATM and industrial release gates continue to pass.
