# TwinLab submission preparation

Draft, checked 2026-10-31. This is not a submitted entry. Replace pending fields with verified facts before publication/submission.

## Product description

TwinLab helps makers and prototype engineers turn a fixed-camera motion recording into an inspectable 1D model. Muse Spark proposes an experiment plan; SAM produces object tracks; the user reviews source, scale and observations. Deterministic fitting compares explicit model families, separates earlier fitting from later validation, and exports reproducible evidence. A frozen-model CLI can evaluate a separate release while keeping source dynamics fixed.

Practical workflow: examine how a flexible phone/camera mount settles after a disturbance, then test whether the same model predicts another release. This is a proposed use case, not a claim of customer adoption or structural certification.

## Meta contribution

- Muse Spark 1.3: video understanding and structured analysis proposal. A human reviews the object, axis, candidate family and assumptions.
- SAM 3.1: video segmentation/tracking, object identity, frame-indexed boxes/masks. Reviewed box centers become approximate observations; missing frames stay missing.
- Local TypeScript mathematics: calibration, fitting, chronological validation, frozen dynamics and exports. These numerical results do not come from model prose.
- Live evidence: six inference requests across generated fixtures. Latest phone clip produced 240 observations from 240 processed frames. Coverage is not tracking accuracy. Reported session cost $0.215742; billing dashboard is authoritative.

## Original contributions

Original React/TypeScript workbench, observation/calibration editor, deterministic model comparison, data partitioning, frozen-model/evidence contracts, bounded Meta transport/testing and reproducible exports. Open-source applications informed the research; their implementations were not copied. React/Vite/SDK/SAM parser/fonts are standard dependencies credited separately.

## Current evidence and gaps

| Claim | Evidence | Limit |
| --- | --- | --- |
| Meta integrations work | Saved Muse plans and SAM tracks; camera-mount GUI exports/reopen verified | Generated footage only; paid browser endpoint still off |
| Fit and validation are separate | Regression checks poison held-out samples | Repeated model inspection is exploratory |
| Transfer keeps dynamics frozen | Two generated releases; hash verification, prefix-only alignment and later scoring | Numerical regression; browser screen and real-camera transfer pending |
| Product is reproducible | Public source; npm setup; local sample; JSON/CSV/Markdown | Judge-accessible hosting/video still pending |

Do not claim arbitrary physics discovery, universal digital twins, physical causation, validated interventions, real-camera accuracy, superior performance to Tracker, users or demand without evidence.

## Required links and participant information

- Public repository: https://github.com/Aditya-Chawla-20/twinlab
- Proposed theme: Push the Frontier (confirm actual portal wording and chosen track).
- Judge product URL: pending.
- Three-minute demo URL and captions/transcript: pending.
- Human participant / team / collaborator list: user confirmation required; do not infer from Git history.
- Relevant validation results and limitations: link final verification and prediction reports when available.
- Actual portal field names and successful submission confirmation: pending.

## Demo sequence to record after feature completion

0:00–0:20: phone-mount question and intended maker audience. Label the supplied clip AI-generated.

0:20–0:55: show the actual saved Muse proposal and reviewed 240-frame SAM result. Identify this as a recorded run and show its actual cost; do not simulate a fresh API response.

0:55–1:30: review the tracked landmark, units and earlier/later split. Show all candidate errors, including cases where another candidate predicts the quiet ending better.

1:30–2:15: freeze A, open independent B, declare initial-state window, evaluate later motion and compare baselines. Label generated fixtures and any remaining physical validation gap.

2:15–2:40: export/reopen evidence, inspect immutable model/input identities and usage. Explain no model calls occur during fitting/transfer.

2:40–3:00: original work, present limitations, reproducible setup and next real experiment. Use the actual final implementation, not mock screens.

Supplied deadline: November 4, 2026, 9 PM EST / November 5, 7:30 AM IST. Recheck the official portal before submission. Accessible video, correct links and participant details are still required.
