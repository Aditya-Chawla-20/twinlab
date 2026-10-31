import { createServer, type IncomingMessage } from "node:http";
import { readFile, mkdir, appendFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { pathToFileURL } from "node:url";
import type { Run } from "../src/lib/meta";
import { runMeta, type MetaInput } from "./meta";
try {
  process.loadEnvFile(".env.local");
} catch {}
export function allowedRequest(req: IncomingMessage) {
  const host = req.headers.host ?? "";
  return (
    /^(127\.0\.0\.1|localhost):\d+$/.test(host) &&
    (!req.headers.origin || req.headers.origin === `http://${host}`) &&
    req.headers["sec-fetch-site"] !== "cross-site"
  );
}
export async function startServer(
  port = Number(process.env.PORT ?? 5173),
  production = false,
  perform = runMeta,
) {
  let vite: import("vite").ViteDevServer | null = null;
  let inFlight = false;
  const server = createServer(async (req, res) => {
    const json = (status: number, value: unknown) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(JSON.stringify(value));
    };
    if (!allowedRequest(req)) {
      json(403, {
        error: "TwinLab accepts only same-origin loopback requests.",
      });
      return;
    }
    const path = (req.url ?? "/").split("?")[0];
    if (path === "/api/usage" && req.method === "GET") {
      try {
        const log = await readFile(".twinlab/usage.jsonl", "utf8");
        json(200, {
          runs: log
            .trim()
            .split("\n")
            .filter(Boolean)
            .slice(-1000)
            .map((line) => JSON.parse(line) as Run),
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT")
          json(200, { runs: [] });
        else
          json(500, {
            error:
              "Usage ledger could not be read. Preserve .twinlab/usage.jsonl and resolve this before paid runs.",
          });
      }
      return;
    }
    if (path === "/api/status" && req.method === "GET") {
      json(200, {
        configured: Boolean(process.env.MODEL_API_KEY),
        enabled: process.env.META_LIVE_ENABLED === "true",
      });
      return;
    }
    if (path === "/api/meta" && req.method === "POST") {
      if (req.headers["x-twinlab-action"] !== "manual-paid-run") {
        json(403, { error: "Manual paid-run action required." });
        return;
      }
      if (
        process.env.META_LIVE_ENABLED !== "true" ||
        !process.env.MODEL_API_KEY
      ) {
        json(403, {
          error:
            "Live Meta calls are off. Configure .env.local and restart when you are ready to test.",
        });
        return;
      }
      if (inFlight) {
        json(409, {
          error:
            "One Meta request is already running. Wait before starting another.",
        });
        return;
      }
      inFlight = true;
      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 31 * 1024 * 1024) {
            json(413, { error: "Upload exceeds 30 MB." });
            return;
          }
          chunks.push(chunk);
        }
        const request = new Request("http://localhost/api/meta", {
          method: "POST",
          headers: { "content-type": req.headers["content-type"] ?? "" },
          body: Buffer.concat(chunks),
        });
        const form = await request.formData();
        const input: MetaInput = {
          stage: form.get("stage") as MetaInput["stage"],
          file: form.get("file") as File,
          question: String(form.get("question") ?? ""),
          target: String(form.get("target") ?? ""),
          fps: Number(form.get("fps")),
          duration: Number(form.get("duration")),
          cfrConfirmed: form.get("cfrConfirmed") === "true",
          confirmed: form.get("confirmation") === "RUN_PAID_META_REQUEST",
        };
        await mkdir(".twinlab", { recursive: true });
        await appendFile(".twinlab/usage.jsonl", ""); // Fail before any paid work if the local ledger cannot be written.
        const result = await perform(input, {
          apiKey: process.env.MODEL_API_KEY,
        });
        try {
          await appendFile(
            ".twinlab/usage.jsonl",
            JSON.stringify(result.run) + "\n",
          );
        } catch {
          result.run.note =
            (result.run.note ?? "") +
            " Local ledger write failed. Export this run before closing the page.";
        }
        json("error" in result ? 502 : 200, result);
      } catch (error) {
        json(400, {
          error: error instanceof Error ? error.message : "Invalid request.",
        });
      } finally {
        inFlight = false;
      }
      return;
    }
    if (path.startsWith("/api/")) {
      json(404, { error: "Unknown API endpoint." });
      return;
    }
    if (vite) {
      vite.middlewares(req, res);
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      json(405, { error: "Method not allowed." });
      return;
    }
    try {
      const root = resolve("dist");
      let filename = resolve(root, "." + decodeURIComponent(path));
      if (!filename.startsWith(root + "/") && filename !== root) {
        json(403, { error: "Invalid path." });
        return;
      }
      if (!extname(filename)) filename = resolve(root, "index.html");
      const body = await readFile(filename),
        types: Record<string, string> = {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".mp4": "video/mp4",
          ".woff2": "font/woff2",
          ".json": "application/json",
        };
      res.writeHead(200, {
        "Content-Type": types[extname(filename)] ?? "application/octet-stream",
        "Content-Length": body.length,
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      json(404, { error: "File not found." });
    }
  });
  if (!production)
    vite = await (
      await import("vite")
    ).createServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
  await new Promise<void>((ok, no) => {
    server.once("error", no);
    server.listen(port, "127.0.0.1", ok);
  });
  console.log(
    `TwinLab ready: http://127.0.0.1:${(server.address() as { port: number }).port} · Meta live ${process.env.META_LIVE_ENABLED === "true" ? "enabled" : "OFF"}`,
  );
  return {
    server,
    close: async () => {
      await vite?.close();
      await new Promise<void>((ok) => server.close(() => ok()));
    },
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const app = await startServer(
    undefined,
    process.argv.includes("--production"),
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      void app.close().then(() => process.exit(0));
    });
}
