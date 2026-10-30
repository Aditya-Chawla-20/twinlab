# Camera-mount clip intake — 2026-10-30

The user supplied `gemini_generated_video_fad646de.mp4` from Downloads and identified it as AI-generated. This review checks input suitability and the local project workflow; it does not verify a physical prototype.

| Property | Checked value |
| --- | --- |
| SHA-256 | `2fd1647d4a8c424b1e7b8317df93b23ae7ac2d5b2c7fc3e89945d8320074119d` |
| Encoding | H.264, yuv420p |
| Dimensions | 1280 × 720 |
| Video duration | 10.000000 s |
| Container/browser duration | 10.026667 s, including the trailing container duration |
| Size | 2,570,626 bytes, about 2.45 MiB |
| Frames | 240 decoded frames |
| Rate | 24 fps, not the 30 fps requested in the generation prompt |
| Timestamp verification | All 239 frame intervals within 0.000000667 s of 1/24 s |
| Scale | Uncalibrated; pixel units only |
| Tracking target | `phone` |
| New Meta requests | 0 |

## Visual screening
An eight-frame contact sheet and browser playback show the phone and upper mount moving while the base remains on the desk. This is a usable candidate for the proposed workflow demo. The phone rotates, so a SAM bounding-box center will be an approximate landmark. The grid is generated imagery, not a verified reference dimension. No settling time, damping accuracy or physical material property has been measured.

## Local preparation and verification
- Imported the original Downloads MP4 in Chrome and verified playback advances.
- Named the project Camera mount — AI demo; set Generated / AI footage, horizontal axis, 24 fps and confirmed constant frame rate using decoded timestamp evidence.
- Set the target to phone and left calibration null. No guessed meter scale or invented points were added.
- Fixed target persistence: it previously lived only in App state and did not survive save/reopen. It now lives in the portable project, is bounded to 120 characters at import, and is applied together with a reviewed Muse proposal.
- Legacy projects are accepted. Only the known bundled sample gets the old blue-ball default; other legacy imports get a blank target requiring an explicit choice.
- Saved through the app into Downloads, reopened that download and confirmed phone / 24 fps / generated source survive; relinked the original MP4 successfully. This confirms the actual browser roundtrip, not just JSON serialization.
- Artifacts and screenshot are private ignored files under artifacts/camera-mount. The original video remains in Downloads; no media file or frame image is published in this repository.

At intake the prepared project contained zero observations and no Meta runs. The subsequent bounded demonstration now has 240 SAM observations and two Meta runs; see [CAMERA-MOUNT-RESULTS.md](CAMERA-MOUNT-RESULTS.md).

## Test-runner extension (subsequently completed)
At intake the capped live-test runner accepted only the bundled pendulum. Selected-file support has since been implemented and checked with decoded frame-time checks and the same size/duration/frame/output limits. Preserve the existing non-refundable reservations and cumulative $10 ceiling. Do not substitute this clip under the bundled filename or use the unbudgeted UI endpoint for agent testing. The bounded pair and visual review have now completed; results and limitations are recorded separately.

The normal app remains live-off. No additional paid calls were made during intake; the local usage ledger remains four requests / $0.161266.

## Browser access boundary
Chrome successfully read the original video and projects downloaded by the app from Downloads. Reading a project under Documents still returned a file-permission error. The user was shown the extension's documented file-URL access setting; no protected file was moved to work around that denial. The older saved SAM project's GUI review remains pending that access.

The later native Open workflow successfully selected the reviewed project under Documents. Automated file-chooser selection and native picker access are distinct; no extension setting change is claimed. The analyzed-results GUI gate is now verified for the camera-mount clip.
