# MNT-DEMO-SHARED-002 — Truthful WhatsApp simulation

## Status

Implemented as a shared truth-boundary correction for every demo scenario.

## Decision

Business-initiated WhatsApp events are represented as previews of utility templates rather than
free-form messages that were sent or delivered. Each preview can expose a template name, its
operational variable and an **Abrir en Zellship** call to action.

## Acceptance criteria

- WhatsApp events say **Template simulado** or **Template revisado**.
- No demo action claims that WhatsApp delivered a real message.
- The on-demand form treats entered text as an operational template variable.
- Report sharing explains the difference between email attachment and WhatsApp template access.
- Push, System and SMS remain simulated system events without inheriting WhatsApp terminology.

## Scope boundary

This increment does not integrate WhatsApp Business Platform, create or approve Meta templates,
send messages, capture consent, expose public report links or process delivery webhooks.
