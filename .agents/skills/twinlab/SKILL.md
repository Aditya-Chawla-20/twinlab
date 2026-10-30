---
name: twinlab
description: Maintain this TwinLab experimental-video workbench, its measurement pipeline, Meta integrations and specs. Use for changes in this repository, not unrelated physics or AI applications.
---

Read `PRODUCT.md`, `specs/ARCHITECTURE.md` and the latest `specs/PROGRESS.md` entry before changing behavior. Record meaningful steps, decisions, checks and remaining limitations in `specs/`.

Application implementation is original. Open-source projects in `specs/SOURCES.md` are references, not a template to copy. Keep dependencies small and preserve license notices.

The user runs all paid Meta tests. Do not call Meta APIs, inspect a key, enable live mode or use paid controls during agent QA. Use injected fake transport and synthetic observations. Sample output must remain labeled synthetic; never describe it as live model evidence.

Keep fitting and evaluation deterministic. Fit only training observations, rank by training criteria, and report chronological validation separately. Do not turn model prose into measured parameters. Require calibration before metric claims, preserve missing observations, and require confirmed constant frame rate for SAM frame-to-time conversion.

Keep credentials server-side. Paid runs require explicit review, are never retried automatically, and preserve usage even when validation fails. Invalidate stale asynchronous results when projects or files change.

Run `npm run check` and exercise affected browser workflows without live calls. Update `specs/VERIFICATION.md` with what was actually checked. Public hosting requires authentication and budget isolation beyond the single-user loopback server; do not imply those exist.
