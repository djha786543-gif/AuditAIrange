#!/usr/bin/env node
// Hands-off video pipeline:
//   1. Build the app and serve it with `vite preview`
//   2. Synthesize per-shot narration with edge-tts
//   3. Probe each MP3 to derive precise per-shot dwell times
//   4. Drive the UI with Playwright; record video
//   5. Concatenate the narration; mux with the screen recording
//   6. Emit dist-video/auditai-range-walkthrough.mp4
//
// Usage:
//   node scripts/make-video/make-video.mjs
// Optional env:
//   VOICE=en-US-AriaNeural   (default; try en-US-GuyNeural, en-GB-SoniaNeural)
//   RATE=-5%                 (slow down a touch; default is 0%)
//   OUTPUT=dist-video/foo.mp4

import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';
import { execFile as execFileCb } from 'node:child_process';
import path from 'node:path';
import url from 'node:url';
import { chromium } from 'playwright';

import { SHOTS } from './narration.mjs';
import { CURSOR_INIT_SCRIPT } from './cursor.mjs';

const execFile = promisify(execFileCb);

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'dist-video');
const AUDIO_DIR = path.join(OUT_DIR, 'audio');
const VIDEO_DIR = path.join(OUT_DIR, 'video');
const FINAL = process.env.OUTPUT
  ? path.resolve(process.env.OUTPUT)
  : path.join(OUT_DIR, 'auditai-range-walkthrough.mp4');

const VOICE = process.env.VOICE || 'en-US-AriaNeural';
const RATE = process.env.RATE || '-3%';
const VIEWPORT = { width: 1280, height: 800 };

// ─────────────────────────────────────────────────────────────────────────
// helpers

function log(stage, msg) {
  process.stdout.write(`\x1b[36m[${stage}]\x1b[0m ${msg}\n`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function probeDuration(file) {
  const { stdout } = await execFile('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nokey=1:noprint_wrappers=1',
    file,
  ]);
  return parseFloat(stdout.trim());
}

async function ensureClean(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────
// step 1: build + preview

async function startPreview() {
  log('build', 'vite build…');
  await execFile('npx', ['vite', 'build'], { cwd: ROOT });

  // Kill any stale vite preview holding the port.
  await execFile('bash', ['-c', 'pkill -9 -f "vite preview" 2>/dev/null || true']).catch(() => {});
  await sleep(500);

  log('serve', 'vite preview on :4173…');
  const proc = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const baseUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('vite preview timeout')), 30_000);
    let buf = '';
    const onData = (chunk) => {
      buf += chunk.toString();
      const m = buf.match(/Local:\s+(http:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1].replace(/\/$/, ''));
      }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('exit', (code) => reject(new Error(`vite preview exited early (${code})`)));
  });

  log('serve', `ready at ${baseUrl}`);
  return { proc, baseUrl };
}

// ─────────────────────────────────────────────────────────────────────────
// step 2: TTS

async function synthShot(shot, outFile) {
  // edge-tts misparses `--rate -3%` because the value looks like a flag.
  // Use the `--rate=VALUE` form (single arg) instead.
  await execFile('python3', [
    '-m', 'edge_tts',
    '--voice', VOICE,
    `--rate=${RATE}`,
    '--text', shot.text,
    '--write-media', outFile,
  ]);
}

async function generateNarration() {
  await ensureClean(AUDIO_DIR);
  const timings = [];
  for (const shot of SHOTS) {
    const file = path.join(AUDIO_DIR, `shot-${String(shot.id).padStart(2, '0')}.mp3`);
    log('tts', `shot ${shot.id} (${VOICE})…`);
    await synthShot(shot, file);
    const duration = await probeDuration(file);
    timings.push({ ...shot, file, duration });
  }
  return timings;
}

// ─────────────────────────────────────────────────────────────────────────
// step 3: drive the UI with Playwright

const SEED = `(() => {
  try {
    localStorage.setItem('auditai-grok-key', 'xai-demo-placeholder-not-a-real-key');
    localStorage.setItem('auditai-groq-key', 'gsk_demo-placeholder-not-a-real-key');
    localStorage.setItem('auditai-llm-provider', 'groq');
    localStorage.setItem('auditai-os-type', 'macos-linux');
    localStorage.setItem('auditai-progress', JSON.stringify(['wp-01-t01']));
    localStorage.setItem('auditai-activity-dates', JSON.stringify([new Date().toISOString().split('T')[0]]));
  } catch {}
})();`;

async function dwellWithMouseDrift(page, seconds, options = {}) {
  // Idle motion so the recording doesn't feel frozen.
  const startX = options.fromX ?? VIEWPORT.width / 2;
  const startY = options.fromY ?? VIEWPORT.height / 2;
  const endX = options.toX ?? startX + 18;
  const endY = options.toY ?? startY + 12;
  const steps = Math.max(6, Math.floor(seconds * 12));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;
    await page.mouse.move(x, y, { steps: 2 });
    await sleep((seconds * 1000) / steps);
  }
}

async function smoothMove(page, x, y) {
  await page.mouse.move(x, y, { steps: 28 });
  await sleep(120);
}

async function safeClickByText(page, text, opts = {}) {
  const locator = page.getByText(text, { exact: opts.exact ?? false }).first();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No bounding box for "${text}"`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await smoothMove(page, x, y);
  await locator.click();
}

async function safeClickByRole(page, role, name) {
  const locator = page.getByRole(role, { name }).first();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No bounding box for ${role}:${name}`);
  await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2);
  await locator.click();
}

async function performAction(page, shot) {
  switch (shot.action) {
    case 'open-now':
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await dwellWithMouseDrift(page, shot.duration);
      break;

    case 'open-queue':
      await safeClickByText(page, 'Task queue', { exact: true });
      await dwellWithMouseDrift(page, shot.duration);
      break;

    case 'open-wp01-show-script': {
      // Click the WP-01 setup task in the queue (first task card).
      const firstTask = page.locator('button:has-text("Prepare audit lab environment")').first();
      const box = await firstTask.boundingBox();
      if (box) await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2);
      await firstTask.click();
      await sleep(600);
      // Smooth scroll to the evidence script block.
      await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('p'))
          .find(el => el.textContent && el.textContent.includes('Create evidence folders'));
        if (heading) heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await sleep(900);
      // Hover the copy button and click it.
      const copyBtn = page.getByRole('button', { name: /Copy evidence folder script/i }).first();
      const cbox = await copyBtn.boundingBox();
      if (cbox) {
        await smoothMove(page, cbox.x + cbox.width / 2, cbox.y + cbox.height / 2);
        await copyBtn.click().catch(() => {});
      }
      const remaining = Math.max(0, shot.duration - 2.5);
      await dwellWithMouseDrift(page, remaining);
      break;
    }

    case 'toggle-windows': {
      // Go to Settings.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await safeClickByText(page, 'Settings', { exact: true });
      await sleep(800);
      // Click the Windows OS card.
      const winBtn = page.locator('button:has-text("Windows")').filter({ hasText: 'PowerShell' }).first();
      const wbox = await winBtn.boundingBox();
      if (wbox) {
        await smoothMove(page, wbox.x + wbox.width / 2, wbox.y + wbox.height / 2);
        await winBtn.click();
      }
      await sleep(900);
      // Back to the queue and the same WP-01 task to see the rewritten command.
      await safeClickByText(page, 'Task queue', { exact: true });
      await sleep(700);
      const firstTask = page.locator('button:has-text("Prepare audit lab environment")').first();
      await firstTask.click();
      await sleep(500);
      await page.evaluate(() => {
        const code = Array.from(document.querySelectorAll('code'))
          .find(el => el.textContent && el.textContent.toLowerCase().includes('powershell') === false && el.textContent.includes('audit-env'));
        if (code) code.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      const remaining = Math.max(0, shot.duration - 4);
      await dwellWithMouseDrift(page, remaining);
      break;
    }

    case 'highlight-repl-warning': {
      // Scroll the amber REPL warning into view and pulse it.
      await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('p'))
          .find(p => p.textContent && p.textContent.includes('REPL Warning'));
        if (el) {
          const card = el.closest('div');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.animate(
              [
                { boxShadow: '0 0 0 0 rgba(217,119,6,0)' },
                { boxShadow: '0 0 0 12px rgba(217,119,6,0.35)' },
                { boxShadow: '0 0 0 0 rgba(217,119,6,0)' },
              ],
              { duration: 1400, iterations: 2 },
            );
          }
        }
      });
      await dwellWithMouseDrift(page, shot.duration);
      break;
    }

    case 'open-tutor': {
      // Click the floating Ask Tutor button.
      const tutorBtn = page.getByRole('button', { name: /Ask Tutor|Set up Tutor/i }).first();
      const tbox = await tutorBtn.boundingBox();
      if (tbox) {
        await smoothMove(page, tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
        await tutorBtn.click();
      }
      await sleep(700);
      // Type a question into the textarea (won't actually call the API since the placeholder key is invalid).
      const ta = page.locator('textarea').last();
      await ta.click();
      await ta.type('How should I approach WP-03 prompt injection?', { delay: 35 });
      await sleep(500);
      const remaining = Math.max(0, shot.duration - 5.5);
      await dwellWithMouseDrift(page, remaining);
      break;
    }

    case 'close-and-finish': {
      // Close tutor and pan to the "What's Next" view.
      const closeBtn = page.getByRole('button', { name: /Close tutor/i }).first();
      const cbox = await closeBtn.boundingBox();
      if (cbox) {
        await smoothMove(page, cbox.x + cbox.width / 2, cbox.y + cbox.height / 2);
        await closeBtn.click().catch(() => {});
      }
      await sleep(500);
      await safeClickByText(page, "What's Next", { exact: true }).catch(() => {});
      await dwellWithMouseDrift(page, shot.duration, { toX: VIEWPORT.width / 2 - 30, toY: VIEWPORT.height / 2 + 40 });
      break;
    }

    default:
      await dwellWithMouseDrift(page, shot.duration);
  }
}

async function recordWalkthrough(baseUrl, shots) {
  await ensureClean(VIDEO_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
  });
  await context.addInitScript(SEED);
  await context.addInitScript({ content: CURSOR_INIT_SCRIPT });
  const page = await context.newPage();

  log('record', `goto ${baseUrl}`);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  for (const shot of shots) {
    log('record', `shot ${shot.id} (${shot.duration.toFixed(2)}s) — ${shot.action}`);
    const totalSeconds = shot.duration + (shot.padAfter || 0);
    const startedAt = Date.now();
    const target = totalSeconds * 1000;
    await performAction(page, { ...shot, duration: totalSeconds });
    const elapsed = Date.now() - startedAt;
    if (elapsed < target) await sleep(target - elapsed);
  }

  // Flush video.
  const videoHandle = page.video();
  await page.close();
  await context.close();
  await browser.close();
  const webm = await videoHandle.path();
  return webm;
}

// ─────────────────────────────────────────────────────────────────────────
// step 4: mux audio + video

async function concatNarration(shots, outFile) {
  // Build a concat list with silence padding between shots.
  const listFile = path.join(AUDIO_DIR, 'concat.txt');
  const lines = [];
  for (const shot of shots) {
    lines.push(`file '${path.basename(shot.file)}'`);
    if (shot.padAfter && shot.padAfter > 0) {
      const silenceFile = path.join(AUDIO_DIR, `pad-${shot.id}.mp3`);
      await execFile('ffmpeg', [
        '-y', '-f', 'lavfi', '-i', `anullsrc=channel_layout=mono:sample_rate=24000`,
        '-t', shot.padAfter.toFixed(3), '-q:a', '9', silenceFile,
      ]);
      lines.push(`file '${path.basename(silenceFile)}'`);
    }
  }
  await writeFile(listFile, lines.join('\n'));
  await execFile('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0',
    '-i', listFile,
    '-c', 'copy', outFile,
  ]);
}

async function muxFinal(webmPath, audioPath, outPath) {
  await mkdir(path.dirname(outPath), { recursive: true });
  // Encode video to mp4 (h264) and add audio with fade in/out.
  const audioDuration = await probeDuration(audioPath);
  const fadeOutStart = Math.max(0, audioDuration - 0.6).toFixed(3);
  await execFile('ffmpeg', [
    '-y',
    '-i', webmPath,
    '-i', audioPath,
    '-filter_complex',
      `[0:v]fade=t=in:st=0:d=0.5,fade=t=out:st=${fadeOutStart}:d=0.6,format=yuv420p[v];` +
      `[1:a]afade=t=in:st=0:d=0.4,afade=t=out:st=${fadeOutStart}:d=0.6[a]`,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    '-shortest',
    outPath,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────
// main

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let preview;
  try {
    preview = await startPreview();
    const shots = await generateNarration();
    log('plan', shots.map(s => `${s.id}:${s.duration.toFixed(1)}s`).join(' '));

    const webm = await recordWalkthrough(preview.baseUrl, shots);
    log('record', `webm: ${webm}`);

    const audioOut = path.join(AUDIO_DIR, 'narration.mp3');
    await concatNarration(shots, audioOut);
    log('audio', `narration: ${audioOut}`);

    await muxFinal(webm, audioOut, FINAL);
    log('done', FINAL);
  } finally {
    if (preview && preview.proc && !preview.proc.killed) {
      preview.proc.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error('\x1b[31m[fatal]\x1b[0m', err);
  process.exit(1);
});
