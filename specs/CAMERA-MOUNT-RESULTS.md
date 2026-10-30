# Camera-mount Meta demonstration — 2026-10-30

## Verified result
The user-provided AI video now has a schema-valid Muse plan and one SAM phone track containing all 240 frame positions. The reviewed project was opened in Chrome, relinked to the original video, fitted locally, exported, saved and reopened. This verifies a generated-video workflow, not physical prototype accuracy.

Input SHA-256: `2fd1647d4a8c424b1e7b8317df93b23ae7ac2d5b2c7fc3e89945d8320074119d`. See CLIP-REVIEW.md for independently decoded input timing. File contents were pinned by digest before dispatch; every decoded timestamp was checked against 24 fps.

## Actual Meta usage

| Request | Reported units | Usage-based cost |
| --- | --- | ---: |
| Muse Spark 1.3 plan | 3,015 input / 637 output tokens, including 468 reasoning tokens | $0.006476 |
| SAM 3.1, target `phone` | 240 video frames | $0.048000 |
| This pair | Two successful inference requests | **$0.054476** |
| All session testing | Six inference requests, including earlier pendulum tests | **$0.215742** |

Rates were rechecked against [Meta's pricing page](https://dev.meta.ai/docs/pricing-rate-limits). These values use reported units and published Standard-mode prices; the provider invoice is authoritative. Persistent conservative reservations now total **$5.70**, which is not actual spend. The cumulative reservation ceiling remains $10. No retries or further requests were made. Both provider-file cleanup operations returned without a warning.

## Tracking review
- One returned object, ID `0`; 240 unique timestamps at frame index / 24 fps.
- 240 returned positions / 240 decoded video frames is output coverage, not a claim of 100% positional accuracy.
- Reviewed frame indices 0, 30, 60, 90, 120, 165, 192 and 234: each returned center falls on the phone. No independent per-frame reference annotation was collected, so no tracking RMSE is claimed.
- The phone rotates. Bounding-box centers are approximate landmarks, not centers of mass or a rigid material point.
- Muse proposed damped horizontal motion in pixels and warned about missing scale, perspective, possible occlusion, model mismatch and generated nonphysical motion. These are reviewable proposals. No numeric parameter was extracted from model prose.

## Deterministic model comparison
Axis x, no metric calibration. First **168 observations** fit coefficients; later **72 observations** from 7.00 s onward are chronological validation. Ranking uses training BIC, not validation error.

| Model | Training RMSE (px) | Validation RMSE (px) | Training BIC |
| --- | ---: | ---: | ---: |
| Damped oscillation | 8.59228 | 7.71367 | 748.31 |
| Ideal oscillation | 8.95210 | 11.84783 | 756.97 |
| Constant velocity | 14.06507 | 9.25572 | 898.53 |
| Constant acceleration | 13.96947 | 3.58113 | 901.36 |

The lowest-training-BIC candidate is damped oscillation: fitted frequency 0.79744 Hz (period 1.25402 s), fitted decay 0.09581 s^-1. These describe the rendered track under the model assumptions, not a measured physical mount property.

The quadratic candidate has lower validation error on the late segment, which is nearly stationary. The damped fit still predicts appreciable oscillation after the observed motion becomes small. The plot and errors expose that mismatch; no physical law, superiority over a baseline tool, accurate settling-time prediction or separate-recording transfer is established. Repeated inspection also means this is validation rather than an untouched final test.

## Browser evidence and saved outputs
- Used Chrome's normal native Open dialog to select the reviewed project under Documents. This succeeded where automated file-chooser selection had returned a permission error. No security setting was changed and no protected file was relocated.
- Relinked the original Downloads video, confirmed 240 points, generated-input labels, two recorded Meta runs and the 7.00 s validation boundary.
- Switched model candidates and residuals; restored the damped training-BIC choice. Updated the step guide to allow pixel analysis without claiming metric calibration. Muse details use a native disclosure so the chart remains near the video.
- Browser exports were inspected: CSV has 240 SAM rows with 168 training / 72 validation labels; Markdown retains all four model errors and Meta provenance.
- Saved and reopened the actual completed project through Downloads, then relinked the original video again. No browser console warnings/errors were returned by the final check.
- Local artifacts: `artifacts/camera-mount/verified-project.twinlab.json`, `observations.csv`, `report.md`, `review.json`, `sam-review.png` and `verified-workbench.png`. Raw provider outputs and per-request input manifests remain in ignored `artifacts/meta-live/`.
- No footage or derived screenshot is published in GitHub source. The app remains loopback-only with paid UI controls off. Live requests ran through the capped runner; the normal paid browser request endpoint was not exercised live.

## Next milestone
Freeze a model from one recording, allow only declared initial-state alignment on a separate recording, and score its later predictions without refitting dynamics. That feature and real-camera validation remain outstanding. AI footage can demonstrate this workflow but cannot supply physical ground truth.
