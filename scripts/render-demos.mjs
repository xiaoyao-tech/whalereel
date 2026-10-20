#!/usr/bin/env node
/**
 * Render the three in-repo style demos at 1280x720 / 8s / 24fps.
 * (The three case excerpts in renders/cases/ come from real projects
 *  and are not rebuilt by this script.)
 * Requires: npm i playwright, local Chrome, ffmpeg.
 *   node scripts/render-demos.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const demos = [
  "01-paper-diorama",
  "02-whiteboard",
  "04-ink-wash",
];

fs.mkdirSync("renders", { recursive: true });
fs.mkdirSync("previews", { recursive: true });

for (const name of demos) {
  const scene = path.join("scenes", `${name}.html`);
  const out = path.join("renders", `${name}.mp4`);
  console.log(`\n=== ${name} ===`);
  await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [
      "render/render.mjs", scene, out,
      "--width", "1280", "--height", "720",
      "--duration", "8", "--fps", "24",
      "--channel", "chrome",
    ], { stdio: "inherit" });
    p.on("close", (code) => code === 0 ? resolve() : reject(new Error(`render failed: ${name}`)));
  });

  const jpg = out.replace(/\.mp4$/, ".jpg");
  if (fs.existsSync(jpg)) fs.renameSync(jpg, path.join("previews", `${name}.jpg`));
}

console.log("\nall demos rendered");
