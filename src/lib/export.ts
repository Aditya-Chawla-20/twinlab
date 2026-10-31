import type { Project } from "./project";
import { download } from "./project";
import { metersPerPixel, MODEL_NAMES, type Fit } from "./physics";
import { usd } from "./meta";
const fmt = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : "—");
export function csv(project: Project, fit: Fit | null) {
  const scale = metersPerPixel(project.calibration),
    base = project.points[0]?.[project.axis] ?? 0,
    split = fit?.trainCount ?? 0;
  return [
    "time_s,x_px,y_px,displacement_" +
      (project.calibration ? "m" : "px") +
      ",prediction,residual,partition,source,landmark",
    ...project.points.map((p, i) => {
      const y = (p[project.axis] - base) * scale,
        pred = fit?.predict(p.t);
      return [
        p.t,
        p.x,
        p.y,
        y,
        pred ?? "",
        pred === undefined ? "" : y - pred,
        !fit ? "unfitted" : i < split ? "training" : "validation",
        p.source,
        p.measurement ??
          (p.source === "sam" ? "box-center" : "user-or-generated-point"),
      ].join(",");
    }),
  ].join("\n");
}
export function reportMarkdown(project: Project, fits: Fit[], fit: Fit | null) {
  const scale = metersPerPixel(project.calibration),
    units = project.calibration ? "m" : "px";
  const details = fits
    .map(
      (f) =>
        `| ${MODEL_NAMES[f.kind]} | ${fmt(f.trainRmse, 5)} | ${fmt(f.validationRmse, 5)} | ${fmt(f.bic, 1)} |`,
    )
    .join("\n");
  const report = `# TwinLab experiment: ${project.name}\n\n${project.question}\n\nSource: ${project.synthetic ? "SYNTHETIC / AI-GENERATED footage, not a real-world measurement" : "User-provided recording / observations"}.\n\nVideo: ${project.media.name}; ${project.media.width} × ${project.media.height}; ${project.media.duration} s.\n\nCalibration: ${project.calibration ? `${project.calibration.meters} m across ${fmt((1 / scale) * project.calibration.meters, 1)} pixels` : "Not calibrated; pixel units only"}. Axis: ${project.axis}. ${project.points.length} observations.\n\n${fit ? `Fit on the first ${fit.trainCount} observations (${Math.round(project.trainFraction * 100)}% requested); ${project.points.length - fit.trainCount} later observations used for chronological validation. Small datasets retain at least eight training and three validation observations. Ranking uses training BIC only.` : "No model fitted; observations have not been designated as training or validation."}\n\n| Model | Training RMSE (${units}) | Validation RMSE (${units}) | Training BIC |\n| --- | ---: | ---: | ---: |\n${details}\n\nSelected: ${fit ? MODEL_NAMES[fit.kind] : "No fit"}.\n\n## Limitations\nStationary camera and planar motion required. Camera perspective, occlusion, timing errors and calibration uncertainty affect results. These are 1D trajectory fits, not proof of physical causality. Validation observations are not used to fit coefficients. Repeated model inspection is not a pristine final test. Exploratory slider changes are not verified interventions.\n\n## Meta provenance\n${project.runs.length ? project.runs.map((r) => `${r.at}: ${r.model}, ${r.status}, estimate ${usd(r.estimatedUsd)}; ${r.note ?? ""}`).join("\n") : "No Meta run is recorded for this project."}\n\n## Reproduction\nSave the TwinLab project JSON and retain the original video. Relink that video after reopening. Observation CSV contains data and predictions.\n`;
  const landmarks = [
    ...new Set(
      project.points
        .filter((p) => p.source === "sam")
        .map((p) => p.measurement ?? "box-center"),
    ),
  ];
  return (
    report +
    `\n## Source identity and landmarks\nVideo SHA-256: ${project.media.sha256 ?? "not recorded"}.\n\nSAM landmark conventions: ${landmarks.join(", ") || "No SAM observations"}. Geometric landmarks are not centers of mass. A mask centroid may include hook/spring foreground; it is not automatically the cylindrical body center.\n`
  );
}
export function exportReport(project: Project, fits: Fit[], fit: Fit | null) {
  download(
    "twinlab-report.md",
    reportMarkdown(project, fits, fit),
    "text/markdown",
  );
}
