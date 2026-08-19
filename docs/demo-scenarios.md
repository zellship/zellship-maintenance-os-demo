# Demo scenarios

Start each walkthrough by pressing the reset button in the header.

Public development and production commands use the current calendar date. Use the `:fixed`
development commands only when the walkthrough must reproduce the audited date exactly.

Select the scenario at build or development time. The industrial walkthrough remains the default;
the ATM, Wire, and Retail walkthroughs use separate state keys and fictional datasets.

```bash
npm run demo:atm
```

```bash
npm run demo:wire
```

The Retail scenario uses the same public-safe fictitious dataset and is published under its own
GitHub Pages route:

```bash
npm run demo:retail:fixed
```

Public route: `/zellship-maintenance-os-demo/retail/`.

## Retail store operations — eight-scene walkthrough

All store names, people, providers, assets and operational records are fictitious. Reset the demo,
sign in as **Centro de soporte**, and keep `RTL-SUP-2048` as the primary story.

1. Review **Centro de tiendas**: six locations, today’s operational program, and active support.
2. Use the quick action **Nueva asignación**, select a protocol and one or more stores, and publish
   independent assignments.
3. Change to **Mi tienda**. On a narrow screen, open **Programa**, select an assignment, and use
   **Atender** to start it.
4. Use **Solicitar asistencia** from the store home to create a direct case, or execute
   `RTL-ASG-1024` and report the simulated 27.8 °C deviation without leaving its protocol.
5. Return to **Centro de soporte**, open `RTL-SUP-2048`, and assign the safe remote diagnostic.
6. In **Mi tienda**, complete only the visible checks and select **El problema continúa**.
7. In support, assign the simulated external provider and register the service resolution.
8. In the store, confirm restored operation; then use **Supervisión** or support to validate and
   close the case.

The case must remain linked to its source assignment and protocol throughout the walkthrough.
Store confirmation is required before final closure. Do not present the simulated messages,
diagnostics, provider dispatch, location, or evidence as live integrations.

## Shared operational-profile walkthrough

The following checks apply to Industrial, ATM, and Planta de Alambres:

1. In **Coordinación**, use **Nueva orden** to create immediate work from the current screen. Keep
   **Programación** for future commitments and calendar work.
2. Open an incident and use **Dar seguimiento**. Add a comment or simulated attachment, create a
   linked work order when action is required, record the resolution, and close only after review.
3. Open an asset profile and read **Estado y plan** first: availability, operational condition,
   plan compliance, next intervention, health, and open incidents. Confirm that availability and
   condition are separate dimensions, then open a work-order detail without leaving the profile.
4. Repeat the profile review for a collaborator in **Capacidad y carga**: current availability,
   eight-hour demonstrated capacity, assigned hours, remaining capacity, shift plan, and related
   incidents.
5. Upload a simulated document and verify its metadata appears in the profile. Do not present this
   as binary file storage, version control, access control, or a productive document repository.

## Wire plant maintenance — eight-scene walkthrough

All equipment conditions, work history, measurements, people names, tools and evidence are
demonstration data. The scenario does not identify a real company or claim a real equipment fault.

1. Enter as **Coordinación de mantenimiento** and open the neutral **Centro de control** for Planta
   de Alambres.
2. Open **Activos**, review the 26-equipment inventory by area, and select `TRF-03`.
3. Connect the simulated noise-and-vibration report to `OT-ALM-2408` and its corrective protocol.
4. Review eligibility, LOTO, vibration and thermal tools, and the assigned electromecánico.
5. Change to **Operación técnica**, open `OT-ALM-2408`, and confirm the reserved resources.
6. Capture the simulated before, during and after photos; complete readings, safety confirmation and
   the operational test.
7. Change to **Supervisión de mantenimiento**, review the evidence, and release or reopen the result.
8. Return to coordination and open the consolidated maintenance result and report.

Keep the compressor, transformer, furnace, crane and electrowelded-mesh activities visible as
secondary proof of coverage. Do not present GPS, PLC/sensor integration, predictive AI, OEE,
production data or spare-parts inventory as implemented capabilities.

## ATM field service — eight-scene walkthrough

The presenter-ready timing, narration, safe short cut, truth boundaries, and release gate are in
[`MNT-DEMO-ATM-003E`](increments/MNT-DEMO-ATM-003E.md).

1. Enter as **Coordinación**. The unified **Centro operativo** opens with **Servicios recibidos** as its first workspace.
2. Review `SO-ATM-2401`, distinguish Correctivo, REMOTO, and Comercio, then accept it before the
   simulated four-hour remainder expires.
3. Select **Programar servicio** and use the existing Planning modal to assign resources and complete
   access readiness.
4. Change to **Operación móvil**, open the assigned order, and confirm the simulated site/GPS check.
5. Follow the protocol and capture the guided simulated photo evidence.
6. Complete the form, materials, concepts and quantities, effective time, and submit the execution.
7. Change to **Supervisión**, reopen with a required reason, return to the technician for a corrected
   revision, and submit again.
8. Return to **Coordinación**, approve, and open the consolidated operational report.

Keep the monthly preventive order visible as proof of the second operating path, but do not execute
a second full story. Improvement and Executive are intentionally absent.

## Industrial base — control center and planning

1. Select **Administración**.
2. Review the live control center and active maintenance commitments.
3. Open **Protocolos** to inspect protocol requirements and evidence rules.
4. Open **Programación** and review technician eligibility, tools, and reserved materials.
5. Open **Órdenes de trabajo** to connect the schedule with its asset and execution status.

Expected result: the audience sees how protocol configuration becomes executable work with
resources and traceability.

## Industrial base — technician execution

1. Select **Operación móvil**.
2. Open an assigned or pending order for Ana Torres.
3. Confirm resources and follow the guided execution.
4. Capture the simulated evidence, complete the form, and confirm material consumption.
5. Submit the execution.

Expected result: the schedule becomes completed, resources are released, inventory is adjusted,
and notifications or validation work are created.

## Industrial base — supervisor validation

1. Select **Supervisión** after completing the operator flow.
2. Open **Validaciones** and inspect the submitted evidence and score.
3. Approve or reject the result with a comment.
4. Review **Alertas**, **Notificaciones**, and **KPIs**.

Expected result: the decision updates the execution and demonstrates the governance loop.

## Reset and limitations

The reset button restores the seeded state stored in the browser. The demo does not send messages,
store uploaded file contents, call an AI model, validate real GPS coordinates, or persist data
outside the current browser profile. WhatsApp templates, incident attachments, warranties,
contracts, manuals, and personnel records are simulated browser metadata.
