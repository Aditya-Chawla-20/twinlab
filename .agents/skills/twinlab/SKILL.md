---
name: twinlab
description: Maintain this TwinLab experimental-video workbench, its measurement pipeline, Meta integrations and specs. Use for changes in this repository, not unrelated physics or AI applications.
---

Read `PRODUCT.md`, `specs/ARCHITECTURE.md` and the latest `specs/PROGRESS.md` entry before changing behavior. Record meaningful steps, decisions, checks and remaining limitations in `specs/`.

Application implementation is original. Open-source projects in `specs/SOURCES.md` are references, not a template to copy. Keep dependencies small and preserve license notices.

Ordinary agent QA uses injected fake transport and synthetic observations. Paid agent tests require an explicit user budget and the persistent capped test runner; never reset its ledger or expose credentials. Current session authorization on 2026-10-30 is at most $10 total for Meta testing. Sample output must remain labeled synthetic; record any actual provider evidence separately.

Keep fitting and evaluation deterministic. Fit only training observations, rank by training criteria, and report chronological validation separately. Do not turn model prose into measured parameters. Require calibration before metric claims, preserve missing observations, and require confirmed constant frame rate for SAM frame-to-time conversion.

Keep credentials server-side. Paid runs require explicit review, are never retried automatically, and preserve usage even when validation fails. Invalidate stale asynchronous results when projects or files change.

Run `npm run check` and exercise affected browser workflows without live calls. Update `specs/VERIFICATION.md` with what was actually checked. Public hosting requires authentication and budget isolation beyond the single-user loopback server; do not imply those exist.
