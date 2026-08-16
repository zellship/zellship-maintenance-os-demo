# MNT-DEMO-WEB-001 — Multi-scenario GitHub Pages release

## Status

Release candidate for partner sharing.

## Public routes

- ATM field service: `/zellship-maintenance-os-demo/`.
- Neutral wire-plant maintenance: `/zellship-maintenance-os-demo/wire/`.

## Decision

The existing ATM URL remains unchanged. The neutral **Planta de Alambres** scenario is published
under a separate route with its own static assets and browser-state key. Both routes are assembled
into one GitHub Pages artifact after all scenario validations pass.

## Release gate

- Calendar work-order detail stays inside Programación.
- WhatsApp communication remains explicitly simulated.
- Industrial, ATM and wire scenario checks pass.
- Both public-route HTML files and their route-specific assets exist in `dist-pages`.
- The wire scenario remains `public-demo` and contains no client-identifiable data.
