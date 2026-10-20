#!/usr/bin/env node
/**
 * WhaleReel renderer
 * HTML scene -> PNG frames -> ffmpeg -> mp4
 *
 * Usage:
 *   node render.mjs <scene.html> [out.mp4] [--duration 45] [--fps 30]
 *                   [--width 1920] [--height 1080] [--audio mix.wav]
 *                   [--channel chrome] [--preview 6.3]
 *
 * The scene must expose:
 *   window.__duration : number (seconds)
 *   window.__seek(t)  : set the visual state at time t
 *   window.__ready    : true after fonts/assets are loaded
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const scene = argv.find((a) => !a.startsWith('--') && /\.html(?:\?|$)/.test(a));
if (!scene) {
  console.error('Usage: node render.mjs <scene.html> [out.mp4] [--duration 45] [--fps 30] [--audio mix.wav]');
  process.exit(1);
}

function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const out = argv.find((a, i) => i > 0 && !a.startsWith('--') && a.endsWith('.mp4')) || 'out.mp4';
const fps = Number(arg('fps', 30));
const width = Number(arg('width', 1920));
const height = Number(arg('height', 1080));
const audio = arg('audio', null);
const channel = arg('channel', process.env.PW_CHANNEL || null);

let browser;
let ffmpeg;

try {
  const launchArgs = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
  browser = await chromium.launch(channel ? { channel, args: launchArgs } : { args: launchArgs });
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });

  const [sceneFile, sceneQuery] = scene.split('?');
  const sceneUrl = pathToFileURL(path.resolve(sceneFile)).href + (sceneQuery ? `?${sceneQuery}` : '');
  await page.goto(sceneUrl, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });

  const sceneDuration = await page.evaluate(() => Number(window.__duration) || 45);
  const duration = Number(arg('duration', sceneDuration));
  const total = Math.max(1, Math.round(duration * fps));

  const ffArgs = [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-i', '-',
  ];
  if (audio) ffArgs.push('-i', audio);
  ffArgs.push(
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
  );
  if (audio) ffArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  ffArgs.push(out);

  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  ffmpeg = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
  ffmpeg.on('error', (err) => {
    console.error('\nCannot start ffmpeg. Is it installed and on PATH?');
    console.error(err.message);
    process.exit(1);
  });

  console.log(`rendering ${total} frames (${duration}s @ ${fps}fps, ${width}x${height}) -> ${out}`);

  for (let i = 0; i < total; i++) {
    const t = i / fps;
    await page.evaluate((time) => window.__seek(time), t);
    const buf = await page.screenshot({ type: 'png' });
    if (!ffmpeg.stdin.write(buf)) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }
    if (i % Math.max(1, Math.floor(total / 10)) === 0) {
      process.stdout.write(`  ${Math.round((i / total) * 100)}%\r`);
    }
  }

  ffmpeg.stdin.end();
  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });

  // preview frame at 2s
  const previewAt = Number(arg("preview", await page.evaluate(() => Number(window.__preview) || Math.min(2, duration / 2))));
  await page.evaluate((time) => window.__seek(time), previewAt);
  const previewPath = out.replace(/\.mp4$/i, '') + '.jpg';
  await page.screenshot({ path: previewPath, type: 'jpeg', quality: 88 });

  console.log(`\ndone: ${out}`);
  console.log(`preview: ${previewPath}`);
} catch (err) {
  console.error('\nrender failed:', err.message);
  process.exitCode = 1;
} finally {
  if (ffmpeg && !ffmpeg.killed) ffmpeg.kill('SIGTERM');
  if (browser) await browser.close();
}
