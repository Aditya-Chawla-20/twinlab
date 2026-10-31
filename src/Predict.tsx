import { useEffect, useState } from "react";
import { Chart } from "./Chart";
import { Icon, fmt } from "./ui";
import { MODEL_NAMES } from "./lib/physics";
import { download, type Project } from "./lib/project";
import {
  evaluateTransfer,
  transferCsv,
  transferReport,
  type TransferResult,
} from "./lib/twin";

export function Predict({
  project,
  update,
  onExperiment,
  onImportModel,
  onTarget,
  onExample,
  onRealExample,
}: {
  project: Project;
  update: (patch: Partial<Project>) => void;
  onExperiment: () => void;
  onImportModel: () => void;
  onTarget: () => void;
  onExample: () => void;
  onRealExample: () => void;
}) {
  const c = project.comparison;
  const [windowText, setWindowText] = useState(String(c?.initialSeconds ?? 2));
  const [evaluation, setEvaluation] = useState<{
    input: Project;
    result: TransferResult;
  } | null>(null);
  const [issue, setIssue] = useState<{
    input: Project;
    message: string;
  } | null>(null);
  const [evaluating, setEvaluating] = useState(false),
    [residual, setResidual] = useState(false);
  useEffect(
    () => setWindowText(String(c?.initialSeconds ?? 2)),
    [c?.initialSeconds, c?.twin.id],
  );
  // Results belong to the exact immutable input object. Edits hide stale results immediately.
  const validWindow =
    windowText.trim() !== "" &&
    Number.isFinite(Number(windowText)) &&
    Number(windowText) >= 0.01 &&
    Number(windowText) <= 3600;
  const result =
    validWindow &&
    Number(windowText) === c?.initialSeconds &&
    evaluation?.input === project
      ? evaluation.result
      : null;
  const error = issue?.input === project ? issue.message : "";
  async function evaluate() {
    if (!c || !validWindow || evaluating) return;
    const input = project;
    setEvaluating(true);
    setIssue(null);
    try {
      const r = await evaluateTransfer(
        c.twin,
        input,
        Number(windowText),
        c.sameSetup,
      );
      setEvaluation({ input, result: r });
    } catch (e) {
      setIssue({
        input,
        message:
          e instanceof Error ? e.message : "Prediction evaluation failed.",
      });
    } finally {
      setEvaluating(false);
    }
  }
  if (!c)
    return (
      <section className="panel">
        <div className="panel-header">
          <span className="section-title">Predict on another recording</span>
          <Icon name="chart" />
        </div>
        <div className="settings-body">
          <h2>Learn from A. Put it to the test on B.</h2>
          <p>
            Choose a fitted model in Experiment and freeze it. Open independent
            target observations, declare an initial-state window, then score the
            later motion. Frequency/decay or acceleration stay fixed.
          </p>
          <div className="prediction-actions">
            <button className="button primary" onClick={onRealExample}>
              Try recorded real footage
            </button>
            <button className="button primary" onClick={onExperiment}>
              Choose a model in Experiment
            </button>
            <button className="button secondary" onClick={onImportModel}>
              Import frozen model
            </button>
            <button className="button secondary" onClick={onExample}>
              Try generated prediction
            </button>
          </div>
          <p>
            The generated example contains two numerical releases; B has no
            recorded video. No API calls or physical-accuracy claims.
          </p>
        </div>
      </section>
    );
  const { twin } = c,
    m = twin.parameters,
    units = project.calibration ? "m" : "px";
  const sourceUnits = twin.source.calibration ? "m" : "px";
  const settings = (patch: Partial<NonNullable<Project["comparison"]>>) =>
    update({ comparison: { ...c, ...patch } });
  return (
    <div className="prediction">
      <div className="prediction-intro">
        <div>
          <h2>Predict: A → B</h2>
          <p>
            Frozen dynamics from one recording. Initial state from the next.
            Later observations provide the test.
          </p>
        </div>
        <div className="prediction-actions">
          <button className="button secondary" onClick={onRealExample}>
            Load real A/B
          </button>
          <button className="button secondary" onClick={onExample}>
            Load generated example
          </button>
        </div>
      </div>
      <div className="prediction-grid">
        <section className="panel">
          <div className="panel-header">
            <span className="section-title">Source · frozen model from A</span>
            <span className="badge neutral">Frozen</span>
          </div>
          <div className="settings-body">
            <h3>{twin.source.name}</h3>
            <dl className="fit-details">
              <div>
                <dt>Model family</dt>
                <dd>{MODEL_NAMES[m.kind]}</dd>
              </div>
              <div>
                <dt>Units / axis</dt>
                <dd>
                  {sourceUnits} / {twin.source.axis}
                </dd>
              </div>
              <div>
                <dt>Frequency</dt>
                <dd>
                  {m.frequency
                    ? `${fmt(m.frequency, 5)} Hz`
                    : "Not an oscillator"}
                </dd>
              </div>
              <div>
                <dt>Decay rate</dt>
                <dd>{fmt(m.damping, 5)} s⁻¹</dd>
              </div>
              <div>
                <dt>Source training samples</dt>
                <dd>{m.trainCount}</dd>
              </div>
              <div>
                <dt>Source declaration</dt>
                <dd>
                  {twin.source.synthetic
                    ? "Generated / AI"
                    : "Recording / observations"}
                </dd>
              </div>
            </dl>
            <details>
              <summary>Model identity · {twin.id.slice(0, 16)}</summary>
              <p className="prediction-id">SHA-256: {twin.id}</p>
              <p>
                Source coefficients: {JSON.stringify(m.coefficients)}. The
                source snapshot is embedded in the model.
              </p>
            </details>
            <div className="prediction-actions">
              <button
                className="button secondary"
                onClick={() =>
                  download("model.twinlab.json", JSON.stringify(twin, null, 2))
                }
              >
                <Icon name="download" />
                Export model
              </button>
              <button className="button secondary" onClick={onImportModel}>
                Replace model
              </button>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <span className="section-title">Target · observations from B</span>
            <Icon name="folder" />
          </div>
          <div className="settings-body">
            <h3>{project.name}</h3>
            <dl className="fit-details">
              <div>
                <dt>Observations</dt>
                <dd>{project.points.length}</dd>
              </div>
              <div>
                <dt>Units / axis</dt>
                <dd>
                  {units} / {project.axis}
                </dd>
              </div>
              <div>
                <dt>Recording</dt>
                <dd>{project.media.name || "No video linked"}</dd>
              </div>
              <div>
                <dt>Time span</dt>
                <dd>{fmt(project.media.duration, 2)} s</dd>
              </div>
            </dl>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={project.synthetic}
                onChange={(e) => update({ synthetic: e.target.checked })}
              />
              Generated / AI target footage or data
            </label>
            {project.synthetic && (
              <p>
                Generated data demonstrates the workflow; it cannot validate a
                physical prototype.
              </p>
            )}
            <div className="prediction-actions">
              <button className="button secondary" onClick={onTarget}>
                <Icon name="folder" />
                Open target project
              </button>
              <button className="button secondary" onClick={onExperiment}>
                Review target observations
              </button>
            </div>
            <p>
              Import a separate project's observations, or use Import video and
              collect B in Experiment. The frozen model stays attached while
              working in Predict.
            </p>
          </div>
        </section>
      </div>
      <section className="panel prediction-setup">
        <div className="panel-header">
          <span className="section-title">Prediction settings</span>
          <span className="badge neutral">Local · no API cost</span>
        </div>
        <div className="prediction-setup-body">
          <label>
            Initial-state window (seconds)
            <input
              type="number"
              min="0.01"
              max="3600"
              step="any"
              value={windowText}
              aria-invalid={!validWindow}
              onChange={(e) => {
                setWindowText(e.target.value);
                const n = Number(e.target.value);
                if (n >= 0.01 && n <= 3600 && n !== c.initialSeconds)
                  settings({ initialSeconds: n });
              }}
              onBlur={() => {
                if (!validWindow) setWindowText(String(c.initialSeconds));
              }}
            />
            <small>
              From B's first observation; excluded from scores. At least 8
              points and one oscillation period.
            </small>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={c.sameSetup}
              onChange={(e) => settings({ sameSetup: e.target.checked })}
            />
            Use the same-setup assumption: unchanged object, load, support,
            camera orientation and geometry.
          </label>
          <button
            className="button primary"
            disabled={
              !c.sameSetup ||
              !validWindow ||
              evaluating ||
              project.points.length < 16
            }
            onClick={() => void evaluate()}
          >
            {evaluating ? "Evaluating…" : "Evaluate prediction"}
          </button>
        </div>
      </section>
      {error && (
        <div className="message error" role="alert">
          <Icon name="info" />
          <span>{error}</span>
        </div>
      )}
      {result ? (
        <>
          <section className="panel chart-panel">
            <div className="panel-header">
              <span className="section-title">Motion comparison · {units}</span>
              <div className="plot-legend">
                <span>
                  <i className="blue-line" />
                  Observed B
                </span>
                <span>
                  <i className="amber-line" />
                  Frozen prediction
                </span>
                <label>
                  <input
                    type="checkbox"
                    checked={residual}
                    onChange={(e) => setResidual(e.target.checked)}
                  />
                  Residuals
                </label>
              </div>
            </div>
            <Chart
              points={project.points}
              fit={result.fit}
              calibration={project.calibration}
              axis={project.axis}
              currentTime={project.points[0]?.t ?? 0}
              onSeek={() => {}}
              residual={residual}
              partitionLabel="Evaluation"
            />
            <div className="chart-footer">
              <span>
                <i className="validation-swatch" />
                Shaded: {result.rows.length - result.count} later evaluation
                observations. First {result.count} points align initial state
                only.
              </span>
            </div>
          </section>
          <div className="prediction-grid prediction-results">
            <section className="panel">
              <div className="panel-header">
                <span className="section-title">Later prediction error</span>
              </div>
              <div className="settings-body">
                <div className="fit-result">
                  <span>Evaluation RMSE</span>
                  <strong>
                    {fmt(result.metrics.rmse, units === "m" ? 6 : 3)}{" "}
                    <small>{units}</small>
                  </strong>
                  <p>
                    {result.rows.length - result.count} observations after{" "}
                    {fmt(result.rows[result.count].t, 3)} s.
                  </p>
                </div>
                <dl className="fit-details">
                  <div>
                    <dt>Mean absolute error</dt>
                    <dd>
                      {fmt(result.metrics.mae, 5)} {units}
                    </dd>
                  </div>
                  <div>
                    <dt>Maximum error</dt>
                    <dd>
                      {fmt(result.metrics.maxError, 5)} {units}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
            <section className="panel">
              <div className="panel-header">
                <span className="section-title">Compare simple baselines</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Predictor</th>
                      <th>Later RMSE ({units})</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Frozen model</td>
                      <td>{fmt(result.metrics.rmse, 5)}</td>
                    </tr>
                    <tr>
                      <td>Persistence</td>
                      <td>{fmt(result.baselines.persistence.rmse, 5)}</td>
                    </tr>
                    <tr>
                      <td>Constant velocity</td>
                      <td>{fmt(result.baselines.constantVelocity.rmse, 5)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="settings-body">
                <p>
                  Both baselines use only the initial-state prefix. A frozen fit
                  can perform worse; the comparison reports that result.
                </p>
              </div>
            </section>
          </div>
          <div className="prediction-actions">
            <button
              className="button primary"
              onClick={() =>
                download(
                  "prediction-report.md",
                  transferReport(result, project),
                  "text/markdown",
                )
              }
            >
              <Icon name="download" />
              Export prediction report
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download("prediction.csv", transferCsv(result), "text/csv")
              }
            >
              Export prediction CSV
            </button>
          </div>
        </>
      ) : (
        <div className="panel chart-empty">
          Open independent B observations and evaluate. No result is shown
          before evaluation, or after its inputs change.
        </div>
      )}
      <section className="limitations">
        <h3>What this test establishes</h3>
        <p>
          No dynamics are refitted on B. The initial-state prefix sets
          position/velocity or amplitude/phase/offset only. Camera perspective,
          rotation and tracking bias can still invalidate a 1D model. Distinct
          hashes and setup declarations do not prove recording independence.
          Repeatedly changing the model/window after inspecting scores makes the
          test exploratory. Save the target project to retain the frozen model
          and settings.
        </p>
      </section>
    </div>
  );
}
