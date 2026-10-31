# Licensed real-footage evaluation

Status: completed conditional pixel-only evaluation, 2026-10-31. Physical metrology and capture-condition verification remain open research. The user explicitly chose suitable openly licensed footage rather than making a new recording.

## Source and limits

[Morpheus Real-World Physics Videos](https://huggingface.co/datasets/physics-from-video/morpheus-real-world) identifies these clips as filmed physical experiments and declares MIT licensing. Attribution: Antonios Tragoudaras and collaborators, *Evaluating Newtonian Mechanics in Video Generative Models with Real Physical Systems*, ICML 2026. The associated [source license](https://github.com/physics-from-video/Morpheus/blob/main/LICENSE) credits Antonios Tragoudaras, 2026. No Morpheus application implementation is copied.

Selected `real-world-cropped/spring/video_0_fps30` (A) and `video_1_fps30` (B). Original SHA-256 values match the publisher's LFS metadata:

- A: `e223df8c1c989b7b453d423eafaa92ec49c0cdc879429569056bdb362125140d` (31 s, 930 frames).
- B: `1052fc59915f57a92f6f02368111994ace67b64fa778f5b74b371a12631d5693` (29.933333 s, 898 frames).

Both are 1280 × 1024 at 30 fps. Retained the first 20 s, removed audio and re-encoded H.264 CRF22 at the same dimensions, zero-origin CFR30. No spatial transform. Both derived 600-frame inputs pass decoded-timestamp verification in the capped runner:

- A: `9ccdf8e57f74e13bbc18a5391c4af0086677f92ff7055d82811656efb5434b2b`.
- B: `7cef956d5758cccd8033e8148e04d97919607f9fc26629a85e0dc20abfc5f4a5`.

The capture/hidden load conditions are not independently authenticated. Similar apparatus/camera scale is a visual assumption. There is no verified metric reference, so evaluate pixels only. These clips validate a laboratory motion workflow; they are not recordings of the user's phone mount.

## Independent reference before tracking

Saved 20 agent visual annotations per clip from coordinate-labeled source crops before any SAM call. Landmark: approximate bounding-box center of the cylindrical body, excluding hook/spring. Estimated visual uncertainty around 5 px per coordinate. These are not independent human metrology labels. Preserve these original annotations even when another landmark disagrees.

Exact reference coordinates and agreement rows are published in `specs/evidence/reference-A.json`, `reference-B.json`, `agreement-A.json` and `agreement-B.json`. Frame imagery and raw-response custody remain under ignored `artifacts/morpheus/`; source clips and all600 observations are public. Do not describe 600/600 returned points as 100% tracking accuracy.

## Observed tracking issue and response

First A call: Muse plan completed, SAM returned 600 box centers. The box intermittently includes hook/spring regions, moving its center away from the body reference. Cost: $0.0093615 Muse + $0.12 SAM. Lowest training BIC is damped, validation RMSE 9.40445 px. This does not pass a tight position-accuracy claim.

Added explicit mask-foreground-centroid observations using the installed official parser's `decodeMaskToRaster`; retained box centers as a selectable alternative. Pixel centers and source bounds are mapped explicitly. Empty masks remain missing; oversized masks fail without fabricated points. Geometric centroids are not centers of mass. The full provider mask text is retained in runner artifacts to permit further offline review.

A deliberate second A tracking call cost $0.12. Both box and centroid observations are preserved. Mask-centroid damped fit: frequency 0.4201545583 Hz, decay 0.0119331742/s, training RMSE 1.33349 px, later validation RMSE 2.16843 px. This is fit error against SAM observations, not tracking accuracy.

Against the 20 approximate body-center annotations, second-call box-center vertical RMSE is 21.96787 px and centroid vertical RMSE 10.37306 px (mean centroid offset -7.28273 px). Different landmark definitions and annotation uncertainty contribute; do not relabel these as a high-precision ground-truth benchmark or hide the disagreement. Source segmentation quality and dynamics error are separate.

## B transfer protocol, before calculating scores

Freeze A's lowest-training-BIC damped fit using its 420 earlier centroid observations; retain A's 180 later observations as same-recording validation only. For B, declare a **4.0 s initial-state prefix** before calculating any B error. A's fitted period is about 2.38 s, so this prefix spans more than one period. Prefix points align offset/amplitude/phase only and are excluded from evaluation. Freeze frequency/decay; compare later B error with persistence and constant-velocity baselines. Keep the chosen window and report actual results even if transfer fails.

Do not infer physical dimensions, identical hidden mechanical properties, causation or phone-mount performance. Any further window/model inspection is exploratory.

## Observed transfer result

B returned 600 box and mask-centroid observations in a separate $0.12 tracking call. Its 20 approximate body-center reference annotations have vertical centroid agreement RMSE 8.38603 px and mean offset -4.35779 px. The desired tight tracking-accuracy threshold is not established. The landmarks differ; physical truth is not the SAM output.

Using the declared 4 s window: 121 points align initial state, 479 later observations evaluate the frozen A model. Later RMSE **2.98809903 px**, MAE **2.43546843 px**, maximum **8.49412610 px**. Persistence RMSE **18.64277134 px**; constant-velocity baseline **22.71275561 px**. No dynamics or window were changed to improve this B score. B's separate ordinary fit was inspected only as a diagnostic and is not an input to transfer.

The browser reproduces the same errors and 4.033 s first evaluation timestamp. Browser and Node model IDs can differ when refreezing because tiny floating-point coefficients differ across runtimes; an exported model's ID is preserved, and source-fit verification allows 1e-8 relative/absolute numerical tolerance without changing the hashed artifact.

Public examples include the two licensed excerpts, project observations and frozen source model, with full attribution and saved-run labels. The source project retains the Muse plan and both A tracking run costs. Four new inference requests cost **$0.3693615**. Session totals: **10 inference requests**, **$0.5851035 reported usage**, **$8.40 conservative reservations**. No further paid calls are planned. The ordinary app remains live-off.

This is conditional trajectory validation on publisher-described filmed footage, not a certified physical digital twin, a calibrated metric measurement or an independently authenticated same-setup experiment. These boundaries remain visible in the demo documentation.
