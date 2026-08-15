# MNT-DEMO-ATM-003B — Visual Walkthrough, Demo Script and Release Candidate

## Status

- Release candidate: `RC1`
- Scenario version: `0.3.0`
- State: **Ready with explicit reservation**
- Prepared on: `2026-08-14`
- Parent build: `MNT-DEMO-ATM-003A`
- Target scenario: `atm-field-service`
- Capability profile: `execution-only`
- Distribution: `public-demo`
- Publication: not authorized and not performed

## Control brief

- **Objective:** make the ATM scenario safe, coherent, and repeatable for a prospect presentation.
- **Audience:** an ATM maintenance provider evaluating whether Maintenance OS fits its execution
  model, plus the Zellship presenter operating the demo.
- **Decision sought:** obtain agreement to continue with project definition or implementation based
  on visible operational fit.
- **Included:** corrective intake, acceptance, planning, access readiness, mobile execution,
  simulated evidence, concepts and quantities, validation authority, correction, approval, and
  operational reporting.
- **Excluded:** production bank integration, real GPS/camera custody, real image analysis, real
  messaging, prices, Improvement, Executive, security/load claims, and public deployment.
- **Completion condition:** a presenter can run a deterministic 8–10 minute commercial walkthrough,
  distinguish every simulation, recover with reset, and support every statement with visible
  product behavior or an explicit limitation.

## Release-candidate decision

Use the **commercial cut** for the meeting. It executes intake, acceptance, scheduling, and one
mobile submission live. It then demonstrates reopening and uses a clearly identified prepared R2
record for the final report.

A continuous live R1 → reopen → repeat protocol → R2 → approval journey remains available, but it
takes approximately 14–18 minutes because the technician must capture all required evidence again.
Compressing that journey into 8–10 minutes would require skipping required steps or hiding a state
change, so it is not the recommended sales path.

## Confirmed, recommended, and pending

### Confirmed in the runtime

- One shared application runtime serves `industrial-base` and `atm-field-service`.
- Corrective `SO-ATM-2401` has a 24-hour acceptance window and four deterministic hours remaining.
- Preventive work bypasses corrective acceptance.
- Service type, installation class, and access context are separate fields.
- Planning validates technician, schedule, tools, stock, and access readiness.
- Mobile execution requires simulated GPS, timestamps, three photographs, signature, form,
  concepts, quantities, and material consumption.
- Supervisor can approve, reject, or reopen; Coordination can approve or reopen but cannot reject.
- Reopening preserves the previous execution and the next submission creates a new revision.
- The operational report contains service classification, effective time, evidence, concepts,
  quantities, and revision; it excludes prices and Improvement/Executive metrics.

### Recommendation

- Present operational urgency first and configuration breadth second.
- Keep the preventive order visible as proof of a second path; do not execute it.
- Do not spend presentation time in Assets, Resources, Protocol Wizard, or Notifications unless the
  prospect asks.
- Stop after the operational report and implementation boundary. Do not add an analytics ending.

### Pending before publication

- Actual browser rendering at 1440 px and 390 px on the final hosted candidate.
- Print preview of the final report.
- One human rehearsal using the exact meeting computer and browser.
- Explicit authorization for the separate public ATM URL.

The current environment can compile and inspect the application but its remote browser blocks the
local-only URL. Therefore this document does not claim that visual browser QA has passed.

## Demo-critical corrections included in RC1

1. The accepted corrective now schedules for the same deterministic day at 10:00, keeping the
   coordinator-to-technician sequence coherent.
2. Required access conditions now participate in the Planning readiness gate; technician identity
   becomes ready only after an eligible technician is selected.
3. Acceptance confirms the received classification without presenting unsupported protocol
   remapping through editable fields.
4. GPS, image analysis, push, report delivery, and captured media are labeled as simulated at the
   action and result surfaces.
5. The ATM reference image uses scenario-owned terminology instead of inherited compressor copy.
6. An automated eight-scene contract protects the seeded story, authority boundaries, evidence
   manifest, work concepts, and capability exclusions.
7. Deterministic commands were added for local ATM presentation and dual-scenario release checks.
8. The mobile role starts with three executable assignments across commerce, bank, and residential
   access contexts.
9. The photographic manifest names each required before, during, and final capture and simulates a
   camera flash while preserving GPS and timestamp metadata per image.
10. Field photographs are realistic fictional mobile captures; no client brand, address, or real
    location is distributed in the public scenario.
11. The closed-service view follows the supplied operating record structure: general data,
    background, diagnosis, actions, conclusions, photographic log, concepts/quantities, and
    approval.
12. Protocol rows provide a read-only configuration view and use a two-line description limit to
    prevent excessively tall rows.

## Presenter setup

From the repository root:

```bash
npm run demo:atm
```

Then:

1. Open the local URL shown by Vite.
2. Use a desktop viewport for Coordination and Supervision.
3. Select `Marina Ortega` and enter demo PIN `1234`.
4. Press **Reiniciar datos demo** immediately before the meeting.
5. Keep this script open on a second screen; do not improvise dates, SLAs, integrations, or client
   data.

If the state becomes unclear, reset and restart. Recovery is faster and safer than manually trying
to reconstruct the record.

## Recommended 8–10 minute script

### Opening — 0:00–0:35

**Visible:** login and role selection.

**Say:**

> Esta es una configuración de Zellship Maintenance OS aplicada al mantenimiento de cajeros. Hoy
> vamos a ver cómo se recorre un correctivo desde que se recibe hasta su expediente operativo. Las integraciones
> con el banco, GPS, cámara y canales de envío están simuladas en esta demostración.

Do not open with architecture, engines, OEE, or dashboards.

### Scene 1 — Corrective intake — 0:35–1:20

**Path:** Coordination → `Servicios recibidos` → select `SO-ATM-2401`.

**Show:**

- one corrective awaiting acceptance;
- four hours remaining;
- one service not obtained after expiration;
- preventive monthly work in the same queue without acceptance.

**Say:**

> El primer riesgo no es todavía reparar el cajero; es aceptar el correctivo a tiempo. Si vence esta
> ventana, el servicio se pierde. El preventivo entra por planeación y no usa este contador.

### Scene 2 — Accept and confirm classification — 1:20–2:00

**Path:** `Revisar y aceptar` → review the three fields → `Aceptar servicio`.

**Show:** `Correctivo`, `REMOTO`, and `Comercio` as separate values.

**Say:**

> Las 24 horas aplican solamente a aceptar. Al aceptar, confirmamos tres dimensiones separadas que
> determinan el protocolo operativo: tipo de servicio, instalación y contexto de acceso.

Do not say that the service must be resolved in 24 hours.

### Scene 3 — Schedule and prepare access — 2:00–3:05

**Path:** `Programar servicio` → Planning modal → review prefilled data → `Validar y reservar`.

**Show:**

- `SO-ATM-2401` and `Comercio Norte 014` carried into Planning;
- Luis Campos as eligible technician;
- 14 August, 10:00;
- skills, schedule, tools, inventory, and access readiness all green;
- technician identification linked to the selected person.

**Say:**

> No sólo asignamos una fecha. Antes de liberar la orden validamos quién puede atender, qué recursos
> necesita y si las condiciones de acceso están listas. El protocolo cambia por contexto sin crear
> otro sistema.

### Scene 4 — Mobile arrival and check-in — 3:05–3:55

**Path:** switch role to `Operación móvil` → `Atender orden` → `Comenzar ejecución` → confirm
resources.

**Show:** ATM, site, reserved tools/materials, eligible skills, and simulated GPS.

**Say:**

> El técnico recibe la misma orden y no vuelve a capturar el contexto. Confirma recursos y registra
> la ubicación. Aquí el GPS es simulado; en implementación se conectaría la fuente y las reglas de
> integridad acordadas.

### Scene 5 — Guided evidence — 3:55–5:05

**Path:** confirm simulated GPS and timestamp; for the first photo show the reference, capture,
rate, and confirm. Continue through the required evidence manifest.

**Show:** reference image, capture frame, simulated visual result, human rating, and site-specific
guidance.

**Say:**

> La evidencia no es un archivo suelto. Está ligada a la orden, al activo y al protocolo. La
> referencia ayuda al técnico a capturar lo que el banco necesita revisar. El análisis visual que
> ven aquí también es una simulación.

Keep the repeated photo captures moving; explain the pattern once.

### Scene 6 — Execute and submit — 5:05–6:35

**Path:** complete required form fields → confirm default concepts/quantities → confirm material
consumption → review → `Confirmar y enviar`.

Suggested values:

- Diagnóstico: `Desgaste exterior y ajuste menor en puerta de acceso.`
- Prueba de operación: `Operación correcta`.
- Limpieza final: `Sí`.
- Observation: `Servicio completado conforme al protocolo.`

**Show:** effective time, concepts `CF-014` and `PA-006`, quantities, materials, evidence count, and
pending validation.

**Say:**

> El cierre reúne qué se hizo, cantidades, materiales, tiempo efectivo y evidencia. En esta versión
> dejamos precios fuera porque el dolor que estamos resolviendo primero es la ejecución y la calidad
> del reporte.

### Scene 7 — Validate and reopen — 6:35–7:45

**Path:** switch role to `Supervisión` → open the new pending execution → review evidence and score →
enter `La evidencia final requiere una toma más abierta del sitio.` → `Reabrir para corregir`.

**Show:** decision controls, required reason, prior revision retained, and operator notification.

**Say:**

> Un trabajo incompleto no se cierra sólo porque el técnico terminó. Supervisión puede rechazar o
> reabrir con una instrucción concreta. Coordinación puede aprobar o reabrir, pero no hacer el
> rechazo interno.

Then say explicitly:

> Para no repetir ahora todo el protocolo móvil, voy a abrir un expediente R2 que ya dejamos
> preparado. Es otro registro ficticio y representa el resultado después de corregir y reenviar.

This disclosure is required in the short cut. Do not present the prepared R2 as the same live order.

### Scene 8 — Approved report — 7:45–9:10

**Path:** switch to `Coordinación` → `Resultados` → open validated `OT-ATM-2374` / R2 → optionally
open `Enviar resultado`.

**Show:** approval, revision R2, service classification, effective time, evidence, concepts and
quantities without prices, and simulated delivery disclaimer.

**Say:**

> El expediente se consolida con la información capturada durante la operación; no se vuelve a
> armar manualmente. Incluye trazabilidad, revisión, conceptos, cantidades, evidencia y aprobación.
> El envío por correo o WhatsApp que aparece aquí es simulado.

### Close — 9:10–9:40

**Say:**

> Lo que estamos validando hoy es el ajuste del modelo operativo: recibir, comprometer, ejecutar,
> comprobar y cerrar. El siguiente paso sería definir con ustedes las reglas reales de integración,
> protocolos por ubicación y formato de entrega del banco.

Stop there and invite questions. Do not add Improvement or Executive as if they were included.

## Full continuous path — 14–18 minutes

Use only when the prospect asks to see the correction itself:

1. Complete Scenes 1–7 above.
2. Switch to Operation mobile; the reopened Luis Campos order returns to Pending.
3. Execute the full evidence, form, concepts, and consumption sequence again.
4. Switch to Coordination → Validations; approve the new revision.
5. Open Results and show the report for the same work order.

State clearly that every required evidence is being captured again because the protocol blocks an
incomplete resubmission.

## Visual walkthrough matrix

| Scene | Storyboard proof               | Runtime proof inspected                                            | RC1 status                         |
| ----- | ------------------------------ | ------------------------------------------------------------------ | ---------------------------------- |
| 1     | Countdown and commercial risk  | Metrics, queue, selected detail, expiration state                  | Structural pass                    |
| 2     | Three independent dimensions   | Read-only confirmation modal and acceptance mutation               | Structural pass                    |
| 3     | Eligible technician and access | Shared Planning modal plus access-readiness gate                   | Structural pass after RC1 fix      |
| 4     | Site-bound start               | Mobile shell, resource confirmation, simulated GPS                 | Structural pass                    |
| 5     | Guided manifest                | Scenario reference asset, three photos, rating, simulated analysis | Structural pass after RC1 copy fix |
| 6     | Concepts without prices        | Form, concepts, materials, confirmation, revision creation         | Structural pass                    |
| 7     | Authority and correction       | Role guard, required reason, reopen state, notification            | Structural pass                    |
| 8     | Consolidated report            | R2, classification, time, evidence, concepts, simulated delivery   | Structural pass after RC1 copy fix |

`Structural pass` means the component hierarchy, state behavior, labels, and responsive rules were
inspected and compiled. It does not replace an actual rendered browser check.

## Questions the presenter should answer precisely

**Is the bank already integrated?**
No. Order intake and acknowledgement are represented in the demo; the production integration must
be defined with the bank/provider.

**Does it validate real GPS and photograph metadata?**
No. The demo simulates capture and validation. The implementation would require the agreed mobile,
metadata, storage, and integrity controls.

**Can SITE/REMOTO use different location protocols?**
Yes in the scenario model: service, installation, and access context are separate classifications.
The detailed client rules still need confirmation during implementation.

**Why are there no prices or executive dashboards?**
They are intentionally outside this first operational demonstration. The current objective is
reliable execution and evidence-backed closure.

**Can Coordination reject?**
No. Coordination can approve or reopen; internal rejection is reserved for Supervision.

## Release verification

Run:

```bash
npm run check:release
```

Required evidence:

- TypeScript, lint, formatting, and all tests pass.
- The eight-scene contract passes.
- Both `industrial-base` and `atm-field-service` production builds pass.
- No ATM client-identifiable data is present.
- No Improvement or Executive capability appears in the ATM build.
- The ATM and industrial scenarios retain separate browser-state keys.

RC1 verification recorded on `2026-08-14`:

- TypeScript: pass.
- Tests: `27/27` pass, including nine dedicated walkthrough checks.
- ESLint: no errors; seven inherited Fast Refresh warnings remain.
- Prettier: pass.
- Industrial Pages build: pass.
- ATM Pages build: pass.
- Three fictional ATM field photographs: generated, optimized, and visually inspected; pass.
- Application browser walkthrough: pending for the final hosted candidate.

## Release gate

```text
State: Ready with explicit reservation
Completion condition fulfilled: Partially
Critical evidence verified: Domain, scenario, state, copy, tests, and dual builds
Reservation: Final hosted desktop/mobile and print visual review remains pending
Explicit exclusions: Real integrations, production claims, analytics, and deployment
Indispensable next action: Visual UAT on the candidate URL, then explicit publish authorization
```

Do not publish RC1 until that final visual UAT is recorded.
