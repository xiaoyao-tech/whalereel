import { chromium } from "playwright";
import path from "node:path";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto("file://" + path.resolve("scenes/01b-tanzhe-45s.html"), { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
await page.evaluate(() => window.__seek(27));
const info = await page.evaluate(() => {
  const w = document.getElementById("walker");
  const r = w.getBoundingClientRect();
  return { opacity: w.getAttribute("opacity"), transform: w.getAttribute("transform"), box: [r.x, r.y, r.width, r.height] };
});
console.log(JSON.stringify(info));
await browser.close();
