# Browser recovery and static judge build

Decision: 2026-10-31. Reuse native browser storage, confirmation dialogs and the existing message area. No new design surface, account, database or dependency.

## Recovery

Keep one bounded project draft per browser origin in localStorage. Store observations, calibration, provenance, Meta run metadata and optional frozen comparison; never store video bytes or keys. Validate a recovered draft with the project parser. Imported videos must be relinked after refresh. A malformed existing draft is preserved rather than overwritten automatically.

Persist after project edits, not video time updates. Synchronous bounded writes avoid a debounced write being lost on refresh. Show a visible error and retain a native close warning if storage is unavailable/full. Before replacing an edited/recovered project, ask the user to save it or explicitly replace it. Project JSON export remains the durable portable backup; one browser draft is not a version history. Concurrent tabs share the same draft slot; use exported projects for independent experiments.

## Static build

The demo build serves only browser assets, original generated fixtures and attributed MIT-licensed filmed Morpheus examples. It must not contact local /api endpoints, contain credentials, or enable paid actions. Video import, calibration, manual/CSV observations, model comparison, evidence exports and recovery remain functional. Meta assistance requires the separate local server setup; imported completed Meta runs are historical evidence, not fresh inference.

Use relative asset paths so the same build can run under a static host subdirectory. Keep the loopback server's host/origin restrictions and live-off default intact. Do not expose that server publicly. The static package can be prepared and tested locally before choosing/approving a public hosting destination.

## Verification

- Draft round trip including comparison/provenance; invalid and oversized drafts remain preserved.
- Full/quota-denied storage leaves a visible error and does not destroy the previous draft.
- Browser edit → refresh → recovered state → source relink → export.
- Native replacement cancellation retains the current project.
- Static build under a nested URL: sample/video/fonts, manual analysis, exports and reload work; no /api request.
- No claim of public judge access until an actual public URL is deployed and checked.
