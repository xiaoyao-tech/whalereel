import { chromium } from "playwright";
import path from "node:path";
const times = process.argv.slice(2).map(Number);
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto("file://" + path.resolve("scenes/01b-tanzhe-45s.html"), { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
for (const t of times) {
  await page.evaluate((x) => window.__seek(x), t);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `/tmp/tz-${t}.jpg`, type: "jpeg", quality: 86 });
  console.log("shot", t);
}
await browser.close();
