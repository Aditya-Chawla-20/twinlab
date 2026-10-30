# Proposed practical demo: prototype mount vibration

## User and decision
An engineering project team or maker is testing a flexible desktop phone/camera holder. After a small disturbance, how quickly does its visible wobble decay, and does a model fitted to one release predict another release of the same setup?

This is a proposed first use case, not a claim of customer demand or measured accuracy. The pendulum stays as the deterministic numerical regression fixture; the product demo need not be a classroom pendulum.

Settling after an agreed disturbance is an established vibration-control performance criterion. [Newport's vibration-control catalog](https://www.newport.com/medias/sys_master/npresources/he9/h62/9954434613278/CAT-051901%20Vibration%20Control%20Catalog-Final/CAT-051901-Vibration-Control-Catalog-Final.pdf) supports that general engineering motivation, not demand for TwinLab or suitability for industrial diagnosis.

## What the product should help establish
- Reviewed one-dimensional motion of the holder/phone in a fixed view.
- A fitted oscillation frequency and decay rate, plus error on later observations.
- Eventually: freeze dynamics from release A and evaluate a separate release B, using only a declared prefix of B for initial-state alignment. This transfer feature remains unimplemented.
- Eventually: compare prototype iterations using independent measurements. Fitting each design is a descriptive comparison; it does not prove a causal intervention or a general camera-stabilization score.

The current fitter is intended for slow visible motion: its coarse frequency search is capped near 4 Hz and sampling constrains it further. Choose a slow, clearly visible flexible holder for the first demo; do not claim coverage of high-frequency equipment vibration. Rotating bounding boxes, perspective and multiple motion modes can invalidate the one-dimensional approximation.

## AI video prompt — make one clip first
> Create an 8–12 second realistic engineering demonstration, one continuous locked-off shot. Front view of a smartphone in a bright blue case held by a simple flexible desktop phone mount on a solid workbench. The clip begins immediately after a small sideways deflection has been released; no hand is visible. The phone and upper mount wobble gently left and right through several clearly visible cycles, with gradually decreasing movement toward rest. The rigid base and workbench remain stationary. Keep the entire phone and mount visible throughout, against a plain light background with a fixed grid behind the motion. Keep motion approximately in the image plane and the phone's shape consistent. No camera movement, zoom, cuts, slow motion, changing frame rate, added charts, captions or measurement numbers. Use 720p or 1080p MP4 at a constant 30 fps if the generator supports it.

The request is for an illustration, not known physical ground truth. Verify the actual file's timing/rate rather than treating the prompt as encoding metadata. Retain the original generated file and generator/provenance information. Mark **Generated / AI footage** in TwinLab. Begin in pixel units; a ruler or grid invented by an image/video model is not a verified physical length.

Use the first clip to exercise Muse/SAM review and the product narrative. Do not generate multiple clips solely to obtain a favorable fit. Independent AI generations need not share the same dynamics or conserve physical quantities, even if they depict the same mount. A cross-clip fit failure must stay visible.

## Physical validation later
Record the same real mount twice after release, using a stationary camera and a real measured reference in the motion plane. Keep mass, mount, support and camera geometry unchanged. Record at least several visible cycles after the hand leaves; verify constant frame rate and avoid motion blur/occlusion. Independently mark representative positions for tracking-error measurement.

If a later iteration adds a rubber pad, treat it as a separate configuration. Do not refit that run and describe the result as a prediction from the original unchanged model. A real comparison and the frozen-model prediction test answer different questions.

## Current state
The generated-footage declaration is editable and saved in the existing project contract (`synthetic`). It remains independent of whether observations came from SAM or manual CSV entry. Reports and the evidence page retain the generated-input boundary. A supplied AI clip will be workflow evidence only; no physical prototype has been validated yet.

The first user-supplied AI clip has now been inspected and imported locally. See [CLIP-REVIEW.md](CLIP-REVIEW.md) for verified timing, suitability and the untracked project state.

The first bounded Muse/SAM demonstration has completed on the user clip. See CAMERA-MOUNT-RESULTS.md for 240 reviewed observations, actual costs and the visible late-segment model mismatch. Separate-recording prediction and real-camera evidence remain outstanding.
