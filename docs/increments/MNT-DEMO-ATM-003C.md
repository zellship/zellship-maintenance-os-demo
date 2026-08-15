# MNT-DEMO-ATM-003C — UAT Corrections and RC3

## Status

- Release candidate: `RC3`
- Scenario: `atm-field-service`
- Scenario version: `0.4.0`
- Distribution: public demo with fictional data
- Publication: not authorized by this increment
- Closure: ready with visual UAT reservation

## Brief

- Objective: correct the five findings raised during local visual UAT without expanding the demo
  beyond the approved ATM field-service flow.
- Audience: prospect, Zellship presenter, coordination, field operation, and supervision.
- Decision supported: confirm that reception, execution, validation, and reporting operate as one
  coherent demo before publication.
- Included: unified home, actionable validation events, ATM-relevant control metric, client-aligned
  report structure, and post-flash photo reveal.
- Excluded: real camera/GPS, client-identifiable data, real bank branding, real delivery,
  Improvement, Executive, and production integrations.
- Done when: automated gates pass for ATM and industrial variants, and the packaged RC3 completes
  visual UAT in desktop, mobile, and print view.

## Evidence reviewed

The supplied examples confirm that the client's operational package is multi-document. Its core
patterns are:

1. A `Nota Informativa` with general data, background, diagnosis, actions, and conclusions.
2. A photographic log separated into pre-intervention, intervention, and post-intervention phases.
3. A generator/volumetry document with concept code, description, unit, quantity, photographic
   support, and conformity controls.

The implementation adapts those patterns. It does not copy real names, addresses, signatures,
prices, logos, or evidence into the public scenario.

## Frozen decisions

| ID           | Decision                                                                       | Rationale                                                                            |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| ATM-003C-D01 | `Centro operativo` is the ATM home.                                            | Reception is the first operational decision, while live status remains necessary.    |
| ATM-003C-D02 | `Servicios recibidos` is embedded as the first workspace on the home page.     | Avoids two competing starting pages and preserves a single operational narrative.    |
| ATM-003C-D03 | `Disponibilidad` is replaced by `Por aceptar` only in the ATM scenario.        | Asset uptime is not supported by authoritative ATM demo data; received services are. |
| ATM-003C-D04 | Validation-required events navigate to the matching pending execution.         | A status without a next action interrupts the flow.                                  |
| ATM-003C-D05 | The report is generated from execution data using the client's document logic. | A live generated result demonstrates more value than a static attached file.         |
| ATM-003C-D06 | The captured photo remains hidden until the flash completes.                   | The prior background preview contradicted the capture simulation.                    |

## Implemented changes

### Unified operational home

- The ATM scenario opens on `Centro operativo`.
- `Servicios recibidos` appears before state, attention, and live-operation panels.
- The separate visible `Servicios recibidos` menu entry is removed to avoid duplicate starts.
- The industrial scenario preserves its existing control-center content and availability metric.

### Actionable validation

- `Revisar validación` resolves the work order from the event and opens the corresponding pending
  execution.
- Opening a `Validación requerida` event also exposes `Abrir validación requerida` in its drawer.
- If no matching execution is found, the system opens the validation queue without inventing a
  relationship.

### Client-aligned report

- General data uses the same information hierarchy as the reference note.
- Sections are presented as background, diagnosis, actions, and conclusions.
- Photo evidence is grouped by pre-intervention, intervention, and post-intervention.
- Every photo displays its own timestamp and simulated GPS relation.
- Concepts and quantities are included without prices.
- Validation and conformity close the operational package.

### Mobile capture

- The pre-capture state is a neutral camera viewport with a camera icon and framing reticle.
- The target image is not rendered before capture.
- The flash occurs first; the selected evidence image and GPS stamp appear afterward.

## Verification

- TypeScript: pass.
- Unit and contract tests: `28/28` pass.
- ATM production build: pass.
- Industrial regression build: pass.
- Browser-rendered UAT: pending on the packaged RC3 at 1440 px, 390 px, and print preview.

## Release boundary

This increment does not publish or replace the public URL. After visual UAT, only blocking layout,
navigation, or print defects may be corrected before release authorization.
