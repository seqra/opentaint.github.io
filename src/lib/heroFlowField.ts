import noisejs from "noisejs";

type Point = { x: number; y: number };

export type HeroFlowLine = {
  d: string;
  active: boolean;
};

type FlowFieldOptions = {
  height?: number;
};

const width = 1200;
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

  /* Every other simulation point is enough to preserve the flow field's
     silhouette. Quadratic mid-point smoothing keeps the curves fluid while
     cutting the landing document's inline SVG data by roughly two thirds. */
  const sampled = points.filter((_, index) => index % 2 === 0 || index === points.length - 1);
  const commands = [`M${round(sampled[0].x)} ${round(sampled[0].y)}`];
  for (let index = 1; index < sampled.length - 1; index += 1) {
    const current = sampled[index];
    const next = sampled[index + 1];
    commands.push(
      `Q${round(current.x)} ${round(current.y)} ${round((current.x + next.x) / 2)} ${round((current.y + next.y) / 2)}`,
    );
  }
  const last = sampled[sampled.length - 1];
  commands.push(`L${round(last.x)} ${round(last.y)}`);

  return commands.join(" ");
}

/**
 * Seeded Perlin-noise flow field following the canonical process described by
 * Tyler Hobbs: regular starting positions, continuous vector distortion, and
 * small repeated steps through the field. The seed keeps the published hero
 * stable across renders.
 */
export function createHeroFlowField({ height = defaultHeight }: FlowFieldOptions = {}): HeroFlowLine[] {
  const noise = new NoiseConstructor(58138);
  const lines: HeroFlowLine[] = [];
  let lineIndex = 0;

  const trace = (start: Point, direction: 1 | -1) => {
    const points: Point[] = [];
    let { x, y } = start;

    for (let step = 0; step < maxSteps; step += 1) {
      const distortion = noise.perlin2(x * noiseScale, y * noiseScale);
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
        d: catmullRomPath([...backward, start, ...forward]),
        active: lineIndex % 4 === 1,
      });
      lineIndex += 1;
    }
  }

  return lines;
}
