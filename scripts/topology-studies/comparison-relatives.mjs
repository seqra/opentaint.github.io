/**
 * A deterministic scalar-field study for the analyzer-depth comparison.
 *
 * One asymmetric reachability surface is sampled and rendered as a sparse
 * elevation map. Each height band keeps a deliberate gap, with one restrained
 * red contour marking a single deep level.
 */

export const CANVAS = Object.freeze({ width: 1600, height: 1000 });

export const PALETTE = Object.freeze({
  paper: '#f7f7f5',
  paperDeep: '#ececea',
  ink: '#1b1b1d',
  soft: '#66666a',
  secondary: '#8d8582',
  red: '#c92a2a',
});

const SOURCE = 'https://www.paulbourke.net/papers/conrec/';
const VERSION = 'analyzer-depth-topology-3.0.0';
const TAU = Math.PI * 2;

function hashSeed(value) {
  const text = String(value === undefined || value === null ? 'analyzer-depth-topology' : value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
}

function deriveSeed(seed, label) {
  return hashSeed(`${seed}:${label}`);
}

function rngFrom(value) {
  let state = hashSeed(value);
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function fmt(value) {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function smoothPathD(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const first = points[index];
    const second = points[index + 1];
    const next = points[index + 2] || second;
    const controlOne = {
      x: first.x + (second.x - previous.x) / 6,
      y: first.y + (second.y - previous.y) / 6,
    };
    const controlTwo = {
      x: second.x - (next.x - first.x) / 6,
      y: second.y - (next.y - first.y) / 6,
    };
    d += ` C ${fmt(controlOne.x)} ${fmt(controlOne.y)} ${fmt(controlTwo.x)} ${fmt(controlTwo.y)} ${fmt(second.x)} ${fmt(second.y)}`;
  }
  return d;
}

function smoothPath(points, stroke, width, opacity, extra = '') {
  if (points.length < 2) return '';
  return `<path d="${smoothPathD(points)}" fill="none" stroke="${stroke}" stroke-width="${fmt(width)}" opacity="${fmt(opacity)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function svgDocument({ slug, title, description, seed, body }) {
  const titleId = `${slug}-title`;
  const descriptionId = `${slug}-description`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${titleId} ${descriptionId}" data-generator="opentaint-analyzer-depth-topology" data-generator-version="${VERSION}" data-seed="${hashSeed(seed)}" data-study="${escapeXml(slug)}" data-source="${escapeXml(SOURCE)}">
  <title id="${titleId}">${escapeXml(title)}</title>
  <desc id="${descriptionId}">${escapeXml(description)}</desc>
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="${PALETTE.paper}"/>
  ${body}
</svg>
`;
}

function pointKey(point) {
  return `${Math.round(point.x * 100)}:${Math.round(point.y * 100)}`;
}

function interpolate(first, second, firstValue, secondValue, level) {
  const denominator = secondValue - firstValue;
  const ratio = Math.abs(denominator) < 1e-8
    ? 0.5
    : clamp((level - firstValue) / denominator, 0, 1);
  return {
    x: first.x + (second.x - first.x) * ratio,
    y: first.y + (second.y - first.y) * ratio,
  };
}

const EDGE_CORNERS = Object.freeze([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
]);

const CASE_TABLE = Object.freeze({
  0: [],
  1: [[3, 0]],
  2: [[0, 1]],
  3: [[3, 1]],
  4: [[1, 2]],
  5: [[3, 2], [0, 1]],
  6: [[0, 2]],
  7: [[3, 2]],
  8: [[2, 3]],
  9: [[0, 2]],
  10: [[0, 1], [2, 3]],
  11: [[1, 2]],
  12: [[1, 3]],
  13: [[0, 1]],
  14: [[3, 0]],
  15: [],
});

function scalarValue(x, y, phase) {
  const lobes = [
    { cx: 758, cy: 470, rx: 558, ry: 292, weight: 1.02, angle: -0.08 },
    { cx: 436, cy: 578, rx: 284, ry: 228, weight: 0.66, angle: 0.24 },
    { cx: 1152, cy: 390, rx: 366, ry: 236, weight: 0.72, angle: -0.23 },
    { cx: 860, cy: 246, rx: 284, ry: 152, weight: 0.44, angle: 0.16 },
    { cx: 1010, cy: 706, rx: 344, ry: 174, weight: 0.48, angle: -0.12 },
  ];
  let value = 0;
  for (const lobe of lobes) {
    const cosine = Math.cos(lobe.angle);
    const sine = Math.sin(lobe.angle);
    const dx = x - lobe.cx;
    const dy = y - lobe.cy;
    const rotatedX = (dx * cosine - dy * sine) / lobe.rx;
    const rotatedY = (dx * sine + dy * cosine) / lobe.ry;
    value += lobe.weight * Math.exp(-(rotatedX * rotatedX + rotatedY * rotatedY) * 1.13);
  }

  // A broad saddle and two shallow channels prevent the field from becoming
  // a stack of concentric ovals. Their scales are large enough to remain calm
  // at thumbnail size while still bending the extracted levels.
  value -= 0.31 * Math.exp(-(((x - 780) / 360) ** 2 + ((y - 510) / 82) ** 2) * 1.4);
  value -= 0.14 * Math.exp(-(((x - 1110) / 142) ** 2 + ((y - 612) / 270) ** 2) * 1.1);
  value += 0.055 * Math.sin(x * 0.0042 + phase) * Math.cos(y * 0.0031 - phase * 0.6);
  value += 0.032 * Math.sin((x + y) * 0.0027 - phase * 0.8);
  return value;
}

function buildField(seed) {
  const random = rngFrom(deriveSeed(seed, 'surface-phase'));
  const columns = 88;
  const rows = 52;
  const x0 = 84;
  const x1 = 1516;
  const y0 = 132;
  const y1 = 868;
  const phase = random() * TAU;
  const values = [];
  let minimum = Infinity;
  let maximum = -Infinity;

  for (let row = 0; row < rows; row += 1) {
    const y = y0 + (row / (rows - 1)) * (y1 - y0);
    for (let column = 0; column < columns; column += 1) {
      const x = x0 + (column / (columns - 1)) * (x1 - x0);
      const value = scalarValue(x, y, phase);
      values.push(value);
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
  }

  const spread = maximum - minimum || 1;
  return {
    columns,
    rows,
    x0,
    x1,
    y0,
    y1,
    values: values.map((value) => (value - minimum) / spread),
  };
}

function fieldPoint(field, column, row) {
  return {
    x: field.x0 + (column / (field.columns - 1)) * (field.x1 - field.x0),
    y: field.y0 + (row / (field.rows - 1)) * (field.y1 - field.y0),
  };
}

function fieldValue(field, column, row) {
  return field.values[row * field.columns + column];
}

function extractLevel(field, level) {
  const segments = [];
  for (let row = 0; row < field.rows - 1; row += 1) {
    for (let column = 0; column < field.columns - 1; column += 1) {
      const corners = [
        { point: fieldPoint(field, column, row), value: fieldValue(field, column, row) },
        { point: fieldPoint(field, column + 1, row), value: fieldValue(field, column + 1, row) },
        { point: fieldPoint(field, column + 1, row + 1), value: fieldValue(field, column + 1, row + 1) },
        { point: fieldPoint(field, column, row + 1), value: fieldValue(field, column, row + 1) },
      ];
      const mask = corners.reduce(
        (value, corner, index) => value | (corner.value >= level ? 1 << index : 0),
        0,
      );
      let pairs = CASE_TABLE[mask];
      if (mask === 5 || mask === 10) {
        const center = corners.reduce((sum, corner) => sum + corner.value, 0) / corners.length;
        pairs = mask === 5
          ? (center >= level ? [[3, 0], [1, 2]] : [[3, 2], [0, 1]])
          : (center >= level ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]]);
      }
      for (const [firstEdge, secondEdge] of pairs) {
        const [firstA, firstB] = EDGE_CORNERS[firstEdge];
        const [secondA, secondB] = EDGE_CORNERS[secondEdge];
        segments.push([
          interpolate(
            corners[firstA].point,
            corners[firstB].point,
            corners[firstA].value,
            corners[firstB].value,
            level,
          ),
          interpolate(
            corners[secondA].point,
            corners[secondB].point,
            corners[secondA].value,
            corners[secondB].value,
            level,
          ),
        ]);
      }
    }
  }
  return segments;
}

function chainSegments(segments) {
  const adjacency = new Map();
  const vertices = new Map();
  const add = (key, segmentIndex) => {
    if (!adjacency.has(key)) adjacency.set(key, []);
    adjacency.get(key).push(segmentIndex);
  };
  for (const [index, segment] of segments.entries()) {
    const firstKey = pointKey(segment[0]);
    const secondKey = pointKey(segment[1]);
    vertices.set(firstKey, segment[0]);
    vertices.set(secondKey, segment[1]);
    add(firstKey, index);
    add(secondKey, index);
  }

  const used = new Uint8Array(segments.length);
  const traces = [];
  const walk = (startKey, initialSegment) => {
    const points = [vertices.get(startKey)];
    let currentKey = startKey;
    let segmentIndex = initialSegment;
    let closed = false;
    while (segmentIndex !== undefined && segmentIndex >= 0 && !used[segmentIndex]) {
      used[segmentIndex] = 1;
      const segment = segments[segmentIndex];
      const firstKey = pointKey(segment[0]);
      const nextKey = firstKey === currentKey ? pointKey(segment[1]) : firstKey;
      points.push(vertices.get(nextKey));
      currentKey = nextKey;
      if (currentKey === startKey) {
        closed = true;
        points.pop();
        break;
      }
      segmentIndex = (adjacency.get(currentKey) || []).find((candidate) => !used[candidate]);
    }
    if (points.length >= 3) traces.push({ points, closed });
  };

  // Open contours are started first so that the later loop pass cannot steal
  // one of their segments at a grid boundary.
  for (const [key, incident] of adjacency.entries()) {
    if (incident.length === 1 && !used[incident[0]]) walk(key, incident[0]);
  }
  for (let index = 0; index < segments.length; index += 1) {
    if (used[index]) continue;
    const startKey = pointKey(segments[index][0]);
    walk(startKey, index);
  }
  return traces;
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points.slice();
  const squaredTolerance = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const simplifySection = (start, end) => {
    let furthest = -1;
    let maximum = squaredTolerance;
    const first = points[start];
    const last = points[end];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const denominator = dx * dx + dy * dy || 1;
    for (let index = start + 1; index < end; index += 1) {
      const projection = clamp(((points[index].x - first.x) * dx + (points[index].y - first.y) * dy) / denominator, 0, 1);
      const nearest = {
        x: first.x + projection * dx,
        y: first.y + projection * dy,
      };
      const squaredDistance = (points[index].x - nearest.x) ** 2 + (points[index].y - nearest.y) ** 2;
      if (squaredDistance > maximum) {
        maximum = squaredDistance;
        furthest = index;
      }
    }
    if (furthest >= 0) {
      keep[furthest] = 1;
      simplifySection(start, furthest);
      simplifySection(furthest, end);
    }
  };
  simplifySection(0, points.length - 1);
  return points.filter((_, index) => keep[index]);
}

function perimeter(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) total += distance(points[index - 1], points[index]);
  return total;
}

function breakContour(points, closed, contourIndex, seed) {
  if (points.length < 14) return [points];
  const random = rngFrom(deriveSeed(seed, `contour-break-${contourIndex}`));
  const gapLength = Math.max(2, Math.floor(points.length * (0.055 + random() * 0.035)));
  const start = Math.floor((0.16 + random() * 0.68) * (points.length - gapLength));
  if (closed) {
    // Rotate so the missing interval becomes the unclosed seam. This avoids
    // drawing a synthetic straight chord across the deliberate negative space.
    return [points.slice(start + gapLength).concat(points.slice(0, start))];
  }
  return [
    points.slice(0, start),
    points.slice(start + gapLength),
  ].filter((part) => part.length >= 4);
}

function buildContours(field, seed) {
  // Keep the source outside the first band and reserve the upper end of the
  // scalar range for the one trace that reaches the core. Even spacing keeps
  // the levels legible while the analytic lobes make their silhouettes vary.
  const levels = Array.from({ length: 10 }, (_, index) => 0.18 + index * 0.071);
  const contours = [];
  for (const [levelIndex, level] of levels.entries()) {
    const candidates = chainSegments(extractLevel(field, level))
      .map((trace) => ({
        ...trace,
        points: simplify(trace.points, 4.2),
      }))
      .filter((trace) => perimeter(trace.points) > 190)
      .sort((first, second) => perimeter(second.points) - perimeter(first.points));
    if (!candidates.length) continue;
    const primary = candidates[0];
    for (const points of breakContour(primary.points, primary.closed, levelIndex, seed)) {
      if (points.length >= 4) contours.push({ points, levelIndex, level });
    }
  }
  return contours;
}

const CONTOUR_STYLES = Object.freeze([
  { stroke: PALETTE.soft, width: 0.98, opacity: 0.26 },
  { stroke: PALETTE.secondary, width: 1.02, opacity: 0.29 },
  { stroke: PALETTE.soft, width: 1.04, opacity: 0.32 },
  { stroke: PALETTE.ink, width: 1.08, opacity: 0.3 },
  { stroke: PALETTE.secondary, width: 1.1, opacity: 0.34 },
  { stroke: PALETTE.ink, width: 1.14, opacity: 0.36 },
  { stroke: PALETTE.soft, width: 1.18, opacity: 0.39 },
  { stroke: PALETTE.secondary, width: 1.2, opacity: 0.42 },
  { stroke: PALETTE.ink, width: 1.24, opacity: 0.46 },
  { stroke: PALETTE.red, width: 1.55, opacity: 0.56 },
]);

function generateAnalyzerDepthTopology(seed = 0x53454333) {
  const field = buildField(seed);
  const contours = buildContours(field, seed);
  let body = '';
  for (const contour of contours) {
    const style = CONTOUR_STYLES[contour.levelIndex] || CONTOUR_STYLES.at(-1);
    body += smoothPath(contour.points, style.stroke, style.width, style.opacity);
  }

  return svgDocument({
    slug: 'analyzer-depth-topology',
    title: 'Analyzer depth topology',
    description: 'Ten deterministic broken contours map an asymmetric scalar surface, with a restrained red line marking one deep elevation band.',
    seed,
    body,
  });
}

export const comparisonStudies = Object.freeze([
  {
    slug: 'analyzer-depth-topology',
    title: 'Analyzer depth topology',
    description: 'A sparse asymmetric scalar surface rendered as ten broken elevation contours with one deep red band.',
    source: SOURCE,
    generate: generateAnalyzerDepthTopology,
  },
]);

export { generateAnalyzerDepthTopology };
