# MNT-DEMO-ATM-002 — Static visual references

These references visualize the eight-scene storyboard before functional implementation.

- They use fictional data.
- GPS, camera, integrity checks, notifications, and delivery are visibly simulated.
- They do not modify or claim implemented behavior in the Maintenance OS runtime.
- Desktop references use the current application shell; mobile references use the current Mobile
  Operations visual language.

Run `node render-scenes.mjs` to regenerate the native SVG references, then export them to PNG with
Inkscape. The generator uses only SVG primitives so text and layout remain deterministic.

The images in `renders/` are review artifacts. Implementation remains gated until the visual
direction is approved.

## Review set

- [Overview](renders/overview.png)
- [Scene 1 — Corrective intake](renders/scene-01.png)
- [Scene 2 — Accept and classify](renders/scene-02.png)
- [Scene 3 — Schedule and prepare access](renders/scene-03.png)
- [Scene 4 — Mobile arrival and check-in](renders/scene-04.png)
- [Scene 5 — Guided pre-evidence](renders/scene-05.png)
- [Scene 6 — Execute and submit](renders/scene-06.png)
- [Scene 7 — Validate, reopen, and correct](renders/scene-07.png)
- [Scene 8 — Approve and generate report](renders/scene-08.png)

## Approval gate

Review the static references for workflow, information hierarchy, terminology, role authority,
desktop/mobile split, and report content. Approval authorizes implementation planning; it does not
authorize publication or imply that the depicted functions already exist in the runtime.
