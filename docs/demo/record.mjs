import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const port = Number(process.env.DEMO_PORT || 4150);
const base = `http://127.0.0.1:${port}/VIM-for-kids/`;
const viewport = { width: 860, height: 540 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startPreview() {
  const server = spawn(
    'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: root, stdio: 'ignore', detached: true }
  );
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) return server;
    } catch {
      await sleep(200);
    }
  }
  throw new Error(`preview server did not start on port ${port}`);
}

async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ channel: 'chrome' });
  }
}

async function record(browser, name, url, setup, scene) {
  const frameDir = mkdtempSync(join(tmpdir(), 'vim-for-kids-demo-'));
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForTimeout(1500);
  for (let i = 0; i < 4; i++) {
    await page.mouse.click(viewport.width / 2, viewport.height / 2);
    await page.waitForTimeout(500);
  }
  await setup(page);

  const frames = [];
  let recording = true;
  const capture = (async () => {
    while (recording) {
      const file = join(frameDir, `${String(frames.length).padStart(5, '0')}.png`);
      await page.screenshot({ path: file });
      frames.push({ file, at: Date.now() });
    }
  })();
  await scene(page);
  recording = false;
  await capture;
  await context.close();

  const list = frames
    .map((frame, i) => {
      const next = frames[i + 1] ? frames[i + 1].at : frame.at + 100;
      return `file '${frame.file}'\nduration ${((next - frame.at) / 1000).toFixed(3)}`;
    })
    .join('\n');
  const listFile = join(frameDir, 'frames.txt');
  writeFileSync(listFile, `${list}\nfile '${frames[frames.length - 1].file}'\n`);

  const gif = join(here, `${name}.gif`);
  const filters =
    `fps=8,split[a][b];` +
    `[a]palettegen=max_colors=64:stats_mode=full[p];` +
    `[b][p]paletteuse=dither=none:diff_mode=rectangle`;
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listFile,
    '-filter_complex',
    filters,
    gif,
  ]);
  rmSync(frameDir, { recursive: true, force: true });
  console.info(`recorded ${gif}`);
}

async function keys(page, sequence, delay) {
  for (const key of sequence) {
    await page.keyboard.press(key);
    await page.waitForTimeout(delay);
  }
}

const server = await startPreview();
const browser = await launchBrowser();
try {
  await record(
    browser,
    'learn-hjkl',
    base,
    async (page) => page.waitForTimeout(500),
    async (page) => {
      await page.waitForTimeout(900);
      for (const [step, hold] of [
        [['h'], 1500],
        [['l', 'l'], 1100],
        [['h', 'k'], 1100],
        [['j', 'j'], 1100],
      ]) {
        await keys(page, step, 450);
        await page.waitForTimeout(hold);
        await keys(page, ['Escape'], 400);
      }
      await page.waitForTimeout(700);
    }
  );

  await record(
    browser,
    'bump-to-talk',
    base,
    async (page) => {
      await keys(page, ['h', 'Escape', 'l', 'l', 'Escape', 'h', 'k', 'Escape'], 400);
      await keys(page, ['j', 'j', 'Escape', 'k'], 400);
      await page.waitForTimeout(800);
    },
    async (page) => {
      await page.waitForTimeout(1200);
      await keys(page, ['l', 'l', 'l'], 450);
      await keys(page, ['l'], 3500);
      await keys(page, ['j', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'], 260);
      await page.waitForTimeout(1200);
    }
  );

  await record(
    browser,
    'word-jumps',
    `${base}?game=cursor-before-clickers&level=level_2`,
    async (page) => {
      await keys(page, Array(40).fill('l'), 200);
      await page.waitForTimeout(800);
    },
    async (page) => {
      await page.waitForTimeout(800);
      await keys(page, ['w'], 2200);
      await keys(page, ['l', 'l', 'l', 'l', 'l', 'l', 'k', 'k', 'k', 'k', 'k', 'l', 'l'], 260);
      await page.waitForTimeout(600);
      await keys(page, ['w', 'w', 'w', 'w'], 900);
      await keys(page, ['e'], 1100);
      await keys(page, ['w', 'w'], 900);
      await keys(page, ['b'], 900);
      await page.waitForTimeout(1000);
    }
  );
} finally {
  await browser.close();
  process.kill(-server.pid);
}
