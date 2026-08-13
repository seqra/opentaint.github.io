import noisejs from "noisejs";

type Point = { x: number; y: number };

export type HeroFlowLine = {
  d: string;
  active: boolean;
};

type FlowFieldOptions = {
  dense?: boolean;
};

const width = 1200;
const height = 720;
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

/**
 * Seeded Perlin-noise flow field following the canonical process described by
 * Tyler Hobbs: regular starting positions, continuous vector distortion, and
 * small repeated steps through the field. The seed keeps the published hero
 * stable across renders.
 */
export function createHeroFlowField({ dense = false }: FlowFieldOptions = {}): HeroFlowLine[] {
  const noise = new NoiseConstructor(58138);
  const lines: HeroFlowLine[] = [];
  let lineIndex = 0;
  const rowGap = dense ? 48 : 90;
  const columnGap = dense ? 68 : 120;
  const startY = dense ? 24 : 40;
  const startX = dense ? 28 : 60;

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

  for (let row = 0, gridY = startY; gridY < height; row += 1, gridY += rowGap) {
    for (let column = 0, gridX = startX; gridX < width; column += 1, gridX += columnGap) {
      const start = {
        x: gridX + noise.perlin2(column * 0.27 + 31, row * 0.27 + 47) * 34,
        y: gridY + noise.perlin2(column * 0.27 + 71, row * 0.27 + 89) * 22,
      };
      const backward = trace(start, -1).reverse();
      const forward = trace(start, 1);
      lines.push({
        d: catmullRomPath([...backward, start, ...forward]),
        active: lineIndex % (dense ? 7 : 4) === 1,
      });
      lineIndex += 1;
    }
  }

  return lines;
}
