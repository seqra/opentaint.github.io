import noisejs from "noisejs";

type Point = { x: number; y: number };

export type HeroFlowLine = {
  d: string;
  active: boolean;
};

type FlowFieldOptions = {
  height?: number;
  noiseOffset?: number;
  pathStyle?: "cubic" | "linear";
};

export const HERO_FLOW_FIELD_WIDTH = 1200;
export const HERO_FLOW_FIELD_DESKTOP_HEIGHT = 2290;
export const HERO_FLOW_FIELD_TABLET_HEIGHT = 4000;
export const HERO_FLOW_FIELD_MOBILE_HEIGHT = 3430;

const width = HERO_FLOW_FIELD_WIDTH;
const defaultHeight = 720;
const noiseScale = 0.0035;
const stepLength = 3.5;
const maxSteps = 64;

type NoiseGenerator = { perlin2: (x: number, y: number) => number };
const NoiseConstructor = (noisejs as unknown as {
  Noise: new (seed?: number) => NoiseGenerator;
}).Noise;

const round = (value: number) => Math.round(value * 10) / 10;

/** Convert sampled streamline vertices to the standard Catmull–Rom cubic form. */
function catmullRomPath(points: Point[]) {
  if (points.length < 2) return "";

  const commands = [`M${round(points[0].x)} ${round(points[0].y)}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const following = points[index + 2] ?? next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    };
    commands.push(
      `C${round(controlOne.x)} ${round(controlOne.y)} ${round(controlTwo.x)} ${round(controlTwo.y)} ${round(next.x)} ${round(next.y)}`,
    );
  }

  return commands.join(" ");
}

function linearPath(points: Point[]) {
  if (points.length < 2) return "";

  return `M${round(points[0].x)} ${round(points[0].y)} L${points
    .slice(1)
    .map((point) => `${round(point.x)} ${round(point.y)}`)
    .join(" ")}`;
}

/**
 * Seeded Perlin-noise flow field following the canonical process described by
 * Tyler Hobbs: regular starting positions, continuous vector distortion, and
 * small repeated steps through the field. The seed keeps the published hero
 * stable across renders.
 */
export function createHeroFlowField({
  height = defaultHeight,
  noiseOffset = 0,
  pathStyle = "cubic",
}: FlowFieldOptions = {}): HeroFlowLine[] {
  const noise = new NoiseConstructor(58138);
  const lines: HeroFlowLine[] = [];
  let lineIndex = 0;

  const trace = (start: Point, direction: 1 | -1) => {
    const points: Point[] = [];
    let { x, y } = start;

    for (let step = 0; step < maxSteps; step += 1) {
      const distortion = noise.perlin2(
        x * noiseScale + noiseOffset,
        y * noiseScale + noiseOffset * 0.7,
      );
      const angle = distortion * Math.PI * 1.35 + (direction === -1 ? Math.PI : 0);
      x += Math.cos(angle) * stepLength;
      y += Math.sin(angle) * stepLength;
      points.push({ x, y });
      if (y < -32 || y > height + 32 || x < -80 || x > width + 80) break;
    }

    return points;
  };

  for (let row = 0, gridY = 40; gridY < height; row += 1, gridY += 90) {
    for (let column = 0, gridX = 60; gridX < width; column += 1, gridX += 120) {
      const start = {
        x: gridX + noise.perlin2(column * 0.27 + 31, row * 0.27 + 47) * 34,
        y: gridY + noise.perlin2(column * 0.27 + 71, row * 0.27 + 89) * 22,
      };
      const backward = trace(start, -1).reverse();
      const forward = trace(start, 1);
      lines.push({
        d: pathStyle === "linear"
          ? linearPath([...backward, start, ...forward])
          : catmullRomPath([...backward, start, ...forward]),
        active: lineIndex % 4 === 1,
      });
      lineIndex += 1;
    }
  }

  return lines;
}

export function renderHeroFlowFieldSvg(height: number) {
  // The 3.5-unit samples are already close enough to render as a smooth line.
  // A compact linear path keeps this decorative field out of the page HTML
  // and reduces its transfer size without changing its generated trajectory.
  const flowLines = createHeroFlowField({ height, pathStyle: "linear" });
  const basePath = flowLines.map((line) => line.d).join(" ");
  const activePaths = Array.from({ length: 3 }, (_, phase) => flowLines
    .filter((line, index) => line.active && index % 3 === phase)
    .map((line) => line.d)
    .join(" "));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="96%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="field-mask"><rect width="${width}" height="${height}" fill="url(#fade)"/></mask></defs><g mask="url(#field-mask)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="${basePath}" stroke-width="1" opacity=".34"/>${activePaths.map((path, phase) => `<path d="${path}" stroke-width="1.5" stroke-dasharray="8 18" stroke-dashoffset="${phase * -8.667}"/>`).join("")}</g></svg>`;
}
