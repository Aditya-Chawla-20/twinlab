import { useState } from "react";
import type { Project } from "./lib/project";
import { download } from "./lib/project";
import type { Fit } from "./lib/physics";
import { csv, exportReport } from "./lib/export";
import { Icon, fmt } from "./ui";
export function Evidence({
  project,
  fits,
  fit,
  videoAvailable,
  onImportCsv,
  onViewFrame,
  update,
}: {
  project: Project;
  fits: Fit[];
  fit: Fit | null;
  videoAvailable: boolean;
  onImportCsv: () => void;
  onViewFrame: (time: number) => void;
  update: (p: Partial<Project>) => void;
}) {
  const [page, setPage] = useState(0);
  const split = fit?.trainCount ?? 0;
  return (
    <section className="panel evidence-panel">
      <div className="panel-header">
        <div>
          <span className="section-title">Experiment evidence</span>
          <span className="file-label">Inspect, correct and reproduce</span>
        </div>
        <button
          className="button secondary"
          onClick={() => exportReport(project, fits, fit)}
        >
          <Icon name="download" />
          Export report
        </button>
      </div>
      <div className="evidence-intro">
        <div>
          <h2>Every prediction starts with an observation.</h2>
          <p>
            {project.synthetic
              ? "This project uses generated footage. Observation sources are listed below. This is not evidence of real-world measurement accuracy."
              : "Review each point against the original recording. A model fit does not establish a physical cause."}
          </p>
        </div>
        <dl>
          <div>
            <dt>Source</dt>
            <dd>{project.synthetic ? "Generated footage" : "User-provided"}</dd>
          </div>
          <div>
            <dt>Observations</dt>
            <dd>{project.points.length}</dd>
          </div>
          <div>
            <dt>Meta runs in project</dt>
            <dd>{project.runs.length}</dd>
          </div>
        </dl>
      </div>
      <div className="evidence-actions">
        <button className="button secondary" onClick={onImportCsv}>
          Import t,x,y CSV
        </button>
        <button
          className="button secondary"
          onClick={() =>
            download("observations.csv", csv(project, fit), "text/csv")
          }
        >
          Export observations
        </button>
        <span>
          Import header: <code>t,x,y</code> · seconds and native pixels
        </span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Time (s)</th>
              <th>X (px)</th>
              <th>Y (px)</th>
              <th>Source</th>
              <th>Partition</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {project.points.slice(page * 30, page * 30 + 30).map((p, i) => (
              <tr key={p.t}>
                <td>{fmt(p.t)}</td>
                <td>{fmt(p.x, 2)}</td>
                <td>{fmt(p.y, 2)}</td>
                <td>
                  <span className="badge neutral">{p.source}</span>
                </td>
                <td>
                  {!fit
                    ? "Unfitted"
                    : page * 30 + i < split
                      ? "Training"
                      : "Validation"}
                </td>
                <td>
                  <button
                    className="text-button"
                    disabled={!videoAvailable}
                    onClick={() => {
                      onViewFrame(p.t);
                    }}
                  >
                    View frame
                  </button>
                  <button
                    className="delete-point"
                    aria-label={`Remove observation at ${p.t.toFixed(3)} seconds`}
                    onClick={() =>
                      update({
                        points: project.points.filter((q) => q.t !== p.t),
                      })
                    }
                  >
                    <Icon name="close" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!project.points.length && (
          <div className="chart-empty">
            No observations yet. Mark points on your recording to begin.
          </div>
        )}
      </div>
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page + 1} of{" "}
          {Math.max(1, Math.ceil(project.points.length / 30))}
        </span>
        <button
          disabled={(page + 1) * 30 >= project.points.length}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
      <div className="limitations">
        <h3>What this experiment can establish</h3>
        <p>
          Fits describe one-dimensional motion under a fixed camera. Metric
          results require a reference in the motion plane. Bounding-box centers
          may drift as an object rotates. Missing observations stay missing;
          frame stepping is approximate. Chronological validation tests
          extrapolation within a recording, not transfer to a different
          experiment.
        </p>
      </div>
    </section>
  );
}
