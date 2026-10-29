// Records the figure animations for "SAST Is Dead, Long Live SAST!" as MP4s.
// Each scene is a deterministic function of time, so every frame is rendered
// exactly rather than captured in real time.
//
//   node scripts/sast-is-dead-videos/render.mjs [scene ...]
//
// Writes public/videos/sast-is-dead/<scene>-<layout>-<theme>.{mp4,png}.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const OUT = join(ROOT, "public/videos/sast-is-dead");
const SCENES = ["taint-flow", "cost-of-change", "every-commit"];
const LAYOUTS = ["wide", "tall"];
const THEMES = ["light", "dark"];
const FPS = 30;
const SCALE = 2;
// The page shows each video edge to edge across the figure panel's sides and
// bottom, so the browser's controls span the whole panel. Each render carries
// the panel's own padding as empty margin (viewBox units at the size it is
// shown: 32px on wide screens, 16px sides and 24px bottom on phones), keeping
// the drawing where the padding would have put it.
const MARGIN = { wide: { side: 32, bottom: 32 }, tall: { side: 19, bottom: 28 } };
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".woff2": "font/woff2" };

const serve = () =>
  new Promise((done) => {
    const server = createServer((request, response) => {
      const path = normalize(join(ROOT, decodeURIComponent(new URL(request.url, "http://x").pathname)));
      if (!path.startsWith(ROOT)) {
        response.writeHead(403).end();
        return;
      }
      try {
        const body = readFileSync(path);
        response.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }).end(body);
      } catch {
        response.writeHead(404).end();
      }
    });
    server.listen(0, () => done(server));
  });

const record = async (browser, port, scene, layout, theme) => {
  const page = await browser.newPage({ deviceScaleFactor: SCALE });
  const url = `http://localhost:${port}/scripts/sast-is-dead-videos/stage.html?scene=${scene}&layout=${layout}&theme=${theme}`;
  await page.goto(url);
  await page.waitForFunction(() => window.ready === true);
  const margin = MARGIN[layout];
  const { width, height, duration, poster } = await page.evaluate(({ side, bottom }) => {
    const { scene } = window;
    const svg = document.getElementById("stage");
    const width = scene.width + 2 * side;
    const height = scene.height + bottom;
    svg.setAttribute("viewBox", `${-side} 0 ${width} ${height}`);
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    return { width, height, duration: scene.duration, poster: scene.poster };
  }, margin);
  await page.setViewportSize({ width, height });
  const frames = mkdtempSync(join(tmpdir(), `${scene}-`));
  const total = Math.round(duration * FPS);
  for (let i = 0; i < total; i += 1) {
    await page.evaluate((t) => window.scene.render(t), i / FPS);
    writeFileSync(join(frames, `${String(i).padStart(4, "0")}.png`), await page.screenshot({ type: "png" }));
  }
  const name = join(OUT, `${scene}-${layout}-${theme}`);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-framerate", String(FPS), "-i", join(frames, "%04d.png"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-movflags", "+faststart", `${name}.mp4`,
  ]);
  await page.evaluate((t) => window.scene.render(t), poster);
  writeFileSync(`${name}.png`, await page.screenshot({ type: "png" }));
  rmSync(frames, { recursive: true, force: true });
  await page.close();
  console.log(`${scene} ${layout} ${theme}: ${total} frames`);
};

const selected = process.argv.slice(2).length > 0 ? process.argv.slice(2) : SCENES;
mkdirSync(OUT, { recursive: true });
const server = await serve();
const browser = await chromium.launch();
try {
  for (const scene of selected) {
    for (const layout of LAYOUTS) {
      for (const theme of THEMES) await record(browser, server.address().port, scene, layout, theme);
    }
  }
} finally {
  await browser.close();
  server.close();
}
