#!/usr/bin/env node
/**
 * Validate the style book.
 *   node scripts/validate-styles.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];
const rows = [];

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function sections(md) {
  const out = new Map();
  for (const chunk of md.split(/^## /m).slice(1)) {
    const nl = chunk.indexOf("\n");
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    out.set(title, nl === -1 ? "" : chunk.slice(nl + 1));
  }
  return out;
}

function findSection(map, startsWith) {
  for (const [title, body] of map) {
    if (title.startsWith(startsWith)) return body;
  }
  return null;
}

let index;
try {
  index = JSON.parse(read("index.json"));
} catch (e) {
  console.error("index.json is not valid JSON:", e.message);
  process.exit(1);
}

if (!Array.isArray(index.styles) || index.styles.length === 0) {
  console.error("index.json has no styles[]");
  process.exit(1);
}

for (const s of index.styles) {
  const slug = s.slug;
  const file = `styles/${slug}/STYLE.md`;
  const row = { slug, sections: 0, colors: 0, forbidden: 0, qa: 0, demo: "-" };

  if (!slug) {
    errors.push("index.json: style without slug");
    continue;
  }
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`${slug}: missing ${file}`);
    rows.push(row);
    continue;
  }

  const md = read(file);
  const map = sections(md);
  row.sections = map.size;
  if (map.size !== 9) errors.push(`${slug}: expected 9 ## sections, got ${map.size}`);

  const visual = findSection(map, "2. 视觉契约") || "";
  const paletteBlock = visual.split(/^### /m).find((b) => b.startsWith("色板")) || "";
  const colors = [...new Set(paletteBlock.match(/#[0-9A-Fa-f]{6}/g) || [])];
  row.colors = colors.length;
  if (colors.length < 4) errors.push(`${slug}: palette has ${colors.length} colors, expected >= 4`);
  if (colors.length > 6) errors.push(`${slug}: palette has ${colors.length} colors, expected <= 6`);

  const forbidden = findSection(map, "7. 禁止项") || "";
  row.forbidden = (forbidden.match(/^\s*-\s+/gm) || []).length;
  if (row.forbidden < 3) errors.push(`${slug}: forbidden list has ${row.forbidden} items, expected >= 3`);

  const qa = findSection(map, "8. 验收清单") || "";
  row.qa = (qa.match(/^\s*-\s*\[ \]/gm) || []).length;
  if (row.qa < 4) errors.push(`${slug}: QA checklist has ${row.qa} items, expected >= 4`);

  for (const [key, label] of [["demo", "mp4"], ["preview", "jpg"]]) {
    if (!s[key]) {
      warnings.push(`${slug}: index.json missing "${key}"`);
      continue;
    }
    if (fs.existsSync(path.join(root, s[key]))) {
      row.demo = row.demo === "-" ? label : `${row.demo}+${label}`;
    } else {
      warnings.push(`${slug}: ${key} not found: ${s[key]} (ok if not rendered yet)`);
    }
  }

  rows.push(row);
}

const pad = (v, n) => String(v).padEnd(n);
console.log("\nslug".padEnd(24) + "sections  colors  forbid  qa  files");
console.log("-".repeat(58));
for (const r of rows) {
  console.log(
    pad(r.slug, 24) +
    pad(r.sections, 10) +
    pad(r.colors, 8) +
    pad(r.forbidden, 8) +
    pad(r.qa, 4) +
    r.demo
  );
}

if (warnings.length) {
  console.log("\nwarnings:");
  for (const w of warnings) console.log("  - " + w);
}
if (errors.length) {
  console.error("\nerrors:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("\nall styles valid.");
