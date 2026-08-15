# MNT-DEMO-ATM-002A — Functional Reuse Map and Tomorrow Demo Cut

## Status

- Version: `1.0.0`
- State: Ready for scoped build
- Prepared on: `2026-08-14`
- Source scenario: `industrial-base`
- Target scenario: `atm-field-service`
- Parent contract: `MNT-DEMO-ATM-001 v1.0.1`
- Parent storyboard: `MNT-DEMO-ATM-002 v1.1.0`
- Capability profile: `execution-only`
- Distribution: `public-demo`

## Control brief

- **Objective:** present Maintenance OS tomorrow as a configured ATM field-service solution while
  preserving the existing industrial demo and its working capabilities.
- **Audience:** an ATM maintenance prospect evaluating operational fit and implementation value.
- **Decision sought:** continue to a client project based on visible coverage of corrective intake,
  planning, field execution, evidence, validation, and reporting.
- **Included:** one shared runtime, two scenario packages, fictional ATM data, a short corrective
  walkthrough, preventive context, and only the minimum generic capability extensions required by
  the ATM story.
- **Excluded:** production integrations, real GPS or camera custody, real messaging, bank login,
  prices, Improvement, Executive, load or security claims, and a second complete preventive flow.
- **Completion condition:** the ATM walkthrough runs end to end without changing or regressing the
  `industrial-base` walkthrough and without presenting a simulated integration as production-ready.

## Frozen architectural decision

Maintain one application runtime and two independent scenarios:

```text
Maintenance OS runtime
├── industrial-base
└── atm-field-service
```

The ATM scenario is not a fork, redesign, or second application. New behavior enters the shared
runtime only when it is expressed generically and remains disabled unless a scenario enables it.

## Classification rules

- `REUSE`: existing screen, modal, component, and state behavior remains structurally unchanged.
- `CONFIGURE`: existing behavior receives scenario-owned data, labels, protocols, or visibility.
- `EXTEND`: existing behavior needs a small generic field, section, state, or action.
- `NEW`: no equivalent behavior exists and a bounded generic capability is required.

## Eight-scene functional coverage

| Scene | Story moment                | Classification        | Existing product surface                                                   | Required ATM delta                                                                                                                                                                                                                                             |
| ----- | --------------------------- | --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Receive urgent corrective   | `NEW` + `CONFIGURE`   | Control center, event drawer, notifications                                | Add a generic service-request intake queue with an acceptance deadline. Configure one corrective with a 24-hour acceptance policy and one preventive plan as context.                                                                                          |
| 2     | Accept and classify         | `EXTEND`              | Existing drawers, forms, tags, and status mutations                        | Add acceptance action and three independent classifications: service type, installation class, and access context. Acceptance creates or releases the item for planning.                                                                                       |
| 3     | Schedule and prepare        | `REUSE` + `CONFIGURE` | Planning calendar and `Programar orden con recursos` modal                 | Replace industrial assets, plants, people, skills, tools, materials, and labels with fictional ATM data. Add configurable access-readiness items without replacing the modal.                                                                                  |
| 4     | Arrive and check in         | `REUSE` + `CONFIGURE` | Mobile execution intro, resource confirmation, GPS evidence, timestamp     | Configure the ATM/site context and show location confirmation as simulated. Do not claim real geofence or metadata validation.                                                                                                                                 |
| 5     | Capture guided pre-evidence | `REUSE` + `CONFIGURE` | Protocol evidence manifest and mobile evidence capture                     | Configure before/during/final evidence requirements and ATM-specific guidance using fictional reference media. Required items continue to block progression.                                                                                                   |
| 6     | Execute and submit          | `REUSE` + `EXTEND`    | Dynamic form, timer, material consumption, confirmation, notifications     | Add generic work concepts with code, unit, and quantity, without prices. Preserve existing time, form, material, and submission behavior.                                                                                                                      |
| 7     | Validate and correct        | `REUSE` + `EXTEND`    | Supervisor validation, approve, reject, comment, incident, evidence review | Preserve supervisor approval/rejection. Add a bounded reopen action only if it returns the execution to a demonstrable correction path; otherwise omit reopening from tomorrow's walkthrough. Coordinator may approve or reopen but may not internally reject. |
| 8     | Consolidate and send report | `REUSE` + `EXTEND`    | Printable inspection report and send-report modal                          | Configure ATM terminology and add classifications, work concepts, quantities, effective time, evidence groups, and revision reference when available. Email and WhatsApp remain visibly simulated.                                                             |

## Coverage conclusion

- Four scenes are primarily existing behavior: `3`, `4`, `5`, and most of `6`.
- Three scenes extend existing behavior: `2`, `7`, and `8`.
- One bounded capability is genuinely new: service-request intake and acceptance in `1`.
- The storyboard defines eight narrative checkpoints, not eight new product screens.

## Shared capability extensions

The following names are generic runtime concepts. ATM terminology belongs only in scenario data.

### Service request intake

- `ServiceRequest`
- source, received timestamp, requested service type, subject/site, and current state;
- optional `AcceptancePolicy` with deadline and expiration result;
- accepted requests become available for planning;
- preventive items may bypass acceptance when configured.

### Configurable classification

- service type;
- installation class;
- access context;
- labels and options owned by the scenario;
- values visible consistently in intake, order detail, execution, validation, and report.

### Access readiness

- configurable checklist tied to the request or site;
- may include appointment, identification, accompaniment, or site reference;
- no ATM-, bank-, mall-, or residential-specific field in the shared component contract.

### Work concepts

- code;
- description;
- unit;
- quantity;
- explicitly no price, amount, costing, or billing in this scenario.

### Execution correction

- existing rejection remains valid;
- reopening is an additive state transition, not a relabeling of rejection;
- a reopened execution must be editable and resubmittable to be shown;
- prior revision remains visible if revision history is included.

## Scenario-owned configuration

`atm-field-service` owns:

- fictional banks, sites, ATMs, regions, technicians, and contacts;
- `Correctivo` and `Preventivo` service labels;
- `SITE` and `REMOTO` installation labels;
- bank, commerce, residential tower, and mall access contexts;
- the 24-hour corrective acceptance rule;
- protocol requirements, evidence guidance, concepts, quantities, and report copy;
- a unique persistence key and deterministic demo clock.

No supplied client name, site, address, image, contact, order identifier, or price may be copied into
the public scenario.

## Tomorrow walkthrough cut

### Must demonstrate end to end

1. Coordinator sees a newly received corrective and its acceptance window.
2. Coordinator accepts and classifies it.
3. Coordinator schedules the service with an eligible technician using the existing planning modal.
4. Technician confirms resources and simulated location in the existing mobile experience.
5. Technician captures required evidence, form answers, work concepts, materials, and effective time.
6. Technician submits the execution.
7. Supervisor reviews and approves or rejects using the existing validation surface.
8. Coordinator or supervisor opens the consolidated report and simulates delivery.

### Supporting context only

- one preventive order appears in the queue and calendar;
- alternate access contexts appear in protocol/catalog data;
- assets, resources, incidents, notifications, and audit history remain available for questions;
- the preventive journey is not executed in full.

### Deferred after the meeting

- production bank-order ingestion;
- real 24-hour enforcement outside the demo clock;
- real GPS/photo metadata validation and custody;
- real duplicate or wrong-site detection;
- full immutable R1 → R2 revision ledger if it cannot be completed safely;
- real email, WhatsApp, PDF delivery, or external approval;
- detailed access logic for all four contexts;
- Improvement and Executive analytics.

## Truth boundary for presentation

Recommended positioning:

> This is a configured demonstration of Zellship Maintenance OS applied to ATM field service. Bank
> integrations, GPS, camera validation, and delivery channels are simulated and would be connected
> during implementation.

Do not state that the scenario is production-ready, integrated with a bank, or proof of production
load, security, or multi-tenant scalability. Two scenarios demonstrate configurability and reuse,
not production scalability by themselves.

## Regression and release gates

- `industrial-base` retains its existing data, navigation, walkthrough, and persistence key.
- ATM-specific labels do not appear when `industrial-base` is active.
- `atm-field-service` uses `execution-only`; Improvement and Executive remain absent.
- both scenarios pass typecheck, lint, formatting, tests, and Pages builds.
- both scenarios reset deterministically and do not share browser state.
- the ATM walkthrough contains no dead button, hidden manual state edit, or unsupported claim.
- publication uses a separate ATM URL or build target and requires explicit release authorization.

## Next action

Build `MNT-DEMO-ATM-003A — ATM Scenario Configuration and Demo-Critical Gaps` against this map,
starting with scenario data and reuse, then adding service-request acceptance, work concepts, and
only a demonstrable correction path.
