# TwinLab separate-recording prediction

Source A: Morpheus spring release A

Target B: Morpheus spring release B

Model: Damped oscillation. Frozen model SHA-256: ba504c0a7c56c478659d6bb758114f5b00bfabc21e6fd53e9e27375f7e7ab2d8

Source observations SHA-256: 9356078536f8fe8fd8fd93109dd2292165df5813b8a9c3991311d663ecf15ab4

Target observations SHA-256: 9496100036eb6ff7350b576c7769f9acce53dd99c3fbc38c2eb8aa2503bf5200

Source video SHA-256: 9ccdf8e57f74e13bbc18a5391c4af0086677f92ff7055d82811656efb5434b2b

Target video SHA-256: 7cef956d5758cccd8033e8148e04d97919607f9fc26629a85e0dc20abfc5f4a5

Source generated: false; target generated: false. Generated data is a workflow/numerical demonstration, not physical validation.

Frozen frequency: 0.42015455834159987 Hz; decay: 0.011933174224343677 s^-1; source coefficients: [43.217699012636864,-44.28317388230086,13.91795658674721].

Initial-state alignment uses only the first 4 seconds from B's first observation (121 samples). These samples are excluded from scores. Offset/amplitude/phase (or position/velocity) are aligned; frequency/decay or acceleration are never re-fitted on B. Aligned coefficients: [20.83463019072022,-21.90260269858299,16.176066173542143].

Evaluation starts at 4.033333333333333 s and contains 479 later observations. Repeated window/model inspection is exploratory, not a pristine test.

| Predictor | Later RMSE (px) | Later MAE (px) | Maximum error (px) |
| --- | ---: | ---: | ---: |
| Frozen model | 2.9880990318807 | 2.4354684287151476 | 8.494126097734032 |
| Persistence | 18.64277133526242 | 16.05975753446525 | 35.15109164365015 |
| Constant velocity | 22.71275561118901 | 18.76934141432324 | 44.606796407974315 |

The analyst accepted the same-setup assumption: unchanged object, load, support, camera orientation and geometry. This assumption and distinct hashes do not independently prove those conditions. Axes/units must match; pixel-only transfer requires matching dimensions. Calibration does not remove perspective error. Box centers and mask foreground centroids are geometric landmarks, not centers of mass. A foreground centroid is not necessarily the center of the cylindrical body. These are 1D phenomenological models, not proof of physical causes.

Save the target TwinLab project (including its frozen model), original videos and this report to reproduce evaluation. No Meta calls occur during freezing or evaluation.
