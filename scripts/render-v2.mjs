#!/usr/bin/env node
/**
 * Render the six 10s style tests.
 *   node scripts/render-v2.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const demos = [
  "01-white-model",
  "02-whiteboard",
  "03-teardown",
  "04-ink-wash",
  "05-crayon-book",
  "06-isometric",
];

fs.mkdirSync("renders/v2", { recursive: true });
fs.mkdirSync("previews/v2", { recursive: true });

for (const name of demos) {
  const scene = path.join("scenes/v2", `${name}.html`);
  const out = path.join("renders/v2", `${name}.mp4`);
  console.log(`\n=== ${name} ===`);
  await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [
      "render/render.mjs", scene, out,
      "--width", "1280", "--height", "720",
      "--duration", "10", "--fps", "24",
      "--channel", "chrome",
    ], { stdio: "inherit" });
    p.on("close", (code) => code === 0 ? resolve() : reject(new Error(`render failed: ${name}`)));
  });

  const jpg = out.replace(/\.mp4$/, ".jpg");
  if (fs.existsSync(jpg)) fs.renameSync(jpg, path.join("previews/v2", `${name}.jpg`));
}

console.log("\nall v2 tests rendered");
