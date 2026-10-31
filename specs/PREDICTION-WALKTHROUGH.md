# Reproduce a frozen prediction

## Browser, without credentials

1. Open TwinLab → Predict → Try recorded real footage (or Load real A/B).
2. Review source A’s frozen dynamics and B’s 600 recorded SAM centroid observations. These are two MIT-licensed filmed Morpheus spring excerpts, not a new inference run.
3. Keep the declared 4 s initial-state window. Read and accept the same-setup assumption if appropriate; hidden capture conditions and metric scale are not verified.
4. Evaluate prediction. The first 121 points align initial state; 479 later points are scored. RMSE is 2.98810 px, persistence 18.64277 px and constant velocity 22.71276 px.
5. Inspect residuals, export model/CSV/report and Save project. Reload recovers the comparison/settings, but results must be evaluated again. Bundled video relinks automatically; personal videos require relinking their original bytes.

These errors are against SAM observations, not independently established physical truth. See REAL-FOOTAGE-VALIDATION.md for annotation disagreement and assumptions.

## Your own A/B recordings

Analyze A, review its landmark/scale, select a candidate and click Freeze for another recording. In Predict open B’s project, or import/measure B while retaining the frozen comparison. Match axis and units; for pixels keep source geometry. For meters calibrate both recordings using a verified reference in the motion plane. Keep object, mass, support and camera conditions unchanged. Declare the initial-state interval before viewing scores; it needs at least eight points, one full source period for oscillators and eight later points. Only initial state is aligned, never B’s dynamics.

## CLI

```sh
npm run predict -- --source public/examples/beam-A.twinlab.json --target public/examples/beam-B.twinlab.json --model damped --initial-seconds 4 --same-setup --out artifacts/real-prediction-001
```

No Meta call occurs. Output includes a frozen model, target project, CSV partitions and Markdown scores/hashes. Existing output files are not overwritten; use a fresh directory. The setup flag is an analyst assumption, not an automated verification.

For the original generated numerical regression:

```sh
npm run predict -- --source public/examples/transfer-A.json --target public/examples/transfer-B.json --model damped --initial-seconds 2 --same-setup --out artifacts/generated-prediction-001
```

Generated B has no recorded video. Its 0.000402406 m error is a numerical fixture result, not a physical measurement. Repeatedly selecting models/windows after looking at scores makes either workflow exploratory. Digests identify input bytes and detect changes; they do not authenticate an author or experiment.
