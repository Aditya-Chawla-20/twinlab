import type { Project } from "./lib/project";
import { download } from "./lib/project";
import { usd, type Run } from "./lib/meta";
import { Icon } from "./ui";
export function Usage({
  staticDemo = false,
  project,
  update,
  status,
  runs,
  target,
  setTarget,
}: {
  staticDemo?: boolean;
  project: Project;
  update: (p: Partial<Project>) => void;
  status: { enabled: boolean; configured: boolean };
  runs: Run[];
  target: string;
  setTarget: (s: string) => void;
}) {
  const total = runs.reduce((s, r) => s + (r.estimatedUsd ?? 0), 0),
    unknown = runs.filter((r) => r.estimatedUsd === null).length;
  return (
    <div className="usage-layout">
      <section className="panel">
        <div className="panel-header">
          <span className="section-title">Meta connection</span>
          <span className="badge neutral">
            {status.enabled && status.configured ? "Live enabled" : "Live off"}
          </span>
        </div>
        <div className="settings-body">
          <h2>
            {staticDemo
              ? "This demo has no paid backend."
              : "You control every paid run."}
          </h2>
          <p>
            {staticDemo
              ? "Analysis runs in your browser. To use Muse or SAM on your own footage, run the public repository locally using the steps below. Reopened Meta run records are historical; this demo makes no inference requests."
              : "Keys stay on the local server. Planning and tracking run separately, only after your confirmation. No automatic retries or background inference."}
          </p>
          <ol>
            <li>
              Copy <code>.env.example</code> to <code>.env.local</code>.
            </li>
            <li>
              Set <code>MODEL_API_KEY</code> and{" "}
              <code>META_LIVE_ENABLED=true</code>.
            </li>
            <li>
              Restart with <code>npm run dev</code>, then reload this page.
            </li>
          </ol>
          <div className="connection-details">
            <span>
              Key configured <strong>{status.configured ? "Yes" : "No"}</strong>
            </span>
            <span>
              Live calls enabled{" "}
              <strong>{status.enabled ? "Yes" : "No"}</strong>
            </span>
          </div>
          <label>
            Tracking target
            <input
              maxLength={120}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. blue ball"
            />
          </label>
          <label>
            Video frame rate (fps)
            <input
              type="number"
              min="1"
              max="60"
              step="0.001"
              value={project.media.fps}
              onChange={(e) =>
                update({
                  media: {
                    ...project.media,
                    fps: Number(e.target.value) || 30,
                    cfrConfirmed: false,
                  },
                })
              }
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={project.media.cfrConfirmed}
              onChange={(e) =>
                update({
                  media: {
                    ...project.media,
                    cfrConfirmed: e.target.checked,
                  },
                })
              }
            />
            I verified this is a constant-frame-rate video at the fps above.
          </label>
          <p className="small-muted">
            Frame rate cannot be inferred reliably from browser metadata.
            Convert variable-frame-rate footage before SAM tracking.
          </p>
          <a
            className="external-link"
            href="https://dev.meta.ai/docs/pricing-rate-limits"
            target="_blank"
            rel="noreferrer"
          >
            Meta pricing & billing documentation <Icon name="arrow" size={15} />
          </a>
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <span className="section-title">Usage ledger</span>
          <span className="badge neutral">
            {staticDemo ? "No server ledger" : "This local server"}
          </span>
        </div>
        <div className="ledger-total">
          <span>Recorded estimated cost</span>
          <strong>{usd(total)}</strong>
          <p>
            {runs.length} requests · {unknown} with unknown cost. Billing
            dashboard is authoritative.
          </p>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Stage / model</th>
                <th>Status</th>
                <th>Estimated cost</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>
                      {r.stage === "plan" ? "Analysis plan" : "Object tracking"}
                    </strong>
                    <small>{r.model}</small>
                    <small>{new Date(r.at).toLocaleString()}</small>
                    {r.note && <small>{r.note}</small>}
                    <details>
                      <summary>Usage details</summary>
                      <pre>{JSON.stringify(r.usage, null, 2)}</pre>
                    </details>
                  </td>
                  <td>{r.status}</td>
                  <td>{usd(r.estimatedUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!runs.length && (
            <div className="ledger-empty">
              <Icon name="chart" size={28} />
              <strong>No Meta requests yet.</strong>
              <p>
                Exploring the sample, fitting models and exporting data do not
                call Meta.
              </p>
            </div>
          )}
        </div>
        <div className="ledger-footer">
          <button
            className="text-button"
            onClick={() =>
              download("meta-usage.json", JSON.stringify(runs, null, 2))
            }
          >
            Export usage ledger <Icon name="download" size={14} />
          </button>
          <p>
            Rates recorded October 30, 2026. Estimates include reported tokens
            or frames; unknown costs are not treated as free.
          </p>
        </div>
      </section>
    </div>
  );
}
