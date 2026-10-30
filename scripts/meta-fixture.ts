import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, resolve } from "node:path";

type VideoProbe = {
  streams: {
    r_frame_rate: string;
    avg_frame_rate: string;
    duration: string;
    width: number;
    height: number;
    nb_frames?: string;
  }[];
  format: { duration: string };
  frames: { best_effort_timestamp_time: string }[];
};

export function validateFixtureProbe(probe: VideoProbe) {
  const stream = probe.streams?.[0];
  if (!stream || !Array.isArray(probe.frames))
    throw new Error("Video timing is unavailable; no provider request sent.");
  const rate = (value: string) => {
    const [n, d] = value.split("/").map(Number);
    return n / d;
  };
  const fps = rate(stream.r_frame_rate),
    average = rate(stream.avg_frame_rate),
    duration = Math.max(Number(stream.duration), Number(probe.format.duration)),
    frames = probe.frames.length,
    width = stream.width,
    height = stream.height;
  if (
    !Number.isFinite(fps) || fps < 1 || fps > 60 ||
    !Number.isFinite(average) || Math.abs(fps - average) > 0.0001 ||
    !Number.isFinite(duration) || duration <= 0 || duration > 30 ||
    frames < 2 || frames > 1800 || duration * fps > 1800 ||
    !Number.isInteger(width) || width < 1 || width > 8192 ||
    !Number.isInteger(height) || height < 1 || height > 8192 ||
    Math.abs(frames - fps * Number(stream.duration)) > 1 ||
    (stream.nb_frames !== undefined && Number(stream.nb_frames) !== frames)
  )
    throw new Error("Clip exceeds the bounded test's duration, rate, frame or dimension limits.");
  // Metadata rate equality alone does not establish constant frame timing.
  if (probe.frames.some((frame, i) => {
    if (typeof frame.best_effort_timestamp_time !== "string" || !frame.best_effort_timestamp_time.trim())
      return true;
    const t = Number(frame.best_effort_timestamp_time);
    return !Number.isFinite(t) || Math.abs(t - i / fps) > 0.0001;
  }))
    throw new Error("Use zero-origin constant-frame-rate video; decoded timestamps do not match.");
  return { fps, duration, frames, width, height };
}

export async function readTestFixture(filename: string, expectedSha256: string) {
  const path = resolve(filename);
  const info = await stat(path);
  if (!info.isFile() || info.size < 1 || info.size > 30 * 1024 * 1024 || extname(path).toLowerCase() !== ".mp4")
    throw new Error("Choose an MP4 file up to 30 MB for the scoped test.");
  if (!/^[a-f0-9]{64}$/.test(expectedSha256))
    throw new Error("Provide the reviewed clip's SHA-256 digest.");
  const bytes = await readFile(path);
  if (bytes.length !== info.size || bytes.length > 30 * 1024 * 1024)
    throw new Error("Clip changed while reading; no provider request sent.");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== expectedSha256)
    throw new Error("Clip digest differs from the reviewed fixture; no provider request sent.");
  const probe = JSON.parse(execFileSync("ffprobe", [
    "-v", "error", "-protocol_whitelist", "file,pipe", "-select_streams", "v:0", "-show_frames",
    "-show_entries", "stream=r_frame_rate,avg_frame_rate,duration,nb_frames,width,height:format=duration:frame=best_effort_timestamp_time",
    "-of", "json", path,
  ], { encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024 })) as VideoProbe;
  if (createHash("sha256").update(await readFile(path)).digest("hex") !== sha256)
    throw new Error("Clip changed during inspection; no provider request sent.");
  return { path, bytes, sha256, ...validateFixtureProbe(probe) };
}
