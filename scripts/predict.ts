import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { fitModels, MODEL_NAMES } from "../src/lib/physics";
import { parseProject } from "../src/lib/project";
import { evaluateTransfer, freezeTwin, transferCsv, transferReport } from "../src/lib/twin";

const { values } = parseArgs({ options: {
  source: { type: "string" }, target: { type: "string" }, model: { type: "string" },
  "initial-seconds": { type: "string" }, "same-setup": { type: "boolean", default: false },
  out: { type: "string" },
} });
async function readProject(path: string) {
  if ((await stat(path)).size > 3 * 1024 * 1024) throw new Error("Project file exceeds 3 MB.");
  const raw = await readFile(path);
  if (raw.length > 3 * 1024 * 1024) throw new Error("Project file exceeds 3 MB.");
  return parseProject(JSON.parse(raw.toString("utf8")));
}
try {
  if (!values.source || !values.target || !values.out || !values["initial-seconds"])
    throw new Error("Usage: npm run predict -- --source A.json --target B.json --initial-seconds 2 --same-setup --out artifacts/prediction [--model damped]");
  const [source, target] = await Promise.all([readProject(values.source), readProject(values.target)]);
  const fits = fitModels(source.points, source.calibration, source.axis, source.trainFraction);
  const fit = values.model ? fits.find((f) => f.kind === values.model) : fits[0];
  if (!fit) throw new Error("Source has no supported fit for the requested model.");
  const twin = await freezeTwin(source, fit), initialSeconds = Number(values["initial-seconds"]);
  const result = await evaluateTransfer(twin, target, initialSeconds, values["same-setup"]);
  target.comparison = { twin, initialSeconds, sameSetup: true };
  const out = resolve(values.out);
  await mkdir(out, { recursive: true });
  // Exclusive writes keep prior evidence intact; choose a new directory for another evaluation.
  for (const [name, body] of [
    ["model.twinlab.json", JSON.stringify(twin, null, 2)],
    ["target.twinlab.json", JSON.stringify(target, null, 2)],
    ["prediction.csv", transferCsv(result)],
    ["prediction.md", transferReport(result, target)],
  ]) await writeFile(resolve(out, name), body, { flag: "wx" });
  console.log(JSON.stringify({ model: MODEL_NAMES[fit.kind], modelId: twin.id,
    initialCount: result.count, evaluationCount: result.rows.length - result.count,
    units: target.calibration ? "m" : "px", metrics: result.metrics,
    baselines: result.baselines, out, providerCalls: 0 }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Prediction failed.");
  process.exitCode = 1;
}
