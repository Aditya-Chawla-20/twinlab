import {
  readFile,
  writeFile,
  mkdir,
  open,
  rename,
  unlink,
  appendFile,
} from "node:fs/promises";
import { basename } from "node:path";
import { parseArgs } from "node:util";
import { runMeta, type MetaInput } from "../server/meta";
import { budgetedFetch, validateBudget, type TestBudget } from "./meta-budget";
import { readTestFixture } from "./meta-fixture";

async function main() {
  const { values } = parseArgs({ options: {
    live: { type: "boolean" },
    video: { type: "string" },
    sha256: { type: "string" },
    target: { type: "string" },
    question: { type: "string" },
    "track-only": { type: "boolean" },
    "plan-only": { type: "boolean" },
  } });
  if (values["track-only"] && values["plan-only"])
    throw new Error("Choose either --track-only or --plan-only, not both.");
  if (!values.live && !values.video) {
    console.log(
      "No provider calls. Use --live only under the user-authorized cumulative $10 test budget.",
    );
    return;
  }
  const target = values.target ?? (values.video ? "" : "blue ball"),
    question = values.question ?? (values.video ? "" :
      "Does a damped oscillator explain the horizontal motion in this synthetic pendulum clip? Suggest a reviewable plan without inventing numerical measurements.");
  if (!target.trim() || target.length > 120 || !question.trim() || question.length > 2000)
    throw new Error("Provide an explicit short --target and --question for the selected clip.");
  const fixture = await readTestFixture(
    values.video ?? "public/pendulum-synthetic.mp4",
    values.sha256 ?? (values.video ? "" : "c0bbb9dbc6c43468e42832e74b909164cdc0a5249b50490d3c9a8f9e6c2ece78"),
  );
  const { bytes, fps, duration, frames, width, height, sha256 } = fixture;
  const stages: MetaInput["stage"][] = values["track-only"]
    ? ["track"] : values["plan-only"] ? ["plan"] : ["plan", "track"];
  const manifest = { clip: fixture.path, sha256, frames, fps, duration, width, height, target, question, stages };
  if (!values.live) {
    console.log(JSON.stringify({ ...manifest, live: false, providerCalls: 0 }));
    return;
  }
  process.loadEnvFile(".env.local");
  const apiKey = process.env.MODEL_API_KEY?.trim();
  if (!apiKey)
    throw new Error("Add MODEL_API_KEY to the ignored .env.local file.");
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
      file: new File([bytes], basename(fixture.path), { type: "video/mp4" }),
      question,
      target,
      fps,
      duration,
      cfrConfirmed: true,
      confirmed: true,
    };
    await appendFile(".twinlab/usage.jsonl", "");
    console.log(
      JSON.stringify({
        ...manifest,
        reservedUsd: budget.reservedCents / 100,
        ceilingUsd: 10,
      }),
    );
    for (const stage of stages) {
      const result = await runMeta(
        { ...input, stage },
        { apiKey, fetch: transport },
      );
      const path = `artifacts/meta-live/${result.run.id}.json`;
      await writeFile(`artifacts/meta-live/${result.run.id}.input.json`, JSON.stringify(manifest, null, 2), { mode: 0o600 });
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
