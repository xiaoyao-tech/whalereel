#!/usr/bin/env node
/**
 * Capture the three in-repo preview JPGs at their best frame.
 *   node scripts/capture-previews.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const times = {
  "01-paper-diorama": 6.4,
  "02-whiteboard": 6.5,
  "04-ink-wash": 6.5,
};

fs.mkdirSync("previews", { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

for (const [name, t] of Object.entries(times)) {
  const url = "file://" + path.resolve("scenes", `${name}.html`);
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  await page.evaluate((time) => window.__seek(time), t);
  const out = path.join("previews", `${name}.jpg`);
  await page.screenshot({ path: out, type: "jpeg", quality: 90 });
  console.log(`${out} @ ${t}s`);
}

await browser.close();
console.log("previews done");
