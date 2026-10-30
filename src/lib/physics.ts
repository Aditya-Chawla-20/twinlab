export type Point = {
  t: number;
  x: number;
  y: number;
  source: "manual" | "sam" | "synthetic";
  objectId?: string;
};
export type Calibration = {
  a: [number, number];
  b: [number, number];
  meters: number;
};
export type ModelKind = "linear" | "quadratic" | "oscillation" | "damped";
export type Fit = {
  kind: ModelKind;
  coefficients: number[];
  frequency: number;
  damping: number;
  origin: number;
  trainCount: number;
  trainRmse: number;
  validationRmse: number;
  bic: number;
  predict: (t: number) => number;
};
export const MODEL_NAMES: Record<ModelKind, string> = {
  linear: "Constant velocity",
  quadratic: "Constant acceleration",
  oscillation: "Ideal oscillation",
  damped: "Damped oscillation",
};
export function metersPerPixel(c: Calibration | null): number {
  if (!c) return 1;
  const pixels = Math.hypot(c.b[0] - c.a[0], c.b[1] - c.a[1]);
  if (!Number.isFinite(c.meters) || c.meters <= 0 || pixels < 2)
    throw new Error(
      "Calibration needs a positive distance and two distinct points.",
    );
  return c.meters / pixels;
}
function solve(a: number[][], b: number[]): number[] | null {
  const n = b.length,
    m = a.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let j = i + 1; j < n; j++)
      if (Math.abs(m[j][i]) > Math.abs(m[pivot][i])) pivot = j;
    [m[i], m[pivot]] = [m[pivot], m[i]];
    if (Math.abs(m[i][i]) < 1e-10) return null;
    const d = m[i][i];
    for (let k = i; k <= n; k++) m[i][k] /= d;
    for (let j = 0; j < n; j++)
      if (j !== i) {
        const f = m[j][i];
        for (let k = i; k <= n; k++) m[j][k] -= f * m[i][k];
      }
  }
  return m.map((row) => row[n]);
}
function basis(t: number, kind: ModelKind, f: number, d: number): number[] {
  if (kind === "linear") return [1, t];
  if (kind === "quadratic") return [1, t, t * t];
  const e = Math.exp(-d * t),
    w = 2 * Math.PI * f * t;
  return [1, e * Math.cos(w), e * Math.sin(w)];
}
const dot = (a: number[], b: number[]) =>
  a.reduce((sum, v, i) => sum + v * b[i], 0);
function regress(
  ts: number[],
  ys: number[],
  kind: ModelKind,
  f: number,
  d: number,
) {
  const rows = ts.map((t) => basis(t, kind, f, d)),
    n = rows[0].length;
  const a = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      rows.reduce((s, r) => s + r[i] * r[j], 0),
    ),
  );
  const b = Array.from({ length: n }, (_, i) =>
    rows.reduce((s, r, k) => s + r[i] * ys[k], 0),
  );
  const c = solve(a, b);
  if (!c) return null;
  return { c, sse: rows.reduce((s, r, i) => s + (dot(r, c) - ys[i]) ** 2, 0) };
}
export function fitModels(
  points: Point[],
  calibration: Calibration | null,
  axis: "x" | "y",
  fraction: number,
): Fit[] {
  if (points.length < 12) return [];
  if (points.length > 2000) throw new Error("Use at most 2,000 observations.");
  if (!(fraction >= 0.5 && fraction <= 0.85))
    throw new Error("Training fraction must be between 50% and 85%.");
  const ps = [...points].sort((a, b) => a.t - b.t);
  if (
    ps.some(
      (p, i) =>
        ![p.t, p.x, p.y].every(Number.isFinite) ||
        p.t < 0 ||
        (i > 0 && p.t <= ps[i - 1].t),
    )
  )
    throw new Error(
      "Observations need finite coordinates and unique increasing timestamps.",
    );
  const scale = metersPerPixel(calibration),
    origin = ps[0].t;
  const ts = ps.map((p) => p.t - origin),
    ys = ps.map((p) => (p[axis] - ps[0][axis]) * scale);
  const split = Math.min(
    ps.length - 3,
    Math.max(8, Math.floor(ps.length * fraction)),
  );
  const trainT = ts.slice(0, split),
    trainY = ys.slice(0, split),
    span = trainT.at(-1)!;
  if (span < 0.1) return [];
  const medianDt = trainT
    .slice(1)
    .map((t, i) => t - trainT[i])
    .sort((a, b) => a - b)[Math.floor((trainT.length - 1) / 2)];
  return (["linear", "quadratic", "oscillation", "damped"] as ModelKind[])
    .flatMap((kind) => {
      let f = 0,
        d = 0,
        best = regress(trainT, trainY, kind, f, d);
      if (kind === "oscillation" || kind === "damped") {
        best = null;
        // ponytail: bounded grid handles <=2k observations; worker/optimizer if measured workloads grow.
        let flo = 0.35 / span,
          fhi = Math.min(4, 0.45 / medianDt),
          dlo = 0,
          dhi = kind === "damped" ? 2 / span : 0;
        for (let pass = 0; pass < 3; pass++) {
          const fs = (fhi - flo) / 90,
            ds = kind === "damped" ? (dhi - dlo) / 12 : 0;
          for (let fi = 0; fi <= 90; fi++)
            for (let di = 0; di <= (kind === "damped" ? 12 : 0); di++) {
              const ff = flo + fi * fs,
                dd = dlo + di * ds,
                r = regress(trainT, trainY, kind, ff, dd);
              if (r && (!best || r.sse < best.sse)) {
                best = r;
                f = ff;
                d = dd;
              }
            }
          flo = Math.max(0.01, f - fs * 2);
          fhi = f + fs * 2;
          dlo = Math.max(0, d - ds * 2);
          dhi = d + ds * 2;
        }
      }
      if (!best) return [];
      const c = best.c,
        predict = (t: number) => dot(basis(t - origin, kind, f, d), c);
      const validationRmse = Math.sqrt(
        ps
          .slice(split)
          .reduce((s, p, i) => s + (predict(p.t) - ys[split + i]) ** 2, 0) /
          (ps.length - split),
      );
      const k = kind === "damped" ? 5 : kind === "oscillation" ? 4 : c.length;
      return [
        {
          kind,
          coefficients: c,
          frequency: f,
          damping: d,
          origin,
          trainCount: split,
          trainRmse: Math.sqrt(best.sse / split),
          validationRmse,
          bic:
            split * Math.log(Math.max(best.sse / split, 1e-18)) +
            k * Math.log(split),
          predict,
        },
      ];
    })
    .sort((a, b) => a.bic - b.bic);
}
export function evaluateFit(
  fit: Fit,
  points: Point[],
  scale: number,
  axis: "x" | "y",
) {
  const base = points[0]?.[axis] ?? 0;
  return points.map((p) => ({
    t: p.t,
    observed: (p[axis] - base) * scale,
    predicted: fit.predict(p.t),
    residual: (p[axis] - base) * scale - fit.predict(p.t),
  }));
}
