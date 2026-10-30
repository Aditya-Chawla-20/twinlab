# TwinLab run-cost estimate — checked 2026-10-30

## Scope and current implementation
One complete paid run means one Muse Spark 1.3 experiment-plan request and one SAM 3.1 tracking request on the same clip, without retries or repeated target prompts. Current code uses Standard mode (`muse-spark-1.3`), low reasoning effort and a 4,000-output-token cap. Each stage uploads a file, performs inference and attempts deletion. Local calibration, numerical fitting, plots, simulation sliders and exports incur no Meta API charges.

No provider call, token-count request, credential inspection or paid test was performed for this estimate. It is not a measured bill.

## Verified official prices
Source: https://dev.meta.ai/docs/pricing-rate-limits

| Model / billing unit | Standard price |
| --- | ---: |
| Muse Spark 1.3 uncached input | $1.25 / 1,000,000 tokens |
| Muse Spark 1.3 cached input | $0.15 / 1,000,000 tokens |
| Muse Spark 1.3 output, including reasoning | $4.25 / 1,000,000 tokens |
| SAM 3.1 video segmentation | $0.20 / 1,000 processed frames |

SAM bills a minimum of 50 frames per video request. Use reported `usage.video_frames_processed` for post-run accounting, rather than assuming the estimate was the invoice.

## Formula
`SAM_USD = max(50, billed_frames) × 0.20 / 1000`

`SPARK_USD = (uncached_input × 1.25 + cached_input × 0.15 + output × 4.25) / 1000000`

`TOTAL_USD = SAM_USD + SPARK_USD`

No hosted search or extra model is requested by the current application. These are API estimates, not a quotation for taxes, currency conversion, public hosting or other account charges.

## Current 12-second / 30-fps sample
Expected SAM frames: 12 × 30 = 360. Frame-based estimate: **$0.072**.

Muse input/output usage is unknown until measured. The following are explicit scenarios, not predictions of this clip's token count:

| Spark uncached input | Spark output (includes reasoning) | Spark estimate | SAM estimate | Combined estimate |
| ---: | ---: | ---: | ---: | ---: |
| 10,000 | 1,000 | $0.01675 | $0.072 | **$0.08875** |
| 10,000 | 4,000 (app cap) | $0.02950 | $0.072 | **$0.10150** |
| 50,000 | 4,000 (app cap) | $0.07950 | $0.072 | **$0.15150** |
| 100,000 | 4,000 (app cap) | $0.14200 | $0.072 | **$0.21400** |

Working example: approximately **9 US cents** for one sample-sized combined run at the 10k-input / 1k-output assumption. This is not a guaranteed final cost or a hard spending cap. At that same assumed usage, 100 combined runs would cost $8.875 before other charges.

## Video length sensitivity — SAM only, one request
| Video duration | Confirmed fps | Expected frames | SAM estimate |
| ---: | ---: | ---: | ---: |
| 10 seconds | 30 | 300 | $0.060 |
| 12 seconds | 30 | 360 | $0.072 |
| 20 seconds | 30 | 600 | $0.120 |
| 30 seconds | 30 | 900 | $0.180 |
| 30 seconds | 60 | 1,800 | $0.360 |

Add the actual Spark token cost to each row. Do not assume Spark token usage stays constant as duration, resolution or audio changes. One SAM response can contain multiple objects; extra SAM requests/target prompts, not simply selecting another returned object, add request costs.

## Contributor mode (optional, not enabled)
Official rate: input $0.10/M, output $0.20/M, cached input $0.002/M. With 10,000 uncached input / 1,000 output tokens, Spark would cost $0.0012; combined with the sample's SAM estimate, $0.0732. Contributor mode permits Meta to use submitted content to train models. Current code remains on Standard mode; changing mode requires an explicit product decision and estimator changes.

## Why an exact total cannot be promised before a run
Meta's token-counting documentation says its preflight endpoint counts rendered context and does not provide final generation billing usage. Multimodal preprocessing varies; there is no portable fixed token count for our video. The authoritative billing inputs are actual response usage and the account's billing record. Output length and failed/repeated requests can change charges.

Sources:
- https://dev.meta.ai/docs/token-counting
- https://dev.meta.ai/docs/pricing-rate-limits
- Local implementation: server/meta.ts and src/lib/meta.ts
