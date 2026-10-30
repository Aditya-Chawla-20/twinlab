import {
  readFile,
  writeFile,
  mkdir,
  open,
  rename,
  unlink,
  appendFile,
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { runMeta, type MetaInput } from "../server/meta";
import { budgetedFetch, validateBudget, type TestBudget } from "./meta-budget";

async function main() {
  if (!process.argv.includes("--live")) {
    console.log(
      "No provider calls. Use --live only under the user-authorized cumulative $10 test budget.",
    );
    return;
  }
  process.loadEnvFile(".env.local");
  const apiKey = process.env.MODEL_API_KEY?.trim();
  if (!apiKey)
    throw new Error("Add MODEL_API_KEY to the ignored .env.local file.");
  const filename = "public/pendulum-synthetic.mp4";
  const bytes = await readFile(filename);
  const probe = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=r_frame_rate,avg_frame_rate,duration,nb_frames",
        "-of",
        "json",
        filename,
      ],
      { encoding: "utf8" },
    ),
  ).streams[0];
  const [num, den] = probe.r_frame_rate.split("/").map(Number),
    fps = num / den,
    duration = Number(probe.duration),
    frames = Number(probe.nb_frames);
  if (
    probe.r_frame_rate !== probe.avg_frame_rate ||
    !Number.isFinite(fps) ||
    !Number.isFinite(duration) ||
    !Number.isInteger(frames) ||
    frames > 1800 ||
    fps > 60 ||
    duration > 30 ||
    Math.abs(frames - fps * duration) > 1 ||
    bytes.length > 30 * 1024 * 1024
  )
    throw new Error("Bundled clip exceeds the validated test bounds.");
  await mkdir(".twinlab", { recursive: true });
  await mkdir("artifacts/meta-live", { recursive: true });
  const lock = await open(".twinlab/live-test.lock", "wx");
  try {
    let budget: TestBudget;
    try {
      budget = validateBudget(
        JSON.parse(await readFile(".twinlab/test-budget.json", "utf8")),
      );
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT")
        budget = { version: 1, reservedCents: 0, requests: [] };
      else throw e;
    }
    const persist = async (b: TestBudget) => {
      await writeFile(
        ".twinlab/test-budget.json.tmp",
        JSON.stringify(b, null, 2),
        { mode: 0o600 },
      );
      await rename(
        ".twinlab/test-budget.json.tmp",
        ".twinlab/test-budget.json",
      );
    };
    const transport = budgetedFetch(budget, persist);
    const input: MetaInput = {
      stage: "plan",
      file: new File([bytes], "pendulum-synthetic.mp4", { type: "video/mp4" }),
      question:
        "Does a damped oscillator explain the horizontal motion in this synthetic pendulum clip? Suggest a reviewable plan without inventing numerical measurements.",
      target: "blue ball",
      fps,
      duration,
      cfrConfirmed: true,
      confirmed: true,
    };
    await appendFile(".twinlab/usage.jsonl", "");
    console.log(
      JSON.stringify({
        clip: filename,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        frames,
        fps,
        duration,
        reservedUsd: budget.reservedCents / 100,
        ceilingUsd: 10,
      }),
    );
    const targetFlag = process.argv.indexOf("--target");
    if (targetFlag !== -1) {
      const target = process.argv[targetFlag + 1];
      if (!target || target.length > 120)
        throw new Error("Provide a short tracking target.");
      input.target = target;
    }
    const stages: MetaInput["stage"][] = process.argv.includes("--track-only")
      ? ["track"]
      : process.argv.includes("--plan-only")
        ? ["plan"]
        : ["plan", "track"];
    for (const stage of stages) {
      const result = await runMeta(
        { ...input, stage },
        { apiKey, fetch: transport },
      );
      const path = `artifacts/meta-live/${result.run.id}.json`;
      await writeFile(path, JSON.stringify(result, null, 2), { mode: 0o600 });
      await appendFile(
        ".twinlab/usage.jsonl",
        JSON.stringify(result.run) + "\n",
      );
      console.log(
        JSON.stringify({
          stage,
          status: result.run.status,
          model: result.run.model,
          usage: result.run.usage,
          estimatedUsd: result.run.estimatedUsd,
          note: result.run.note,
          reservedUsd: budget.reservedCents / 100,
          artifact: path,
          ...("tracks" in result && result.tracks
            ? {
                tracks: result.tracks.map((t) => ({
                  objectId: t.objectId,
                  points: t.points.length,
                })),
              }
            : {}),
        }),
      );
      if ("error" in result)
        throw new Error(
          "Live test failed. Stopped without retry; inspect the local result and billing before another attempt.",
        );
      if (
        result.run.estimatedUsd === null ||
        result.run.estimatedUsd > (stage === "plan" ? 1.5 : 0.4)
      )
        throw new Error(
          "Usage is missing or exceeds its conservative reservation. Stop for billing review.",
        );
    }
  } finally {
    await lock.close();
    await unlink(".twinlab/live-test.lock");
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Live test failed.");
  process.exitCode = 1;
});
