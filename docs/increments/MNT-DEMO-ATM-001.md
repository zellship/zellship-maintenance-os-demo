# MNT-DEMO-ATM-001 — Operational Discovery and Scenario Contract

## Status

- Contract version: `1.0.1`
- Status: Ready for implementation
- Frozen on: `2026-08-14`
- Source baseline: `ae475d5cac324f59ee654c2b2db1825bbdc9de60`
- Target scenario ID: `atm-field-service`
- Capability profile: `execution-only`
- Distribution: `public-demo`

### Decision correction in v1.0.1

The coordinator authority was narrowed to the user's exact confirmation: a coordinator may approve
and reopen. Internal rejection remains a supervisor decision; an external bank/client rejection is
recorded by the coordinator. Version 1.0.0 incorrectly described supervisor and coordinator
authority as equivalent.

## Outcome

Define the operational contract for a fictional ATM field-service demo without copying the
prospect's identity, bank data, locations, contacts, prices, credentials, or source documents into
the public repository.

The implementation may begin when it follows this contract. The contract is complete when the
primary walkthrough, actors, state transitions, operational rules, evidence requirements, report
boundary, exclusions, and acceptance criteria are unambiguous.

## Control brief

- **Objective:** demonstrate how Maintenance OS controls the execution of scheduled preventive and
  reactive corrective ATM services from intake through documentary closure.
- **Audience:** an ATM maintenance provider's operational leadership, coordinators, supervisors,
  and field technicians.
- **Decision sought:** confirm that the system can reduce the risk of losing corrective work,
  standardize field execution, preserve evidence integrity, and consolidate the operational report.
- **Included:** intake, corrective acceptance, preventive planning, assignment, access preparation,
  mobile execution, evidence, GPS check-in, work concepts and quantities, materials, effective time,
  validation, rejection, reopening, resubmission, and operational report generation.
- **Excluded:** Improvement insights, Executive analytics, prices, billing, quoting, real bank
  integrations, real camera or GPS services, real messaging, backend persistence, and client data.
- **Completion condition:** the eight-scene walkthrough can be implemented with fictional data and
  every visible state or action maps to a rule in this document.

## Authority and evidence

The contract uses the following order of authority:

1. Decisions explicitly confirmed by the user.
2. Operational behavior observed in the two client cases supplied for discovery.
3. Recommendations introduced to make the demo coherent and safely implementable.

Observed defects in the source documents are evidence of operational risk. They are not treated as
approved client rules or copied into the demo data.

## Frozen decisions

| ID      | Decision                                                                                                                            | Status |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| ATM-D01 | The 24-hour clock applies only to accepting a corrective order.                                                                     | Frozen |
| ATM-D02 | Preventive work is received as an advance monthly plan and does not use the corrective acceptance clock.                            | Frozen |
| ATM-D03 | `SITE` and `REMOTO` classify the ATM installation; bank branch, commerce, residential tower, and mall classify the access protocol. | Frozen |
| ATM-D04 | The operational generator includes executed concepts and quantities but no prices.                                                  | Frozen |
| ATM-D05 | A supervisor may approve, reject, and reopen; a coordinator may approve and reopen a submitted service.                             | Frozen |
| ATM-D06 | Poor execution or an incomplete report/evidence package are valid reasons to reject or reopen.                                      | Frozen |
| ATM-D07 | Improvement and Executive capabilities remain outside this demo.                                                                    | Frozen |

## Source-grounded observations

The supplied cases confirmed the following operating pattern:

- Preventive programming is distributed ahead of execution and returned with scheduled dates.
- Corrective work arrives as a new service order and requires an explicit provider response.
- Appointment, access, personnel identification, and security accompaniment may need advance
  coordination.
- Execution records include general data, antecedents, diagnosis, actions, conclusions, pre-work
  evidence, intervention evidence, and final evidence.
- Commercial closure uses work concepts, quantities, reference sketches, photographic support, and
  signatures.
- False visits caused by unavailable access or security accompaniment are recorded outcomes.

The document audit also found operational integrity risks:

- a site information form stored in one case belonged to another site;
- photographic generator pages in both cases contained headers from a different site;
- preventive and corrective labels conflicted inside a single service package;
- at least one service date conflicted with the surrounding case chronology;
- five pairs of supplied image files were exact duplicates;
- none of the 128 supplied JPEG files retained machine-readable GPS or capture-time EXIF data,
  although some displayed a visible location stamp.

These observations justify controlled in-app capture and site-bound evidence in the demo. They do
not establish that automated GPS or duplicate detection already exists in a production product.

## Reconciled ambiguities

### Acceptance clock versus attention priority

One sample corrective order displayed a 240-hour priority, while the confirmed business rule is a
24-hour acceptance deadline.

The demo must model these as different concepts:

- `acceptanceDueAt`: deadline for accepting a corrective order;
- `serviceDueAt`: optional attention or resolution target, shown only when seeded for the scenario.

The demo must not describe 24 hours as the resolution SLA. If a corrective order is not accepted by
`acceptanceDueAt`, it becomes unavailable and is marked as lost to another provider.

### Service classification versus visit outcome

`Preventive` and `Corrective` are service types. `False visit — Access` and
`False visit — Security accompaniment` are execution outcomes, not service types. The demo will use
that normalized distinction even if a source form groups them together.

## Scenario posture

### Primary walkthrough

A corrective order received for a remote ATM in a commercial location is the main story. It begins
inside the 24-hour acceptance window and continues through acceptance, access preparation,
assignment, mobile execution, evidence validation, correction of an incomplete submission, and
final report approval.

This is the recommended sales narrative because it makes the cost of delayed response and weak
evidence immediately visible.

### Secondary case

A monthly preventive order for a `SITE` installation remains visible in planning and work orders.
It demonstrates that the same operating model supports scheduled maintenance without the corrective
acceptance clock.

The secondary case is supporting context; it does not create a second full walkthrough.

## Actors and authority

| Actor            | Demo responsibility                                                                                                                                | Allowed decisions                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Coordinator      | Receive and accept corrective work, schedule service, assign personnel, prepare access requirements, monitor execution, deliver the report.        | Approve, reopen, reassign, and record an external rejection.              |
| Field technician | Confirm assignment and resources, check in, execute the protocol, capture evidence, record concepts, quantities, materials, and time, then submit. | Start, pause, report an access exception, and submit or resubmit.         |
| Supervisor       | Review work quality, completeness, evidence integrity, and report consistency.                                                                     | Approve, reject, and reopen with a mandatory reason.                      |
| Bank/client      | External recipient and reviewer of the final package.                                                                                              | No authenticated demo role. Any rejection is recorded by the coordinator. |

The current application roles map as follows:

- `admin` → Coordinator;
- `operator` → Field technician;
- `supervisor` → Supervisor.

## Operational taxonomy

The scenario must keep these dimensions separate:

| Dimension          | Values used in the demo                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Service type       | Preventive, Corrective                                                                                 |
| Installation class | SITE, REMOTO                                                                                           |
| Access context     | Bank branch, Commerce, Residential tower, Mall                                                         |
| Access condition   | Appointment required, Credentials required, Security accompaniment required, No accompaniment required |
| Visit outcome      | Completed, False visit — Access, False visit — Security accompaniment, Cancelled                       |
| Evidence phase     | Before, During, Final                                                                                  |
| Validation result  | Approved, Rejected, Reopened                                                                           |

## State contract

### Corrective order

```text
Received
  → Awaiting acceptance
    → Accepted
      → Scheduled
        → Assigned
          → Access ready
            → In progress
              → Submitted
                → Pending validation
                  → Approved → Closed
                  → Rejected → Reopened → In progress → Resubmitted
    → Acceptance expired → Lost
    → Declined → Lost
```

### Preventive order

```text
Planned
  → Scheduled
    → Assigned
      → Access ready
        → In progress
          → Submitted
            → Pending validation
              → Approved → Closed
              → Rejected → Reopened → In progress → Resubmitted
```

Reopening creates a new revision and preserves the original submission, decision, reason, actor,
and timestamp. It must not silently overwrite prior evidence.

## Operational rules

| Rule    | Contract                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ATM-R01 | Only corrective orders require acceptance within 24 hours.                                                                                 |
| ATM-R02 | The countdown uses the order reception timestamp and ends at `acceptanceDueAt`.                                                            |
| ATM-R03 | An expired or declined corrective order is read-only and identified as lost.                                                               |
| ATM-R04 | Preventive orders enter through the monthly planning path without an acceptance countdown.                                                 |
| ATM-R05 | Installation class and access context jointly select the execution protocol.                                                               |
| ATM-R06 | Required access conditions must be complete before the order becomes `Access ready`.                                                       |
| ATM-R07 | Check-in records simulated GPS, server time, technician, order, and site binding.                                                          |
| ATM-R08 | Evidence is captured against a required category and phase; generic unclassified uploads do not satisfy the protocol.                      |
| ATM-R09 | Missing, duplicated, or wrong-site evidence blocks a clean submission and displays the reason.                                             |
| ATM-R10 | The technician records diagnosis, actions, effective time, materials/consumables, concepts, and quantities.                                |
| ATM-R11 | Executed concepts use a controlled catalog; the demo does not expose unit prices or totals.                                                |
| ATM-R12 | Submission creates a frozen revision and sends it to validation.                                                                           |
| ATM-R13 | Rejection and reopening require an actor, timestamp, reason, and requested correction.                                                     |
| ATM-R14 | Supervisor and coordinator may approve and reopen; only the supervisor rejects internally. Every decision remains separately attributable. |
| ATM-R15 | Approval produces the operational report package and closes the current revision.                                                          |

## Minimum evidence contract

Every completed service requires:

1. Location or facade reference.
2. ATM identifier visible on the equipment or screen.
3. Site check-in with simulated GPS and timestamp.
4. Pre-intervention panoramic evidence.
5. Before, during, and final evidence for each executed concept.
6. Final panoramic evidence.

Conditional evidence is activated by the selected protocol or work concept:

- electrical readings and polarity;
- regulator or backup-power identification;
- air-conditioning condition;
- signage, walls, ceilings, floors, glazing, or metalwork;
- supplied material or replaced component;
- false-visit access condition.

The demo should use a representative subset instead of reproducing every page of the source FNI.
Its purpose is to prove guided completeness and traceability, not to recreate the customer's forms
pixel for pixel.

## Operational report package

The approved package contains:

- order and site context;
- service and protocol classifications;
- reception, acceptance, scheduling, check-in, submission, and approval timestamps;
- assigned technician or crew;
- antecedents, diagnosis, actions, and conclusions;
- effective execution time;
- materials and consumables used;
- executed concepts and quantities without prices;
- categorized before, during, and final evidence;
- GPS and timestamp trace;
- validation decision and revision history.

The package may visually reference the hierarchy of the supplied FNI and generator, but must use an
original Zellship layout and fictional data.

## Eight-scene storyboard contract

| Scene                        | Decision shown                                                | Required proof                                                                                            |
| ---------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1. New corrective order      | Accept before the 24-hour deadline or lose the work.          | Reception time, countdown, service type, SITE/REMOTO, access context.                                     |
| 2. Acceptance and protocol   | Accept and determine the correct operating path.              | Separate classifications and protocol requirements.                                                       |
| 3. Scheduling and assignment | Choose a valid date, technician/crew, and access preparation. | Appointment, credentials, accompaniment, skills, resources.                                               |
| 4. Arrival and check-in      | Confirm that execution begins at the assigned site.           | Simulated GPS, timestamp, site binding, access outcome.                                                   |
| 5. Guided pre-intervention   | Capture the minimum evidence before work begins.              | Required categories, phase, completeness indicator.                                                       |
| 6. Work execution            | Record what was actually done.                                | Diagnosis, actions, time, materials, concepts, quantities, during/final evidence.                         |
| 7. Validation and correction | Prevent a poor or incomplete package from closing.            | Wrong-site or missing-evidence warning, rejection reason, coordinator/supervisor reopening, new revision. |
| 8. Approved report           | Deliver a consolidated operational record.                    | FNI-style summary, generator concepts and quantities, evidence, decision, audit history.                  |

## Capability boundary

The `execution-only` profile remains mandatory.

Included capabilities:

- operational control center;
- protocol management;
- planning and work orders;
- mobile execution;
- operational maintenance results;
- resource, incident, notification, and audit support;
- supervisor alerts and validation.

Excluded capabilities:

- `improvement-insights`;
- `executive-analytics`;
- performance comparisons by bank, region, protocol, or technician;
- continuous-improvement recommendations;
- executive KPI dashboards.

The final operational report is not Executive analytics and remains in scope.

## Baseline reuse and required extensions

### Reuse without conceptual change

- scenario registry and capability profile;
- role shell and role switcher;
- protocols, schedules, work orders, mobile execution, and validation screens;
- browser-state reset and deterministic demo clock;
- simulated evidence and printable operational report foundation.

### Extend in the implementation increment

- corrective intake and acceptance countdown;
- service, installation, access, and outcome taxonomy;
- access-readiness requirements;
- evidence category and phase;
- site-bound and duplicate-evidence simulation;
- executed concept and quantity capture;
- coordinator validation authority;
- explicit reopen/resubmit revision history;
- ATM-specific operational report layout.

These extensions are scenario requirements. They are not claims that the current baseline already
implements the behavior.

## Seed-data contract

The scenario package will use fictional names, identifiers, locations, bank references, personnel,
contact details, photos, and prices. It must include at least:

- one corrective order awaiting acceptance;
- one corrective order lost after expiration or decline;
- one scheduled preventive order;
- one order in execution;
- one submitted order with an evidence-integrity issue;
- one approved order with a generated report.

All dates must be derived from the deterministic demo clock. The scenario must use a unique browser
state key.

## Simulation disclosure

The UI and documentation must disclose that the following are simulated:

- acceptance notifications;
- camera capture and image upload;
- GPS/geofence validation;
- timestamp verification;
- duplicate and wrong-site image detection;
- report delivery by email or WhatsApp;
- multi-user or bank decisions.

No UI copy may imply a live bank connection, production SLA enforcement, or server-side evidence
custody.

## Acceptance criteria for implementation

1. `atm-field-service` is a registered scenario package and uses `execution-only`.
2. The package contains no client-identifiable or bank-identifiable source data.
3. A corrective order displays a deterministic 24-hour acceptance clock.
4. Accepting the order makes it schedulable; expiration or decline marks it lost.
5. A preventive order is schedulable without the corrective acceptance gate.
6. SITE/REMOTO and access context are visibly separate fields.
7. The selected access protocol changes readiness requirements.
8. Mobile execution captures the minimum evidence, effective time, materials, concepts, and
   quantities.
9. An incomplete, duplicate, or wrong-site evidence example cannot receive a clean approval.
10. A supervisor can approve, reject, and reopen; a coordinator can approve and reopen, with every
    decision attributed.
11. Reopening preserves the previous submission and creates a corrected revision.
12. The approved operational report shows concepts and quantities without prices.
13. Improvement and Executive content is absent from navigation and result screens.
14. Reset restores all seeded states and the walkthrough remains deterministic.
15. Contract tests and `npm run check` pass.

## Explicit non-goals

- Production field-service application or CMMS replacement.
- Real authentication, database, file storage, geolocation, camera, AI, or messaging.
- Bank API, order-ingestion, or document-management integration.
- Pricing catalog, cost estimate, invoice, payment, or financial reconciliation.
- Full replication of the supplied PDF, spreadsheet, email, or folder structure.
- Performance management, OEE, continuous improvement, or executive reporting.

## Data handling

The supplied source ZIP files and their extracted contents are discovery evidence only. They must
not be committed, copied into `public/`, used as demo imagery, or referenced by identifiable name in
the published application.

If real client or bank branding is later requested, that is a distribution change: the scenario
must become `restricted-client-demo` and use private repository and hosting controls before any
assets are introduced.

## Release gate

- **State:** Ready for implementation.
- **Critical evidence verified:** two source cases, PDF and spreadsheet structures, photo metadata,
  duplicate hashes, baseline architecture, and frozen user decisions.
- **Material reservations:** no attention or resolution SLA is defined; the demo must not invent
  one. The bank is not an authenticated role.
- **Explicitly excluded:** real client content, prices, Improvement, Executive, and live
  integrations.
- **Next indispensable action:** implement the registered ATM scenario and its eight-scene
  walkthrough as a separate increment.
