import type { Project } from "./lib/project";
import { MODEL_NAMES, metersPerPixel, type Fit } from "./lib/physics";
import { Icon, fmt } from "./ui";
export function ModelPanel({
  project,
  fits,
  fit,
  update,
  status,
  busy,
  videoUrl,
  onSelect,
  onPlan,
  onApplyPlan,
  onFreeze,
}: {
  project: Project;
  fits: Fit[];
  fit: Fit | null;
  update: (p: Partial<Project>) => void;
  status: { enabled: boolean; configured: boolean };
  busy: boolean;
  videoUrl: string;
  onSelect: (kind: string) => void;
  onPlan: () => void;
  onApplyPlan: () => void;
  onFreeze?: () => void;
}) {
  const scale = metersPerPixel(project.calibration),
    units = project.calibration ? "m" : "px",
    split = fit?.trainCount ?? 0;
  return (
    <aside className="panel model-panel" id="model-panel">
      <div className="panel-header">
        <span className="section-title">Model & validation</span>
        <Icon name="chart" size={17} />
      </div>
      <div className="model-body">
        <label className="field-label" htmlFor="question">
          Research question
        </label>
        <textarea
          disabled={busy}
          id="question"
          maxLength={2000}
          value={project.question}
          onChange={(e) => update({ question: e.target.value })}
        />
        <label className="field-label">
          <input
            type="checkbox"
            checked={project.synthetic}
            disabled={busy}
            aria-describedby="footage-source-help"
            onChange={(e) => update({ synthetic: e.target.checked })}
          />{" "}
          Generated / AI footage
        </label>
        <p className="small-muted" id="footage-source-help">
          Mark rendered or AI-generated clips. Their motion can demonstrate the
          workflow; it does not validate a physical prototype.
        </p>
        <div className="model-controls">
          <label>
            Axis{" "}
            <select
              disabled={busy}
              value={project.axis}
              onChange={(e) => update({ axis: e.target.value as "x" | "y" })}
            >
              <option value="x">Horizontal (x)</option>
              <option value="y">Vertical (y)</option>
            </select>
          </label>
          <label>
            Training{" "}
            <select
              disabled={busy}
              value={project.trainFraction}
              onChange={(e) =>
                update({ trainFraction: Number(e.target.value) })
              }
            >
              <option value="0.6">60%</option>
              <option value="0.7">70%</option>
              <option value="0.8">80%</option>
            </select>
          </label>
        </div>
        <div className="model-list">
          <div className="list-label">
            <span>Candidate model</span>
            <span>Validation RMSE</span>
          </div>
          {fits.length ? (
            fits.map((f, i) => (
              <button
                key={f.kind}
                aria-pressed={fit?.kind === f.kind}
                className={
                  fit?.kind === f.kind ? "model-row chosen" : "model-row"
                }
                onClick={() => {
                  onSelect(f.kind);
                }}
              >
                <span className="radio-dot" />
                <span>
                  {MODEL_NAMES[f.kind]}
                  {i === 0 && <small>Lowest training BIC</small>}
                </span>
                <span className="model-error">
                  {fmt(f.validationRmse, project.calibration ? 4 : 2)}
                  <small>{units}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="empty-fit">
              Add 12 or more observations across time. Models fit locally, with
              no API cost.
            </div>
          )}
        </div>
        {fit && (
          <>
            <div className="fit-result">
              <span>
                Validation error <span className="muted">/ RMSE</span>
              </span>
              <strong>
                {fmt(fit.validationRmse, project.calibration ? 4 : 2)}{" "}
                <small>{units}</small>
              </strong>
              <p>
                {project.points.length - split} later observations withheld from
                coefficient fitting.
              </p>
            </div>
            <dl className="fit-details">
              <div>
                <dt>Training error</dt>
                <dd>
                  {fmt(fit.trainRmse, 4)} {units}
                </dd>
              </div>
              <div>
                <dt>{fit.frequency ? "Fitted period" : "Training samples"}</dt>
                <dd>
                  {fit.frequency ? `${fmt(1 / fit.frequency, 3)} s` : split}
                </dd>
              </div>
              {fit.frequency > 0 && (
                <div>
                  <dt>Damping rate</dt>
                  <dd>{fmt(fit.damping, 3)} s⁻¹</dd>
                </div>
              )}
              <div>
                <dt>Scale</dt>
                <dd>
                  {project.calibration
                    ? `${fmt(scale * 1000, 3)} mm/px`
                    : "Not calibrated"}
                </dd>
              </div>
            </dl>
          </>
        )}
        <button
          className="button secondary full"
          disabled={!fit || busy}
          onClick={onFreeze}
          hidden={!onFreeze}
        >
          Freeze for another recording
        </button>
        <button
          className="button secondary full"
          disabled={busy || !videoUrl || !status.enabled || !status.configured}
          onClick={onPlan}
        >
          <Icon name="spark" />
          Ask Muse for an analysis plan
        </button>
        <p className="small-muted">
          {status.enabled && status.configured
            ? "Paid action · review before running"
            : "Meta is off · configure it in API usage when ready."}
        </p>
        {project.plan && (
          <details className="plan-review">
            <summary>Muse proposal · review required</summary>
            <p>{project.plan.summary}</p>
            <p>
              Suggested: {MODEL_NAMES[project.plan.suggestedModel]},{" "}
              {project.plan.axis} axis.
            </p>
            <ul>
              {[...project.plan.assumptions, ...project.plan.warnings].map(
                (a, i) => (
                  <li key={i}>{a}</li>
                ),
              )}
            </ul>
            <button className="button secondary" onClick={onApplyPlan}>
              Apply proposal
            </button>
          </details>
        )}
      </div>
    </aside>
  );
}
