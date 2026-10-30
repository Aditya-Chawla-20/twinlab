import { Icon, fmt } from "./ui";
import { csv } from "./lib/export";
import { Evidence } from "./Evidence";
import { Usage } from "./Usage";
import { ModelPanel } from "./ModelPanel";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { Chart } from "./Chart";
import { fitModels, metersPerPixel, type Point } from "./lib/physics";
import {
  sampleProject,
  emptyProject,
  parseProject,
  download,
  type Project,
} from "./lib/project";
import { usd, type Plan, type Run } from "./lib/meta";

const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong.";
export default function App() {
  const [project, setProject] = useState<Project>(sampleProject),
    [view, setView] = useState("Experiment");
  const [videoUrl, setVideoUrl] = useState("/pendulum-synthetic.mp4"),
    [file, setFile] = useState<File | null>(null),
    [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<"view" | "calibrate" | "mark">("view"),
    [calPoints, setCalPoints] = useState<[number, number][]>([]),
    [distance, setDistance] = useState("0.5");
  const [selected, setSelected] = useState<string>("auto"),
    [residual, setResidual] = useState(false),
    [explore, setExplore] = useState(false),
    [frequencyFactor, setFrequencyFactor] = useState(1),
    [dampingDelta, setDampingDelta] = useState(0);
  const [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [status, setStatus] = useState({ configured: false, enabled: false }),
    [runs, setRuns] = useState<Run[]>([]);
  const [dialog, setDialog] = useState<"plan" | "track" | null>(null),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false);
  const [keyboardX, setKeyboardX] = useState("480"),
    [keyboardY, setKeyboardY] = useState("300");
  const [tracks, setTracks] = useState<{ objectId: string; points: Point[] }[]>(
      [],
    ),
    [trackId, setTrackId] = useState("");
  const video = useRef<HTMLVideoElement>(null),
    videoInput = useRef<HTMLInputElement>(null),
    projectInput = useRef<HTMLInputElement>(null),
    csvInput = useRef<HTMLInputElement>(null),
    epoch = useRef(0),
    busyRef = useRef(false),
    dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    void Promise.all([
      fetch("/api/status").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ])
      .then(([s, u]) => {
        setStatus(s);
        if (u.error) throw new Error(u.error);
        if (Array.isArray(u.runs)) setRuns(u.runs);
      })
      .catch(() =>
        setError(
          "Local API or usage ledger unavailable. Check the server before any paid run.",
        ),
      );
  }, []);
  useEffect(
    () => () => {
      if (videoUrl.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl],
  );
  useEffect(() => {
    if (dialog) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [dialog]);
  const fits = useMemo(() => {
    try {
      return fitModels(
        project.points,
        project.calibration,
        project.axis,
        project.trainFraction,
      );
    } catch {
      return [];
    }
  }, [
    project.points,
    project.calibration,
    project.axis,
    project.trainFraction,
  ]);
  const fit = fits.find((f) => f.kind === selected) ?? fits[0] ?? null,
    units = project.calibration ? "m" : "px",
    scale = metersPerPixel(project.calibration);
  const total = runs.reduce((s, r) => s + (r.estimatedUsd ?? 0), 0);
  const exploration = useMemo(() => {
    if (!fit || !explore || !["oscillation", "damped"].includes(fit.kind))
      return undefined;
    return (t: number) => {
      const u = t - fit.origin,
        w = 2 * Math.PI * fit.frequency * frequencyFactor * u;
      return (
        fit.coefficients[0] +
        Math.exp(-Math.max(0, fit.damping + dampingDelta) * u) *
          (fit.coefficients[1] * Math.cos(w) +
            fit.coefficients[2] * Math.sin(w))
      );
    };
  }, [fit, explore, frequencyFactor, dampingDelta]);
  const nearest = project.points.length
    ? project.points.reduce((a, p) =>
        Math.abs(p.t - time) < Math.abs(a.t - time) ? p : a,
      )
    : null;
  function update(p: Partial<Project>) {
    if (busyRef.current) return;
    setProject((current) => ({ ...current, ...p }));
  }
  function seek(t: number) {
    if (video.current)
      video.current.currentTime = Math.max(
        0,
        Math.min(project.media.duration, t),
      );
    setTime(t);
  }
  function replace(next: Project, url = "", nextFile: File | null = null) {
    epoch.current++;
    setProject(next);
    setVideoUrl(url);
    setFile(nextFile);
    setTime(0);
    setPlaying(false);
    setMode("view");
    setCalPoints([]);
    setTracks([]);
    setSelected("auto");
    setExplore(false);
    setError("");
    setNotice("");
  }
  async function importVideo(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || busyRef.current) return;
    const id = ++epoch.current;
    setError("");
    if (!f.type.startsWith("video/") || f.size > 100 * 1024 * 1024) {
      setError(
        "Choose a supported video under 100 MB. Paid Meta runs accept up to 30 MB.",
      );
      return;
    }
    const url = URL.createObjectURL(f),
      probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = url;
    try {
      await new Promise<void>((ok, no) => {
        const timer = setTimeout(
          () =>
            no(
              new Error(
                "Video metadata timed out. Try an MP4 with H.264 video.",
              ),
            ),
          10000,
        );
        probe.onloadedmetadata = () => {
          clearTimeout(timer);
          ok();
        };
        probe.onerror = () => {
          clearTimeout(timer);
          no(
            new Error(
              "This browser could not read the video. Try MP4 / H.264.",
            ),
          );
        };
      });
      if (id !== epoch.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (
        !Number.isFinite(probe.duration) ||
        probe.duration <= 0 ||
        probe.duration > 3600 ||
        probe.videoWidth > 8192 ||
        probe.videoHeight > 8192
      )
        throw new Error("Use a finite video up to one hour and 8K dimensions.");
      const relink =
        !videoUrl &&
        project.media.name === f.name &&
        project.media.width === probe.videoWidth &&
        project.media.height === probe.videoHeight &&
        Math.abs(project.media.duration - probe.duration) < 0.1;
      const next = relink
        ? project
        : {
            ...emptyProject(),
            name: f.name.replace(/\.[^.]+$/, ""),
            media: {
              name: f.name,
              width: probe.videoWidth,
              height: probe.videoHeight,
              duration: probe.duration,
              fps: 30,
              cfrConfirmed: false,
            },
          };
      replace(next, url, f);
      setNotice(
        relink
          ? "Video relinked. Confirm this is the original source recording."
          : "Video stays on this device until you confirm a Meta run. Calibrate a known distance to begin.",
      );
    } catch (e) {
      URL.revokeObjectURL(url);
      if (id === epoch.current) setError(errorText(e));
    } finally {
      probe.removeAttribute("src");
      probe.load();
    }
  }
  async function importProject(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || busyRef.current) return;
    const id = ++epoch.current;
    try {
      if (f.size > 3 * 1024 * 1024)
        throw new Error("Project file exceeds 3 MB.");
      const p = parseProject(JSON.parse(await f.text()));
      if (id !== epoch.current) return;
      replace(
        p,
        p.synthetic && p.media.name === "pendulum-synthetic.mp4"
          ? "/pendulum-synthetic.mp4"
          : "",
      );
      setNotice(
        "Project opened. Relink the original video if it is not shown. Imported usage is historical; the API ledger shows this server’s runs.",
      );
    } catch (e) {
      if (id === epoch.current) setError(errorText(e));
    }
  }
  async function importCsv(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || busyRef.current) return;
    const id = epoch.current;
    try {
      if (f.size > 500000) throw new Error("Observation CSV exceeds 500 KB.");
      const rows = (await f.text()).trim().split(/\r?\n/);
      if (rows.shift()?.split(",").slice(0, 3).join(",") !== "t,x,y")
        throw new Error(
          "CSV needs the header t,x,y (seconds and native video pixels).",
        );
      const points = rows.map((row) => {
        const values = row.split(",");
        if (values.length !== 3 || values.some((v) => !v.trim()))
          throw new Error("Each CSV row needs three numeric values: t,x,y.");
        const [t, x, y] = values.map(Number);
        return { t, x, y, source: "manual" as const };
      });
      const parsed = parseProject({ ...project, points });
      if (id !== epoch.current) return;
      update({ points: parsed.points });
      setSelected("auto");
      setNotice(
        "Imported observations are user-provided; inspect them against the video.",
      );
    } catch (e) {
      if (id === epoch.current) setError(errorText(e));
    }
  }
  function mark(e: MouseEvent<SVGSVGElement>) {
    if (mode === "view" || busy) return;
    video.current?.pause();
    const r = e.currentTarget.getBoundingClientRect(),
      p: [number, number] = [
        ((e.clientX - r.left) / r.width) * project.media.width,
        ((e.clientY - r.top) / r.height) * project.media.height,
      ];
    if (mode === "calibrate") {
      const next = [...calPoints, p];
      setCalPoints(next);
      if (next.length === 2) {
        const meters = Number(distance);
        if (
          !Number.isFinite(meters) ||
          meters < 0.000001 ||
          meters > 100000 ||
          Math.hypot(next[1][0] - next[0][0], next[1][1] - next[0][1]) < 2
        ) {
          setError(
            "Use a positive reference length and two distinct endpoints.",
          );
          setCalPoints([]);
          return;
        }
        update({ calibration: { a: next[0], b: next[1], meters } });
        setMode("view");
        setNotice(
          "Scale calibrated. Mark the same physical point across the recording.",
        );
      }
    } else {
      addObservation(p);
    }
  }
  function addObservation(p: [number, number]) {
    if (busyRef.current) return;
    const t = video.current?.currentTime ?? time;
    try {
      const points = [
        ...project.points.filter((q) => Math.abs(q.t - t) > 0.0001),
        { t, x: p[0], y: p[1], source: "manual" as const },
      ].sort((a, b) => a.t - b.t);
      const validated = parseProject({ ...project, points });
      update({ points: validated.points });
      setNotice(
        `Observation at ${t.toFixed(3)} s saved. Step forward to mark another.`,
      );
    } catch (e) {
      setError(errorText(e));
    }
  }

  function openPaid(stage: "plan" | "track") {
    setError("");
    setConsent(false);
    setDialog(stage);
  }
  async function executePaid() {
    const stage = dialog;
    if (!stage || !consent || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setDialog(null);
    setError("");
    const id = epoch.current;
    try {
      let f = file;
      if (!f && videoUrl === "/pendulum-synthetic.mp4") {
        const response = await fetch(videoUrl);
        f = new File([await response.blob()], "pendulum-synthetic.mp4", {
          type: "video/mp4",
        });
      }
      if (!f) throw new Error("Relink the original video before running Meta.");
      const form = new FormData();
      form.set("file", f);
      form.set("stage", stage);
      form.set("question", project.question);
      form.set("target", project.trackingTarget ?? "");
      form.set("fps", String(project.media.fps));
      form.set("duration", String(project.media.duration));
      form.set("cfrConfirmed", String(project.media.cfrConfirmed));
      form.set("confirmation", "RUN_PAID_META_REQUEST");
      const response = await fetch("/api/meta", {
        method: "POST",
        headers: { "X-TwinLab-Action": "manual-paid-run" },
        body: form,
      });
      const result = await response.json();
      if (id !== epoch.current) return;
      if (result.run) {
        setRuns((r) => [
          ...r.filter((x) => x.id !== result.run.id),
          result.run,
        ]);
        setProject((p) => ({ ...p, runs: [...p.runs, result.run] }));
      }
      if (!response.ok || result.error)
        throw new Error(
          result.error ?? "Meta request failed. Check billing before retrying.",
        );
      if (stage === "plan") {
        setProject((p) => ({ ...p, plan: result.plan as Plan }));
        setNotice(
          "Muse plan ready for review. No settings or observations have changed.",
        );
      } else {
        setTracks(result.tracks);
        setTrackId(result.tracks[0]?.objectId ?? "");
        setNotice(
          result.tracks.length
            ? "SAM tracks ready. Select one object and review it before applying."
            : "SAM completed with no matching objects. No observations changed.",
        );
      }
    } catch (e) {
      if (id === epoch.current) setError(errorText(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const stageNumber = !project.media.name
    ? 1
    : !project.calibration
      ? 1
      : project.points.length < 12
        ? 2
        : 3;
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="TwinLab home">
          <span className="brand-mark">
            <Icon name="chart" size={22} />
          </span>
          TwinLab<span className="brand-note">EXPERIMENTAL WORKBENCH</span>
        </a>
        <div className="top-right">
          <span className="local-status">
            <i /> Local workspace
          </span>
          <button onClick={() => setView("API usage")} className="usage-chip">
            {usd(total)} <span>API usage</span>
          </button>
        </div>
      </header>
      <div className="workspace-bar">
        <nav aria-label="Workspace">
          {["Experiment", "Evidence", "API usage"].map((v) => (
            <button
              key={v}
              className={view === v ? "nav-item active" : "nav-item"}
              onClick={() => setView(v)}
            >
              <Icon
                name={
                  v === "Experiment"
                    ? "folder"
                    : v === "Evidence"
                      ? "table"
                      : "chart"
                }
              />
              {v}
            </button>
          ))}
        </nav>
        <div className="workspace-actions">
          <button
            className="quiet"
            disabled={busy}
            onClick={() => projectInput.current?.click()}
          >
            <Icon name="folder" />
            Open project
          </button>
          <button
            className="quiet"
            onClick={() =>
              download(
                "experiment.twinlab.json",
                JSON.stringify(project, null, 2),
              )
            }
          >
            <Icon name="download" />
            Save project
          </button>
        </div>
      </div>
      <main>
        <h1 className="sr-only">{project.name} — experiment workbench</h1>
        <div className="page-heading">
          <div>
            <div className="breadcrumb">
              Workspace <span>/</span>{" "}
              {project.synthetic ? "Generated experiments" : "My experiments"}
            </div>
            <input
              className="project-title"
              aria-label="Experiment name"
              maxLength={120}
              value={project.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            <p>From a recording to a model you can put to the test.</p>
          </div>
          <div className="heading-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                replace(sampleProject(), "/pendulum-synthetic.mp4")
              }
            >
              <Icon name="reset" />
              Load sample
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => videoInput.current?.click()}
            >
              <Icon name="upload" />
              {videoUrl ? "Import video" : "Relink video"}
            </button>
          </div>
        </div>
        <input
          ref={videoInput}
          hidden
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={importVideo}
        />
        <input
          ref={projectInput}
          hidden
          type="file"
          accept=".json"
          onChange={importProject}
        />
        <input
          ref={csvInput}
          hidden
          type="file"
          accept=".csv"
          onChange={importCsv}
        />
        {error && (
          <div className="message error" role="alert">
            <Icon name="info" />
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError("")}>
              <Icon name="close" />
            </button>
          </div>
        )}
        {notice && (
          <div className="message notice" role="status">
            <Icon name="check" />
            <span>{notice}</span>
            <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
              <Icon name="close" />
            </button>
          </div>
        )}
        {busy && (
          <div className="message notice" role="status">
            <span className="spinner" />
            Meta is processing your request. Keep this page open; no automatic
            retries will run.
          </div>
        )}
        {view === "Experiment" && (
          <>
            <div className="workflow" aria-label="Experiment steps">
              {[
                ["1", "Calibrate", "Set a real-world scale"],
                ["2", "Track", "Review the observations"],
                ["3", "Model & validate", "Predict unseen motion"],
              ].map(([n, title, desc]) => (
                <button
                  key={n}
                  className={
                    Number(n) === stageNumber
                      ? "workflow-step current"
                      : "workflow-step"
                  }
                  onClick={() => {
                    if (n === "1") {
                      setCalPoints([]);
                      setMode("calibrate");
                    } else if (n === "2") setMode("mark");
                    else
                      document.getElementById("model-panel")?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                >
                  <span className="step-number">
                    {Number(n) < stageNumber ? (
                      <Icon name="check" size={14} />
                    ) : (
                      n
                    )}
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                  {n !== "3" && <span className="step-line" />}
                </button>
              ))}
            </div>
            <div className="workbench-grid">
              <section
                className="panel video-panel"
                aria-label="Video observations"
              >
                <div className="panel-header">
                  <div>
                    <span className="section-title">Observation</span>
                    <span className="file-label">
                      {project.media.name || "Import a recording to begin"}
                    </span>
                  </div>
                  <span
                    className={project.synthetic ? "badge" : "badge neutral"}
                  >
                    {project.synthetic ? "Generated footage" : "Local video"}
                  </span>
                </div>
                <div
                  className="video-stage"
                  style={{
                    aspectRatio: `${project.media.width}/${project.media.height}`,
                  }}
                >
                  {videoUrl ? (
                    <video
                      key={videoUrl}
                      ref={video}
                      src={videoUrl}
                      playsInline
                      onLoadedMetadata={(e) => {
                        e.currentTarget.currentTime = Math.min(
                          time,
                          e.currentTarget.duration,
                        );
                      }}
                      preload="auto"
                      onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => setPlaying(false)}
                      onError={() =>
                        setError(
                          "Video playback failed. Try an MP4 encoded with H.264.",
                        )
                      }
                      aria-label="Experiment recording"
                    />
                  ) : (
                    <div className="video-empty">
                      <Icon name="upload" size={32} />
                      <strong>
                        {project.media.name
                          ? "Relink your source video"
                          : "Your experiment starts here"}
                      </strong>
                      <p>
                        Choose a fixed-camera recording. Your video stays local
                        until you approve an API run.
                      </p>
                      <button
                        className="button primary"
                        onClick={() => videoInput.current?.click()}
                      >
                        Choose video
                      </button>
                    </div>
                  )}
                  {videoUrl && (
                    <svg
                      className={`video-overlay ${mode === "view" ? "passive" : "interactive"}`}
                      viewBox={`0 0 ${project.media.width} ${project.media.height}`}
                      onClick={mark}
                      aria-hidden="true"
                    >
                      <polyline
                        points={project.points
                          .filter((p) => p.t <= time + 0.05)
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
                        fill="none"
                        stroke="#2357e9"
                        strokeWidth={2.5}
                        opacity=".7"
                      />
                      {nearest && (
                        <>
                          <rect
                            x={nearest.x - 28}
                            y={nearest.y - 28}
                            width="56"
                            height="56"
                            rx="5"
                            fill="none"
                            stroke="#2357e9"
                            strokeWidth="2"
                            strokeDasharray="6 3"
                          />
                          <circle
                            cx={nearest.x}
                            cy={nearest.y}
                            r="4"
                            fill="#2357e9"
                          />
                          <text
                            x={nearest.x + 38}
                            y={nearest.y - 18}
                            fill="#1747c2"
                            fontSize="13"
                            fontFamily="monospace"
                          >
                            {project.points.some((p) => p.source === "sam")
                              ? "SAM track"
                              : "Observed point"}
                          </text>
                        </>
                      )}
                      {fit && nearest && (
                        <circle
                          cx={
                            project.axis === "x"
                              ? project.points[0].x + fit.predict(time) / scale
                              : nearest.x
                          }
                          cy={
                            project.axis === "y"
                              ? project.points[0].y + fit.predict(time) / scale
                              : nearest.y
                          }
                          r="24"
                          fill="none"
                          stroke="#b67520"
                          strokeWidth="2"
                          strokeDasharray="5 4"
                        />
                      )}
                      {project.calibration && (
                        <>
                          <line
                            x1={project.calibration.a[0]}
                            y1={project.calibration.a[1]}
                            x2={project.calibration.b[0]}
                            y2={project.calibration.b[1]}
                            stroke="#167551"
                            strokeWidth="3"
                          />
                          {[project.calibration.a, project.calibration.b].map(
                            (p, i) => (
                              <circle
                                key={i}
                                cx={p[0]}
                                cy={p[1]}
                                r="5"
                                fill="#167551"
                              />
                            ),
                          )}
                        </>
                      )}
                      {calPoints.map((p, i) => (
                        <circle
                          key={i}
                          cx={p[0]}
                          cy={p[1]}
                          r="6"
                          fill="#167551"
                        />
                      ))}
                    </svg>
                  )}
                  {videoUrl && (
                    <div className="canvas-caption">
                      <span className="canvas-dot" />
                      {project.synthetic
                        ? project.runs.some((r) => r.status === "completed")
                          ? "Generated input · live Meta run recorded"
                          : "Generated footage · no recorded Meta run"
                        : `${project.media.width} × ${project.media.height} · original recording`}
                    </div>
                  )}
                </div>
                <div className="playback">
                  <button
                    aria-label={playing ? "Pause video" : "Play video"}
                    disabled={!videoUrl}
                    onClick={() => {
                      if (!video.current) return;
                      if (playing) video.current.pause();
                      else
                        void video.current
                          .play()
                          .catch((e) => setError(errorText(e)));
                    }}
                  >
                    <Icon name={playing ? "pause" : "play"} />
                  </button>
                  <button
                    aria-label="Previous frame (approximate)"
                    disabled={!videoUrl}
                    onClick={() => seek(time - 1 / project.media.fps)}
                    className="previous"
                  >
                    <Icon name="step" size={16} />
                  </button>
                  <button
                    aria-label="Next frame (approximate)"
                    disabled={!videoUrl}
                    onClick={() => seek(time + 1 / project.media.fps)}
                  >
                    <Icon name="step" size={16} />
                  </button>
                  <span className="timecode">
                    {fmt(time, 2)}{" "}
                    <span>/ {fmt(project.media.duration, 2)} s</span>
                  </span>
                  <input
                    aria-label="Video position"
                    type="range"
                    min="0"
                    max={project.media.duration || 1}
                    step="0.001"
                    value={time}
                    disabled={!videoUrl}
                    onChange={(e) => seek(Number(e.target.value))}
                  />
                </div>
                <div className="tools">
                  <button
                    aria-pressed={mode === "calibrate"}
                    className={mode === "calibrate" ? "tool selected" : "tool"}
                    disabled={!videoUrl || busy}
                    onClick={() => {
                      setMode(mode === "calibrate" ? "view" : "calibrate");
                      setCalPoints([]);
                    }}
                  >
                    <Icon name="ruler" />
                    Calibrate
                  </button>
                  <button
                    aria-pressed={mode === "mark"}
                    className={mode === "mark" ? "tool selected" : "tool"}
                    disabled={!videoUrl || busy}
                    onClick={() => setMode(mode === "mark" ? "view" : "mark")}
                  >
                    <Icon name="target" />
                    Mark points
                  </button>
                  <button
                    className="tool"
                    disabled={
                      busy || !videoUrl || !status.enabled || !status.configured
                    }
                    onClick={() => openPaid("track")}
                  >
                    <Icon name="spark" />
                    Track with SAM
                  </button>
                  <span className="tool-spacer" />
                  <span className="observations">
                    {project.points.length} points
                  </span>
                </div>
                {mode === "calibrate" && (
                  <div className="mode-help">
                    <label>
                      Reference length{" "}
                      <input
                        type="number"
                        min="0.000001"
                        step="0.01"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                      />{" "}
                      m
                    </label>
                    <p>
                      Click{" "}
                      {calPoints.length
                        ? "the second endpoint"
                        : "two endpoints"}{" "}
                      of that length in the video. Keep the reference in the
                      motion plane.
                    </p>
                    <details>
                      <summary>Enter endpoints with the keyboard</summary>
                      <form
                        className="coordinate-inputs"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          try {
                            const calibration = {
                              a: [Number(f.get("ax")), Number(f.get("ay"))] as [
                                number,
                                number,
                              ],
                              b: [Number(f.get("bx")), Number(f.get("by"))] as [
                                number,
                                number,
                              ],
                              meters: Number(distance),
                            };
                            parseProject({ ...project, calibration });
                            update({ calibration });
                            setCalPoints([]);
                            setMode("view");
                            setNotice(
                              "Calibration applied from pixel coordinates.",
                            );
                          } catch (e) {
                            setError(errorText(e));
                          }
                        }}
                      >
                        {(["ax", "ay", "bx", "by"] as const).map((name, i) => (
                          <label key={name}>
                            {
                              [
                                "First endpoint X",
                                "First endpoint Y",
                                "Second endpoint X",
                                "Second endpoint Y",
                              ][i]
                            }
                            <input
                              name={name}
                              aria-label={
                                [
                                  "First endpoint X",
                                  "First endpoint Y",
                                  "Second endpoint X",
                                  "Second endpoint Y",
                                ][i]
                              }
                              type="number"
                              min="0"
                              max={
                                i % 2
                                  ? project.media.height
                                  : project.media.width
                              }
                              step="any"
                              required
                              defaultValue={
                                project.calibration
                                  ? i < 2
                                    ? project.calibration.a[i]
                                    : project.calibration.b[i - 2]
                                  : undefined
                              }
                            />
                          </label>
                        ))}
                        <button className="button secondary" type="submit">
                          Apply calibration
                        </button>
                      </form>
                    </details>
                    <button
                      className="text-button"
                      onClick={() => {
                        setMode("view");
                        setCalPoints([]);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {mode === "mark" && (
                  <div className="mode-help">
                    <div className="coordinate-inputs">
                      <label>
                        X (px)
                        <input
                          type="number"
                          min="0"
                          max={project.media.width}
                          value={keyboardX}
                          onChange={(e) => setKeyboardX(e.target.value)}
                        />
                      </label>
                      <label>
                        Y (px)
                        <input
                          type="number"
                          min="0"
                          max={project.media.height}
                          value={keyboardY}
                          onChange={(e) => setKeyboardY(e.target.value)}
                        />
                      </label>
                      <button
                        className="button secondary"
                        onClick={() =>
                          keyboardX.trim() && keyboardY.trim()
                            ? addObservation([
                                Number(keyboardX),
                                Number(keyboardY),
                              ])
                            : setError("Enter both pixel coordinates.")
                        }
                      >
                        Add observation at {fmt(time, 2)} s
                      </button>
                    </div>
                    <p>
                      Pause, click the same physical point, then step forward.
                      Clicking again at the same time replaces that point. You
                      can also{" "}
                      <button
                        className="text-button"
                        onClick={() => csvInput.current?.click()}
                      >
                        import t,x,y CSV
                      </button>
                      .
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setMode("view")}
                    >
                      Done marking
                    </button>
                  </div>
                )}
                {mode === "view" && (
                  <div className="video-footnote">
                    <Icon name="info" size={15} />
                    {project.synthetic
                      ? project.points.some((p) => p.source === "sam")
                        ? "Live SAM observations from generated footage; this is not a physical measurement."
                        : project.points.some((p) => p.source === "synthetic")
                          ? "Synthetic observations are preloaded to explore the complete workflow."
                          : "Generated footage: observations describe this clip, not a physical experiment."
                      : "Mark at least 12 points, or review a SAM track. Missing frames are never interpolated into observations."}
                  </div>
                )}
                {tracks.length > 0 && (
                  <div className="track-review">
                    <strong>Review SAM result</strong>
                    <label>
                      Object{" "}
                      <select
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                      >
                        {tracks.map((t) => (
                          <option key={t.objectId} value={t.objectId}>
                            #{t.objectId} · {t.points.length} observations
                          </option>
                        ))}
                      </select>
                    </label>
                    <p>
                      Bounding-box centers are approximate landmarks, not
                      centers of mass. Applying replaces current observations.
                    </p>
                    <button
                      className="button primary"
                      onClick={() => {
                        const t = tracks.find((t) => t.objectId === trackId);
                        if (t) {
                          try {
                            const p = parseProject({
                              ...project,
                              points: t.points,
                            });
                            update({ points: p.points });
                            setTracks([]);
                            setNotice(
                              "SAM observations applied. Review positions and remove any unreliable points in Evidence.",
                            );
                          } catch (e) {
                            setError(errorText(e));
                          }
                        }
                      }}
                    >
                      Apply selected track
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setTracks([])}
                    >
                      Discard
                    </button>
                  </div>
                )}
              </section>
              <ModelPanel
                project={project}
                fits={fits}
                fit={fit}
                update={update}
                status={status}
                busy={busy}
                videoUrl={videoUrl}
                onSelect={(kind) => {
                  setSelected(kind);
                  setExplore(false);
                }}
                onPlan={() => openPaid("plan")}
                onApplyPlan={() => {
                  if (!project.plan) return;
                  update({
                    axis: project.plan.axis,
                    trackingTarget: project.plan.target.slice(0, 120),
                  });
                  setSelected(project.plan.suggestedModel);
                  setNotice(
                    "Applied the proposed axis, target and model. Fits still use only your observations.",
                  );
                }}
              />
            </div>
            <section className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <span className="section-title">Motion over time</span>
                  <span className="file-label">
                    {residual
                      ? "Observed − predicted"
                      : `${project.axis.toUpperCase()} displacement`}{" "}
                    ({units})
                  </span>
                </div>
                <div className="plot-legend">
                  <span>
                    <i className="blue-line" />
                    Observed
                  </span>
                  <span>
                    <i className="amber-line" />
                    Predicted
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
                fit={fit}
                calibration={project.calibration}
                axis={project.axis}
                currentTime={time}
                onSeek={seek}
                residual={residual}
                exploration={exploration}
              />
              <div className="chart-footer">
                <span>
                  <i className="validation-swatch" />
                  Shaded region: validation · coefficients fitted on earlier
                  observations only
                </span>
                <button
                  className="text-button"
                  disabled={!fit}
                  onClick={() =>
                    download("observations.csv", csv(project, fit), "text/csv")
                  }
                >
                  Export CSV <Icon name="download" size={14} />
                </button>
              </div>
            </section>
            {fit && fit.frequency > 0 && (
              <section className="exploration">
                <div>
                  <label className="explore-toggle">
                    <input
                      type="checkbox"
                      checked={explore}
                      onChange={(e) => setExplore(e.target.checked)}
                    />
                    Explore the model
                  </label>
                  <p>
                    Adjust a fitted parameter. No API calls. Exploratory
                    predictions are not validated physical interventions.
                  </p>
                </div>
                {explore && (
                  <div className="simulation-controls">
                    <label>
                      Frequency ×{fmt(frequencyFactor, 2)}
                      <input
                        type="range"
                        min=".5"
                        max="1.5"
                        step=".01"
                        value={frequencyFactor}
                        onChange={(e) =>
                          setFrequencyFactor(Number(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      Added damping {fmt(dampingDelta, 2)} s⁻¹
                      <input
                        type="range"
                        min="0"
                        max=".4"
                        step=".01"
                        value={dampingDelta}
                        onChange={(e) =>
                          setDampingDelta(Number(e.target.value))
                        }
                      />
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setFrequencyFactor(1);
                        setDampingDelta(0);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
        {view === "Evidence" && (
          <Evidence
            project={project}
            fits={fits}
            fit={fit}
            videoAvailable={!!videoUrl}
            onImportCsv={() => csvInput.current?.click()}
            onViewFrame={(t) => {
              setView("Experiment");
              setTime(t);
            }}
            update={update}
          />
        )}
        {view === "API usage" && (
          <Usage
            project={project}
            update={update}
            status={status}
            runs={runs}
            target={project.trackingTarget ?? ""}
            setTarget={(trackingTarget) => update({ trackingTarget })}
          />
        )}
        <footer className="footer">
          <span>
            <span className="mini-orbit" />
            Built to question. Designed to verify.
          </span>
          <span>
            {project.synthetic
              ? "Generated footage · not physical evidence"
              : "Local experiment"}
            <span className="footer-dot">·</span>Numerical analysis runs on your
            device
          </span>
        </footer>
      </main>
      <dialog
        ref={dialogRef}
        onCancel={() => setDialog(null)}
        onClose={() => {
          setDialog(null);
          setConsent(false);
        }}
        aria-labelledby="paid-title"
      >
        <div className="dialog-header">
          <span className="brand-mark">
            <Icon name="spark" />
          </span>
          <button
            aria-label="Close cost review"
            onClick={() => setDialog(null)}
          >
            <Icon name="close" />
          </button>
        </div>
        <h2 id="paid-title">
          {dialog === "track" ? "Run SAM tracking?" : "Run Muse planning?"}
        </h2>
        <p>
          This uploads your video to Meta and makes one paid inference request.
          File upload and deletion are separate administrative requests.
        </p>
        <dl className="cost-review">
          <div>
            <dt>Model</dt>
            <dd>{dialog === "track" ? "sam-3.1" : "muse-spark-1.3"}</dd>
          </div>
          <div>
            <dt>Video duration</dt>
            <dd>{fmt(project.media.duration, 2)} s</dd>
          </div>
          <div>
            <dt>
              {dialog === "track"
                ? "Segmentation estimate"
                : "Published token rates"}
            </dt>
            <dd>
              {dialog === "track"
                ? usd(
                    (Math.max(
                      50,
                      Math.ceil(project.media.duration * project.media.fps),
                    ) *
                      0.2) /
                      1000,
                  )
                : "$1.25 input / $4.25 output per 1M"}
            </dd>
          </div>
        </dl>
        {dialog === "track" && !project.media.cfrConfirmed && (
          <p className="inline-error">
            Verify the constant frame rate in API usage before tracking.
          </p>
        )}
        <p className="small-muted">
          {dialog === "track"
            ? "Estimate assumes the confirmed frame rate and one target request."
            : "Input video tokens are not known in advance. Output is capped at 4,000 tokens, including reasoning."}{" "}
          A failed or canceled request may still incur charges. No automatic
          retries.
        </p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          Upload this video and run the paid request.
        </label>
        <button
          className="button primary full"
          disabled={
            !consent ||
            busy ||
            !status.enabled ||
            !status.configured ||
            (dialog === "track" && !project.media.cfrConfirmed) ||
            project.media.duration > 30 ||
            (file?.size ?? 0) > 30 * 1024 * 1024
          }
          onClick={() => void executePaid()}
        >
          Confirm paid {dialog === "track" ? "tracking" : "planning"} run{" "}
          <Icon name="arrow" />
        </button>
        <button
          className="text-button dialog-cancel"
          onClick={() => setDialog(null)}
        >
          Cancel
        </button>
      </dialog>
    </div>
  );
}
