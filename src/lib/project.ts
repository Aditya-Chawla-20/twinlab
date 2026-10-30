import type { Calibration, Point, ModelParameters } from "./physics";
import type { Plan, Run } from "./meta";
export type Project = {
  version: 1;
  name: string;
  question: string;
  trackingTarget: string;
  media: {
    name: string;
    width: number;
    height: number;
    duration: number;
    fps: number;
    cfrConfirmed: boolean;
    sha256?: string;
  };
  points: Point[];
  calibration: Calibration | null;
  axis: "x" | "y";
  trainFraction: number;
  synthetic: boolean;
  plan?: Plan;
  runs: Run[];
  comparison?: { twin: FrozenTwin; initialSeconds: number; sameSetup: boolean };
};
export type MeasurementSnapshot = Pick<Project,
  "name" | "media" | "points" | "calibration" | "axis" | "trainFraction" | "synthetic"
>;
export type FrozenTwin = {
  version: 1;
  type: "twinlab-model";
  id: string;
  source: MeasurementSnapshot;
  parameters: ModelParameters;
};
export function sampleProject(): Project {
  return {
    version: 1,
    name: "Pendulum study",
    question:
      "Does a damped model predict the unseen motion better than an ideal oscillator?",
    trackingTarget: "blue ball",
    media: {
      name: "pendulum-synthetic.mp4",
      width: 960,
      height: 540,
      duration: 12,
      fps: 30,
      cfrConfirmed: true,
    },
    points: Array.from({ length: 181 }, (_, i) => {
      const t = i / 15,
        x = 480 + 180 * Math.exp(-0.09 * t) * Math.cos(3.6 * t + 0.2);
      return {
        t,
        x: x + 0.65 * Math.sin(t * 17),
        y: 70 + Math.sqrt(335 ** 2 - (x - 480) ** 2),
        source: "synthetic" as const,
      };
    }),
    calibration: { a: [100, 475], b: [400, 475], meters: 0.5 },
    axis: "x",
    trainFraction: 0.7,
    synthetic: true,
    runs: [],
  };
}
export function emptyProject(): Project {
  return {
    ...sampleProject(),
    name: "Untitled experiment",
    question: "What explains the motion in this experiment?",
    trackingTarget: "",
    points: [],
    calibration: null,
    synthetic: false,
    media: {
      name: "",
      width: 960,
      height: 540,
      duration: 0,
      fps: 30,
      cfrConfirmed: false,
    },
  };
}
const finite = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
export function parseProject(raw: unknown): Project {
  const p = raw as Project;
  if (
    !p ||
    p.version !== 1 ||
    typeof p.name !== "string" ||
    p.name.length > 120 ||
    typeof p.question !== "string" ||
    p.question.length > 2000 ||
    (p.trackingTarget !== undefined &&
      (typeof p.trackingTarget !== "string" || p.trackingTarget.length > 120)) ||
    typeof p.synthetic !== "boolean" ||
    !p.media ||
    typeof p.media.name !== "string" ||
    p.media.name.length > 255 ||
    !finite(p.media.width, 1, 8192) ||
    !finite(p.media.height, 1, 8192) ||
    !finite(p.media.duration, 0, 3600) ||
    !finite(p.media.fps, 1, 240) ||
    typeof p.media.cfrConfirmed !== "boolean" ||
    (p.media.sha256 !== undefined && !/^[a-f0-9]{64}$/.test(p.media.sha256)) ||
    !["x", "y"].includes(p.axis) ||
    !finite(p.trainFraction, 0.5, 0.85) ||
    !Array.isArray(p.points) ||
    p.points.length > 2000 ||
    !Array.isArray(p.runs) ||
    p.runs.length > 1000
  )
    throw new Error("This is not a supported TwinLab project.");
  if (
    p.points.some(
      (q) =>
        !q ||
        !finite(q.t, 0, p.media.duration + 0.05) ||
        !finite(q.x, 0, p.media.width) ||
        !finite(q.y, 0, p.media.height) ||
        !["manual", "sam", "synthetic"].includes(q.source) ||
        (q.objectId !== undefined && (typeof q.objectId !== "string" || q.objectId.length > 120)),
    )
  )
    throw new Error("Project contains invalid observations.");
  const points = [...p.points].sort((a, b) => a.t - b.t);
  if (points.some((q, i) => i > 0 && q.t <= points[i - 1].t))
    throw new Error("Project has duplicate observation timestamps.");
  if (
    p.calibration !== null &&
    (typeof p.calibration !== "object" || !p.calibration)
  )
    throw new Error("Project calibration must be an object or null.");
  if (
    p.calibration &&
    (!Array.isArray(p.calibration.a) ||
      !Array.isArray(p.calibration.b) ||
      p.calibration.a.length !== 2 ||
      p.calibration.b.length !== 2 ||
      ![p.calibration.a, p.calibration.b].every(
        (q) =>
          finite(q[0], 0, p.media.width) && finite(q[1], 0, p.media.height),
      ) ||
      !finite(p.calibration.meters, 0.000001, 100000) ||
      Math.hypot(
        p.calibration.b[0] - p.calibration.a[0],
        p.calibration.b[1] - p.calibration.a[1],
      ) < 2)
  )
    throw new Error("Project calibration is invalid.");
  if (
    p.runs.some(
      (r) =>
        !r ||
        typeof r.id !== "string" ||
        typeof r.at !== "string" ||
        (r.note !== undefined && typeof r.note !== "string") ||
        !["plan", "track"].includes(r.stage) ||
        typeof r.model !== "string" ||
        !["completed", "failed"].includes(r.status) ||
        !r.usage ||
        (r.estimatedUsd !== null && !finite(r.estimatedUsd, 0, 100000)),
    )
  )
    throw new Error("Project usage records are invalid.");
  if (
    p.plan &&
    (!["x", "y"].includes(p.plan.axis) ||
      !["linear", "quadratic", "oscillation", "damped"].includes(
        p.plan.suggestedModel,
      ) ||
      typeof p.plan.summary !== "string" ||
      typeof p.plan.target !== "string" ||
      !Array.isArray(p.plan.assumptions) ||
      !Array.isArray(p.plan.warnings) ||
      ![...p.plan.assumptions, ...p.plan.warnings].every(
        (v) => typeof v === "string",
      ))
  )
    throw new Error("Project plan is invalid.");
  if (p.comparison !== undefined && (!p.comparison ||
    !finite(p.comparison.initialSeconds, 0.01, 3600) ||
    typeof p.comparison.sameSetup !== "boolean"
  )) throw new Error("Prediction settings are invalid.");
  return {
    ...p,
    points,
    trackingTarget:
      p.trackingTarget ??
      (p.synthetic && p.media.name === "pendulum-synthetic.mp4" ? "blue ball" : ""),
    ...(p.comparison ? { comparison: { ...p.comparison, twin: parseFrozenTwin(p.comparison.twin) } } : {}),
  };
}

// Construct known fields in a stable order before hashing; discard untrusted extras.
export function measurementSnapshot(p: MeasurementSnapshot): MeasurementSnapshot {
  return {
    name: p.name,
    media: { name: p.media.name, width: p.media.width, height: p.media.height,
      duration: p.media.duration, fps: p.media.fps, cfrConfirmed: p.media.cfrConfirmed,
      ...(p.media.sha256 ? { sha256: p.media.sha256 } : {}) },
    points: p.points.map((q) => ({ t: q.t, x: q.x, y: q.y, source: q.source,
      ...(q.objectId !== undefined ? { objectId: q.objectId } : {}) })),
    calibration: p.calibration ? { a: [...p.calibration.a], b: [...p.calibration.b], meters: p.calibration.meters } : null,
    axis: p.axis, trainFraction: p.trainFraction, synthetic: p.synthetic,
  };
}
export function parseFrozenTwin(raw: unknown): FrozenTwin {
  const t = raw as FrozenTwin, m = t?.parameters;
  if (!t || t.version !== 1 || t.type !== "twinlab-model" ||
    typeof t.id !== "string" || !/^[a-f0-9]{64}$/.test(t.id) || !t.source || !m ||
    !["linear", "quadratic", "oscillation", "damped"].includes(m.kind) ||
    !Array.isArray(m.coefficients) || m.coefficients.length !== (m.kind === "linear" ? 2 : 3) ||
    !m.coefficients.every((c) => finite(c, -1e12, 1e12)) ||
    !finite(m.frequency, 0, 120) || !finite(m.damping, 0, 100) ||
    !finite(m.origin, 0, 3600) || !Number.isInteger(m.trainCount) ||
    !finite(m.trainCount, 8, 1997)) throw new Error("This is not a supported frozen TwinLab model.");
  const s = t.source;
  // Explicit fields bound nesting: a frozen source cannot contain another comparison.
  const p = parseProject({ version: 1, name: s.name, question: "", trackingTarget: "",
    media: s.media, points: s.points, calibration: s.calibration, axis: s.axis,
    trainFraction: s.trainFraction, synthetic: s.synthetic, runs: [] });
  if (p.points.length < m.trainCount + 3) throw new Error("Frozen source has insufficient observations.");
  return { version: 1, type: "twinlab-model", id: t.id, source: measurementSnapshot(p),
    parameters: { kind: m.kind, coefficients: [...m.coefficients], frequency: m.frequency,
      damping: m.damping, origin: m.origin, trainCount: m.trainCount } };
}
export function download(
  name: string,
  data: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
