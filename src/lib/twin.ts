import { alignInitialState, fitModels, metersPerPixel, MODEL_NAMES, type Fit, type ModelParameters } from "./physics";
import { measurementSnapshot, parseFrozenTwin, parseProject, type FrozenTwin, type MeasurementSnapshot, type Project } from "./project";

export async function sha256(data: string | ArrayBuffer) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (v) => v.toString(16).padStart(2, "0")).join("");
}
function parameters(f: ModelParameters): ModelParameters {
  return { kind: f.kind, coefficients: [...f.coefficients], frequency: f.frequency,
    damping: f.damping, origin: f.origin, trainCount: f.trainCount };
}
function payload(t: FrozenTwin) {
  return JSON.stringify({ version: 1, type: "twinlab-model", source: t.source, parameters: t.parameters });
}
function reproduce(t: FrozenTwin) {
  const s = t.source;
  const fit = fitModels(s.points, s.calibration, s.axis, s.trainFraction)
    .find((f) => f.kind === t.parameters.kind);
  const close = (a: number, b: number) => Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(a), Math.abs(b));
  const m = t.parameters;
  if (!fit || fit.trainCount !== m.trainCount || !close(fit.origin, m.origin) ||
    !close(fit.frequency, m.frequency) || !close(fit.damping, m.damping) ||
    !fit.coefficients.every((c, i) => close(c, m.coefficients[i])))
    throw new Error("Frozen parameters do not reproduce from their source observations.");
}
export async function freezeTwin(project: Project, fit: Fit): Promise<FrozenTwin> {
  const source = measurementSnapshot(parseProject(project));
  const twin: FrozenTwin = { version: 1, type: "twinlab-model", id: "0".repeat(64), source,
    parameters: parameters(fit) };
  reproduce(twin);
  twin.id = await sha256(payload(twin));
  return twin;
}
export async function verifyTwin(raw: unknown) {
  const twin = parseFrozenTwin(raw);
  if (await sha256(payload(twin)) !== twin.id)
    throw new Error("Frozen model digest does not match. Re-export the original model.");
  reproduce(twin);
  return twin;
}
function observationIdentity(p: MeasurementSnapshot) {
  return JSON.stringify(p.points.map(({ t, x, y }) => [t, x, y]));
}
type Metrics = { rmse: number; mae: number; maxError: number };
function errors(values: number[]): Metrics {
  return { rmse: Math.sqrt(values.reduce((s, e) => s + e * e, 0) / values.length),
    mae: values.reduce((s, e) => s + Math.abs(e), 0) / values.length,
    maxError: Math.max(...values.map(Math.abs)) };
}
export type TransferResult = Awaited<ReturnType<typeof evaluateTransfer>>;
export async function evaluateTransfer(raw: FrozenTwin, target: Project, initialSeconds: number, sameSetup: boolean) {
  const twin = await verifyTwin(raw), project = parseProject(target), s = twin.source, m = twin.parameters;
  if (!sameSetup) throw new Error("Confirm unchanged object, load, support, camera orientation and geometry before evaluating.");
  if (s.axis !== project.axis) throw new Error("Source and target axes must match.");
  if (!!s.calibration !== !!project.calibration) throw new Error("Source and target must use the same units. Calibrate both recordings or use pixels for both.");
  if (!s.calibration && (s.media.width !== project.media.width || s.media.height !== project.media.height))
    throw new Error("Pixel-only transfer requires matching video dimensions and camera setup.");
  if (s.media.sha256 && s.media.sha256 === project.media.sha256)
    throw new Error("Choose a separate recording. Source and target video hashes match.");
  const [sourceHash, targetHash] = await Promise.all([
    sha256(observationIdentity(s)), sha256(observationIdentity(project)),
  ]);
  if (sourceHash === targetHash) throw new Error("Choose independent target observations; this is the source data.");
  if (!Number.isFinite(initialSeconds) || initialSeconds < 0.01 || initialSeconds > 3600)
    throw new Error("Choose a finite initial-state window in seconds.");
  const points = project.points, origin = points[0]?.t ?? 0;
  const count = points.filter((p) => p.t - origin <= initialSeconds).length;
  if (count < 8 || points.length - count < 8)
    throw new Error("Use at least eight initial-state observations and eight later evaluation observations.");
  const prefix = points.slice(0, count), span = prefix.at(-1)!.t - origin;
  if (m.frequency > 0 && span < 1 / m.frequency)
    throw new Error(`Initial-state window must span at least one frozen period (${(1 / m.frequency).toFixed(3)} s).`);
  const intervals = prefix.slice(1).map((p, i) => p.t - prefix[i].t).sort((a, b) => a - b);
  if (m.frequency > 0.45 / intervals[Math.floor(intervals.length / 2)])
    throw new Error("Initial-state sampling is too slow for the frozen frequency.");
  const aligned = alignInitialState(m, prefix, project.calibration, project.axis);
  const scale = metersPerPixel(project.calibration), base = points[0][project.axis];
  const persistence = (prefix.at(-1)![project.axis] - base) * scale;
  const rows = points.map((p, i) => {
    const observed = (p[project.axis] - base) * scale, predicted = aligned.predict(p.t);
    return { t: p.t, observed, predicted, residual: observed - predicted,
      persistence, constantVelocity: aligned.constantVelocity(p.t),
      partition: i < count ? "initial-state" : "evaluation", source: p.source };
  });
  const later = rows.slice(count);
  const metrics = errors(later.map((r) => r.residual));
  const initialRmse = errors(rows.slice(0, count).map((r) => r.residual)).rmse;
  const fit: Fit = { ...m, origin, coefficients: aligned.coefficients, trainCount: count,
    trainRmse: initialRmse, validationRmse: metrics.rmse, bic: 0, predict: aligned.predict };
  return { twin, sourceHash, targetHash, initialSeconds, count, rows, fit, metrics,
    baselines: { persistence: errors(later.map((r) => r.observed - r.persistence)),
      constantVelocity: errors(later.map((r) => r.observed - r.constantVelocity)) } };
}
export function transferCsv(result: TransferResult) {
  return ["time_s,observed,predicted,residual,persistence,constant_velocity,partition,source",
    ...result.rows.map((r) => [r.t, r.observed, r.predicted, r.residual, r.persistence,
      r.constantVelocity, r.partition, r.source].join(","))].join("\n");
}
export function transferReport(r: TransferResult, target: Project) {
  const units = target.calibration ? "m" : "px", m = r.twin.parameters;
  return `# TwinLab separate-recording prediction\n\nSource A: ${r.twin.source.name}\n\nTarget B: ${target.name}\n\nModel: ${MODEL_NAMES[m.kind]}. Frozen model SHA-256: ${r.twin.id}\n\nSource observations SHA-256: ${r.sourceHash}\n\nTarget observations SHA-256: ${r.targetHash}\n\nSource video SHA-256: ${r.twin.source.media.sha256 ?? "not recorded"}\n\nTarget video SHA-256: ${target.media.sha256 ?? "not recorded"}\n\nSource generated: ${r.twin.source.synthetic}; target generated: ${target.synthetic}. Generated data is a workflow/numerical demonstration, not physical validation.\n\nFrozen frequency: ${m.frequency} Hz; decay: ${m.damping} s^-1; source coefficients: ${JSON.stringify(m.coefficients)}.\n\nInitial-state alignment uses only the first ${r.initialSeconds} seconds from B's first observation (${r.count} samples). These samples are excluded from scores. Offset/amplitude/phase (or position/velocity) are aligned; frequency/decay or acceleration are never re-fitted on B. Aligned coefficients: ${JSON.stringify(r.fit.coefficients)}.\n\nEvaluation starts at ${r.rows[r.count].t} s and contains ${r.rows.length - r.count} later observations. Repeated window/model inspection is exploratory, not a pristine test.\n\n| Predictor | Later RMSE (${units}) | Later MAE (${units}) | Maximum error (${units}) |\n| --- | ---: | ---: | ---: |\n${[["Frozen model", r.metrics], ["Persistence", r.baselines.persistence], ["Constant velocity", r.baselines.constantVelocity]].map(([name, metrics]) => { const v = metrics as Metrics; return `| ${name} | ${v.rmse} | ${v.mae} | ${v.maxError} |`; }).join("\n")}\n\nUser declared unchanged object, load, support, camera orientation and geometry. This declaration and distinct hashes do not independently prove those conditions. Axes/units must match; pixel-only transfer requires matching dimensions. Calibration does not remove perspective error. Bounding-box centers are not centers of mass. These are 1D phenomenological models, not proof of physical causes.\n\nSave the target TwinLab project (including its frozen model), original videos and this report to reproduce evaluation. No Meta calls occur during freezing or evaluation.\n`;
}
