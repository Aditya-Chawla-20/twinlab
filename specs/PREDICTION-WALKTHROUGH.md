# Reproduce a frozen-model prediction

This command-line workflow is implemented. The browser prediction screen is pending the required design-tool sign-in. Existing video observation, calibration and export controls are unchanged.

1. Analyze recording A in TwinLab, review its observations and save the project JSON.
2. Analyze a separate recording B of the same setup and save its JSON. Keep object, support, mass, camera and geometry unchanged. Match the analysis axis and units; calibrate each recording if using meters. A second AI generation can demonstrate the workflow but cannot validate a physical system.
3. Choose an initial-state interval before examining evaluation results. It must contain at least eight observations and, for an oscillator, one complete frozen period. Keep at least eight later observations for scoring.
4. Run from the repository:

```sh
npm run predict -- --source /absolute/path/A.twinlab.json --target /absolute/path/B.twinlab.json --model damped --initial-seconds 2 --same-setup --out artifacts/prediction-001
```

Omit `--model` to use A's lowest-training-BIC candidate. `--same-setup` is an explicit declaration, not an automated verification. No Meta call occurs. Existing evidence files are never overwritten; use a fresh output directory for each evaluation.

Outputs: a portable frozen model, target project with embedded model/settings, CSV with excluded prefix versus later evaluation, and Markdown with hashes, model parameters, assumptions and errors against two simple baselines. Frequency/decay or acceleration are frozen from A; only B's initial state is aligned. Repeatedly choosing the window/model after seeing scores makes the result exploratory.

Integrity digests detect changes and identify inputs; they do not prove the experiments were independently recorded or that an author is trusted. Distinct hashes and generated fixtures are not physical validation.

## Credential-free numerical example

```sh
npm run predict -- --source public/examples/transfer-A.json --target public/examples/transfer-B.json --model damped --initial-seconds 2 --same-setup --out artifacts/prediction-example
```

These original, generated point arrays share frequency 3.6 radians/s and decay 0.09/s, with different amplitudes and phases. A also includes a small deterministic disturbance. B is a numerical fixture with no corresponding recorded video. Both projects remain explicitly synthetic. This checks transfer mathematics; it does not demonstrate physical transfer or a second real recording.
