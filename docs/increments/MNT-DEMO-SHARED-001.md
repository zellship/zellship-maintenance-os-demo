# MNT-DEMO-SHARED-001 — In-context work-order detail

## Status

Implemented as a shared navigation correction for every demo scenario.

## Decision

Opening a scheduled work order from either the calendar or the operational list in
**Programación** displays its full operational detail in a modal. Closing the modal returns to the
same planning view without changing the selected period, calendar mode or filters.

The standalone **Órdenes de trabajo** module remains available for browsing and following the full
order portfolio. This change only removes the forced cross-module navigation from Programación.

## Acceptance criteria

- Calendar events open the detail modal without changing the active navigation item.
- Rows in the planning list follow the same behavior.
- Closing with the header control, Escape, backdrop or footer button preserves planning state.
- The implementation is shared by the industrial, ATM and wire-plant scenarios.
- TypeScript, formatting, tests and all scenario builds pass.

## Scope boundary

No order data, workflow state or permissions change. WhatsApp delivery semantics are evaluated
separately and are not part of this increment.
