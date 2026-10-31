import type { Fit, Point, Calibration } from "./lib/physics";
import { metersPerPixel, evaluateFit } from "./lib/physics";
export function Chart({
  points,
  fit,
  calibration,
  axis,
  currentTime,
  onSeek,
  residual = false,
  exploration,
  partitionLabel = "Validation",
}: {
  points: Point[];
  fit: Fit | null;
  calibration: Calibration | null;
  axis: "x" | "y";
  currentTime: number;
  onSeek: (t: number) => void;
  residual?: boolean;
  exploration?: (t: number) => number;
  partitionLabel?: string;
}) {
  if (!fit || points.length < 12)
    return (
      <div className="chart-empty">
        Mark at least 12 observations across the clip to compare models.
      </div>
    );
  const data = evaluateFit(fit, points, metersPerPixel(calibration), axis),
    width = 1000,
    height = 190,
    pad = { l: 62, r: 22, t: 20, b: 30 };
  const start = data[0].t,
    end = data.at(-1)!.t,
    split = fit.trainCount,
    holdout = points[split].t;
  const all = data.flatMap((d) =>
      residual
        ? [d.residual]
        : [d.observed, d.predicted, ...(exploration ? [exploration(d.t)] : [])],
    ),
    lo = Math.min(0, ...all),
    hi = Math.max(0, ...all),
    margin = Math.max((hi - lo) * 0.1, 0.001);
  const ymin = lo - margin,
    ymax = hi + margin,
    x = (t: number) =>
      pad.l + ((t - start) / (end - start)) * (width - pad.l - pad.r),
    y = (v: number) =>
      height - pad.b - ((v - ymin) / (ymax - ymin)) * (height - pad.t - pad.b);
  const path = (fn: (d: (typeof data)[number]) => number) =>
    data
      .map(
        (d, i) => `${i ? "L" : "M"}${x(d.t).toFixed(2)},${y(fn(d)).toFixed(2)}`,
      )
      .join(" ");
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${residual ? "Prediction residual" : "Observed and predicted displacement"} over time. ${partitionLabel} begins at ${holdout.toFixed(2)} seconds.`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onSeek(
          Math.max(
            start,
            Math.min(
              end,
              start +
                ((((e.clientX - r.left) / r.width) * width - pad.l) /
                  (width - pad.l - pad.r)) *
                  (end - start),
            ),
          ),
        );
      }}
    >
      <rect
        x={x(holdout)}
        y={pad.t}
        width={width - pad.r - x(holdout)}
        height={height - pad.t - pad.b}
        fill="#f0f3fb"
      />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => {
        const val = ymin + (ymax - ymin) * v;
        return (
          <g key={v}>
            <line
              x1={pad.l}
              x2={width - pad.r}
              y1={y(val)}
              y2={y(val)}
              stroke="#e4e8ed"
            />
            <text x={pad.l - 12} y={y(val) + 4} textAnchor="end">
              {val.toFixed(calibration ? 2 : 0)}
            </text>
          </g>
        );
      })}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => {
        const t = start + (end - start) * v;
        return (
          <g key={v}>
            <text x={x(t)} y={height - 7} textAnchor="middle">
              {t.toFixed(1)} s
            </text>
          </g>
        );
      })}
      <line
        x1={x(holdout)}
        x2={x(holdout)}
        y1={pad.t}
        y2={height - pad.b}
        stroke="#b5bfda"
        strokeDasharray="4 5"
      />
      <text x={x(holdout) + 10} y={pad.t + 12} className="plot-note">
        {partitionLabel.toUpperCase()}
      </text>
      {residual ? (
        <path
          d={path((d) => d.residual)}
          fill="none"
          stroke="#2357e9"
          strokeWidth="2"
        />
      ) : (
        <>
          <path
            d={path((d) => d.observed)}
            fill="none"
            stroke="#2357e9"
            strokeWidth="2"
          />
          <path
            d={path((d) => d.predicted)}
            fill="none"
            stroke="#b67520"
            strokeWidth="2"
            strokeDasharray="7 4"
          />
          {exploration && (
            <path
              d={path((d) => exploration(d.t))}
              fill="none"
              stroke="#8454c0"
              strokeWidth="2"
              strokeDasharray="2 4"
            />
          )}
        </>
      )}
      <line
        x1={x(Math.max(start, Math.min(end, currentTime)))}
        x2={x(Math.max(start, Math.min(end, currentTime)))}
        y1={pad.t}
        y2={height - pad.b}
        stroke="#243146"
        opacity=".45"
      />
    </svg>
  );
}
