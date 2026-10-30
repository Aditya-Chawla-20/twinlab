# User-run Meta validation and costs

Initially all integration checks used fake transport. The user later authorized agent testing under a $10 ceiling: live Muse/SAM tests on the generated sample completed for $0.161266 based on reported usage. See AGENT-TESTING.md. Real-video accuracy and final billing still need independent verification.

## Start locally
1. Install Node 22.9+ and run `npm ci`.
2. Run `cp .env.example .env.local` and edit that file locally. Do not paste a key into chat.
3. Put your key in `MODEL_API_KEY`; keep `META_LIVE_ENABLED=false` while exploring.
4. Run `npm run dev`, open http://127.0.0.1:5173, and use the sample / manual workflow.

## First paid test
1. Confirm your available credits in Meta Billing and record the starting balance.
2. Change `META_LIVE_ENABLED=true` in `.env.local` and restart the server. Environment edits require restart.
3. Use a fixed-camera 5–10 second MP4, below 30 MB. Keep a known-length reference in the motion plane.
4. In API usage enter the exact fps and confirm it is constant. Browser metadata alone cannot verify fps. If necessary transcode with ffmpeg: `ffmpeg -i input.mov -vf fps=30 -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart output.mp4`. Keep output.mp4 as the source of all subsequent observations; this creates a new sampled recording.
5. Click Ask Muse for an analysis plan, inspect the cost review, and explicitly confirm. Review the returned proposal before applying its axis, model and target.
6. Click Track with SAM. The review shows a frame-based estimate. Explicitly confirm. Choose a single returned object ID and apply only that track. Inspect its positions against the video and remove unreliable observations in Evidence.
7. Open API usage: inspect reported tokens/frames, status, timestamp and estimated cost; export the ledger. Check the actual Meta billing update independently. A failed run can still be billed.
8. Add manual landmark observations as an independent accuracy baseline. Compare point error and downstream validation error. Synthetic tests are not a substitute.
9. Save project JSON, CSV and the Markdown report, and retain the original video. The JSON does not embed video.
10. Turn live mode off and restart when done.

## Published rate snapshot — 2026-10-30
- Muse Spark Standard: uncached input $1.25/M, cached input $0.15/M, output $4.25/M. Output includes reasoning tokens. Plan output capped at 4,000 tokens; video input tokens are unknown before the request.
- SAM: $0.20/1,000 processed video frames, minimum 50 frames per request.
- Example only: 300 SAM frames = $0.06; 10,000 uncached Spark input + 1,000 output = $0.01675. Combined = $0.07675, not a measured TwinLab run.
- Missing usage yields **Unknown**, never $0. On transport failure, inspect billing before retrying. No SDK retries.
- One user action uploads the clip, performs one inference, and attempts provider file deletion. Cleanup failure is visible in the run note. Remove remaining files through Meta if needed.

## Local-only deployment boundary
The server binds to 127.0.0.1, checks Host and Origin and requires an explicit action header and confirmation. Do not expose it through a public tunnel or change the bind address without authentication, per-user credentials and budgets. No hosted deployment is included.
