# MNT-DEMO-ATM-003A — ATM Scenario Configuration and Demo-Critical Gaps

## Status

- Scenario version: `0.1.0`
- Status: Release candidate; visual walkthrough pending
- Prepared on: `2026-08-14`
- Parent blueprint: `MNT-DEMO-ATM-002 v1.1.0`
- Functional reuse map: `MNT-DEMO-ATM-002A`
- Source baseline: `ae475d5cac324f59ee654c2b2db1825bbdc9de60`
- Target scenario: `atm-field-service`
- Capability profile: `execution-only`
- Distribution: `public-demo`
- Release gate superseded by: `MNT-DEMO-ATM-003B RC1`

## Outcome

The ATM field-service story now runs as a registered configuration of the shared Maintenance OS
runtime. The industrial baseline remains available as `industrial-base`; no client fork or second
application was created.

The release candidate covers corrective intake and acceptance, preventive planning context,
assignment, access requirements, guided mobile execution, simulated GPS/photo evidence, concepts
and quantities without prices, validation, reopening with revision history, approval, and a
consolidated operational report.

## Frozen operating rules

- The 24-hour commitment is the acceptance window and applies only to corrective services.
- Preventive work arrives through advance planning and has no corrective acceptance countdown.
- Service type, installation class (`SITE/REMOTO`), and access context are independent fields.
- Access contexts represented are bank branch, commerce, residential tower, and mall.
- Supervisor may approve, reject, and reopen.
- Coordinator may approve and reopen, but internal rejection remains a supervisor action.
- Work concepts contain code, description, unit, and quantity; prices are excluded.
- Improvement and Executive capabilities are excluded from this scenario.

## Reused product surfaces

- Shared role shell, login profiles, navigation, tables, cards, drawers, modals, and reset behavior.
- Existing Planning modal and resource eligibility flow.
- Existing Mobile Operations assignment and guided execution flow.
- Existing Work Orders expediente and printable maintenance result.
- Existing Supervisor Validation surface, now also available to Coordination where authority allows.
- Existing notifications, inventory reservations, evidence records, status tags, and local state.

## Demo-critical additions

1. `ServiceRequest` intake model with external reference, acceptance policy, three-dimensional
   classification, access readiness, and link to the resulting schedule.
2. `Servicios recibidos` queue with deterministic countdown, expired example, accept/decline
   actions, and handoff to Planning.
3. ATM scenario package with fictional public data, four access contexts, two operating paths, and
   a unique persistence key.
4. Scenario-controlled evidence assets, guidance, simulated findings, and operator comment.
5. Work concepts and quantities in execution, validation, work-order detail, and report.
6. Reopen workflow that preserves the prior execution, records actor/reason, and creates the next
   revision.
7. Role authority guards for approve, reject, and reopen.
8. Operational result copy for field service without OEE or executive metrics.

## Seeded walkthrough

| Scene | Role                    | Existing surface / extension             | Demonstrated state                                  |
| ----- | ----------------------- | ---------------------------------------- | --------------------------------------------------- |
| 1     | Coordination            | Servicios recibidos                      | Corrective `SO-ATM-2401`, four hours left to accept |
| 2     | Coordination            | Acceptance modal and request detail      | Accepted in time; classification remains separate   |
| 3     | Coordination            | Planning modal                           | Technician, date, resources, and access readiness   |
| 4     | Operation mobile        | Assignment detail                        | Correct site and simulated GPS check-in             |
| 5     | Operation mobile        | Guided execution                         | Reference-guided simulated photo evidence           |
| 6     | Operation mobile        | Forms, materials, concepts, confirmation | Revision submitted for validation                   |
| 7     | Supervision / operation | Validations and guided correction        | Reopen with reason; previous revision retained      |
| 8     | Coordination            | Validation and result report             | Approval and consolidated operational expediente    |

## Truth boundaries

This increment is a public prototype using fictional data. GPS, camera capture, image findings,
notifications, signatures, and report delivery are simulated in the browser. The build does not
connect to bank systems, messaging providers, maps, storage, an AI service, or a production
backend. The presence of two scenario packages demonstrates configuration reuse; it is not proof
of production scalability.

## Verification evidence

- TypeScript: pass (`tsc --noEmit`).
- Unit and contract tests: pass (`18/18`).
- ESLint: pass with seven inherited Fast Refresh warnings and no errors.
- Prettier: pass.
- Production build, `industrial-base`: pass.
- Production build, `atm-field-service`: pass.
- Visual walkthrough: pending because the local environment does not contain a compatible browser
  executable. Do not treat visual acceptance as complete until the eight-scene route is reviewed in
  a browser.

## Deferred gaps

- Real inbound bank order integration and acknowledgement.
- Live GPS integrity, camera metadata, file upload, image analysis, and fraud controls.
- Real messaging and external report delivery.
- Backend persistence, authentication, audit immutability, offline sync, and role provisioning.
- Commercial pricing, invoicing, and bank-specific report templates.
- Improvement and Executive analytics.
- Full walkthroughs for every access-context variant; the primary path exercises Commerce and the
  remaining protocols are visible scenario context.

## Release decision

Do not publish from this increment alone. First complete the browser walkthrough at desktop and
mobile widths, reset the scenario, rehearse the 8–10 minute script, and obtain explicit deployment
authorization for the separate ATM demo URL.
