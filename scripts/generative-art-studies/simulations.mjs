/*
 * Standalone deterministic SVG studies.
 *
 * Each study deliberately keeps the rendering vocabulary small: a warm paper
 * ground, accumulated ink/clay marks, and a restrained vermilion accent. The
 * algorithms are seeded, contain no time or browser dependencies, and return
 * self-contained SVG documents at the shared 1600 x 1000 canvas size.
 */

export const CANVAS = Object.freeze({ width: 1600, height: 1000 });

export const PALETTE = Object.freeze({
  paper: '#f4efe6',
  paperDeep: '#e8ddcd',
  ink: '#171819',
  inkSoft: '#5b5550',
  clay: '#a5826e',
  red: '#b63b34',
  redDark: '#77231f',
});

const TAU = Math.PI * 2;

function hashSeed(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return (value >>> 0) || 1;
  }
  const text = String(value === undefined || value === null ? 'study' : value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
}

function rngFrom(value) {
  let state = hashSeed(value);
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fmt(value) {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function point(x, y) {
  return { x, y };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pointPath(points, close) {
  if (!points || points.length === 0) return '';
  let d = 'M ' + fmt(points[0].x) + ' ' + fmt(points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    d += ' L ' + fmt(points[index].x) + ' ' + fmt(points[index].y);
  }
  if (close) d += ' Z';
  return d;
}

function openCatmullRom(points, tension) {
  if (points.length < 2) return pointPath(points, false);
  const factor = tension === undefined ? 1 : tension;
  let d = 'M ' + fmt(points[0].x) + ' ' + fmt(points[0].y);
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const c1 = point(
      p1.x + ((p2.x - p0.x) / 6) * factor,
      p1.y + ((p2.y - p0.y) / 6) * factor,
    );
    const c2 = point(
      p2.x - ((p3.x - p1.x) / 6) * factor,
      p2.y - ((p3.y - p1.y) / 6) * factor,
    );
    d +=
      ' C ' +
      fmt(c1.x) +
      ' ' +
      fmt(c1.y) +
      ', ' +
      fmt(c2.x) +
      ' ' +
      fmt(c2.y) +
      ', ' +
      fmt(p2.x) +
      ' ' +
      fmt(p2.y);
  }
  return d;
}

function closedCatmullRom(points, tension) {
  if (points.length < 3) return pointPath(points, true);
  const factor = tension === undefined ? 1 : tension;
  let d = 'M ' + fmt(points[0].x) + ' ' + fmt(points[0].y);
  for (let index = 0; index < points.length; index += 1) {
    const p0 = points[(index - 1 + points.length) % points.length];
    const p1 = points[index];
    const p2 = points[(index + 1) % points.length];
    const p3 = points[(index + 2) % points.length];
    const c1 = point(
      p1.x + ((p2.x - p0.x) / 6) * factor,
      p1.y + ((p2.y - p0.y) / 6) * factor,
    );
    const c2 = point(
      p2.x - ((p3.x - p1.x) / 6) * factor,
      p2.y - ((p3.y - p1.y) / 6) * factor,
    );
    d +=
      ' C ' +
      fmt(c1.x) +
      ' ' +
      fmt(c1.y) +
      ', ' +
      fmt(c2.x) +
      ' ' +
      fmt(c2.y) +
      ', ' +
      fmt(p2.x) +
      ' ' +
      fmt(p2.y);
  }
  return d + ' Z';
}

function simplify(points, tolerance) {
  if (points.length < 3) return points.slice();
  const squaredTolerance = tolerance * tolerance;
  const result = [points[0]];
  let previous = points[0];
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    if (dx * dx + dy * dy >= squaredTolerance) {
      result.push(current);
      previous = current;
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

function svgDocument(slug, title, description, seed, body) {
  const titleId = slug + '-title';
  const descriptionId = slug + '-description';
  const numericSeed = hashSeed(seed);
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    CANVAS.width +
    '" height="' +
    CANVAS.height +
    '" viewBox="0 0 ' +
    CANVAS.width +
    ' ' +
    CANVAS.height +
    '" role="img" aria-labelledby="' +
    titleId +
    ' ' +
    descriptionId +
    '" data-generator="algorithmic-study-v1" data-seed="' +
    numericSeed +
    '">' +
    '<title id="' +
    titleId +
    '">' +
    escapeXml(title) +
    '</title>' +
    '<desc id="' +
    descriptionId +
    '">' +
    escapeXml(description) +
    '</desc>' +
    '<rect width="' +
    CANVAS.width +
    '" height="' +
    CANVAS.height +
    '" fill="' +
    PALETTE.paper +
    '"/>' +
    body +
    '</svg>\n'
  );
}

function gridIndex(column, row, columns) {
  return row * columns + column;
}

function contourSegments(field, columns, rows, level, bounds) {
  const cases = {
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
    12: [[3, 1]],
    13: [[0, 1]],
    14: [[3, 0]],
    15: [],
  };
  const segments = [];
  const xStep = bounds.width / (columns - 1);
  const yStep = bounds.height / (rows - 1);

  function intersection(edge, x, y, values) {
    const edgePoints = [
      [x, y, x + 1, y],
      [x + 1, y, x + 1, y + 1],
      [x + 1, y + 1, x, y + 1],
      [x, y + 1, x, y],
    ];
    const pair = edgePoints[edge];
    const first = edge;
    const second = (edge + 1) % 4;
    const t = clamp((level - values[first]) / (values[second] - values[first] || 1e-9), 0, 1);
    return point(
      bounds.x + (pair[0] + (pair[2] - pair[0]) * t) * xStep,
      bounds.y + (pair[1] + (pair[3] - pair[1]) * t) * yStep,
    );
  }

  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const values = [
        field[gridIndex(column, row, columns)],
        field[gridIndex(column + 1, row, columns)],
        field[gridIndex(column + 1, row + 1, columns)],
        field[gridIndex(column, row + 1, columns)],
      ];
      const mask =
        (values[0] >= level ? 1 : 0) |
        (values[1] >= level ? 2 : 0) |
        (values[2] >= level ? 4 : 0) |
        (values[3] >= level ? 8 : 0);
      const table = cases[mask];
      for (let pairIndex = 0; pairIndex < table.length; pairIndex += 1) {
        const pair = table[pairIndex];
        segments.push([
          intersection(pair[0], column, row, values),
          intersection(pair[1], column, row, values),
        ]);
      }
    }
  }
  return segments;
}

function endpointKey(value) {
  return Math.round(value.x * 10) + ',' + Math.round(value.y * 10);
}

function stitchSegments(segments, minimumPoints) {
  const endpointMap = new Map();
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const firstKey = endpointKey(segment[0]);
    const secondKey = endpointKey(segment[1]);
    if (!endpointMap.has(firstKey)) endpointMap.set(firstKey, []);
    if (!endpointMap.has(secondKey)) endpointMap.set(secondKey, []);
    endpointMap.get(firstKey).push(index);
    endpointMap.get(secondKey).push(index);
  }
  const used = new Uint8Array(segments.length);
  const paths = [];

  function extend(chain, atEnd) {
    const current = atEnd ? chain[chain.length - 1] : chain[0];
    const candidates = endpointMap.get(endpointKey(current)) || [];
    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
      const segmentIndex = candidates[candidateIndex];
      if (used[segmentIndex]) continue;
      used[segmentIndex] = 1;
      const segment = segments[segmentIndex];
      const next =
        endpointKey(segment[0]) === endpointKey(current) ? segment[1] : segment[0];
      if (atEnd) chain.push(next);
      else chain.unshift(next);
      return true;
    }
    return false;
  }

  for (let index = 0; index < segments.length; index += 1) {
    if (used[index]) continue;
    used[index] = 1;
    const chain = [segments[index][0], segments[index][1]];
    while (extend(chain, true)) {
      if (chain.length > 1500) break;
    }
    while (extend(chain, false)) {
      if (chain.length > 1500) break;
    }
    if (chain.length >= (minimumPoints || 3)) {
      paths.push(simplify(chain, 1.1));
    }
  }
  return paths;
}

function generateGrayScott(seed) {
  const random = rngFrom(String(seed) + ':gray-scott');
  const columns = 128;
  const rows = 80;
  const total = columns * rows;
  let u = new Float64Array(total);
  let v = new Float64Array(total);
  u.fill(1);

  for (let index = 0; index < 11; index += 1) {
    const centerX = 12 + random() * (columns - 24);
    const centerY = 10 + random() * (rows - 20);
    const radiusX = 3.5 + random() * 8;
    const radiusY = 3.5 + random() * 11;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const dx = (column - centerX) / radiusX;
        const dy = (row - centerY) / radiusY;
        const influence = Math.exp(-(dx * dx + dy * dy) * 1.6);
        const cell = gridIndex(column, row, columns);
        v[cell] = Math.max(v[cell], influence * (0.58 + random() * 0.18));
        u[cell] = Math.min(u[cell], 1 - influence * 0.52);
      }
    }
  }

  for (let row = 9; row < rows; row += 17) {
    for (let column = 0; column < columns; column += 1) {
      const cell = gridIndex(column, row, columns);
      const band = 0.07 + 0.04 * Math.sin(column * 0.21 + row * 0.13);
      v[cell] = Math.max(v[cell], band * (0.75 + random() * 0.45));
    }
  }

  let nextU = new Float64Array(total);
  let nextV = new Float64Array(total);
  const feed = 0.035 + (random() - 0.5) * 0.003;
  const kill = 0.061 + (random() - 0.5) * 0.003;
  const du = 0.16;
  const dv = 0.08;

  function sample(array, column, row) {
    const wrappedColumn = (column + columns) % columns;
    const boundedRow = clamp(row, 0, rows - 1);
    return array[gridIndex(wrappedColumn, boundedRow, columns)];
  }

  for (let iteration = 0; iteration < 280; iteration += 1) {
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const cell = gridIndex(column, row, columns);
        const currentU = u[cell];
        const currentV = v[cell];
        const laplaceU =
          sample(u, column - 1, row) +
          sample(u, column + 1, row) +
          sample(u, column, row - 1) +
          sample(u, column, row + 1) -
          4 * currentU;
        const laplaceV =
          sample(v, column - 1, row) +
          sample(v, column + 1, row) +
          sample(v, column, row - 1) +
          sample(v, column, row + 1) -
          4 * currentV;
        const reaction = currentU * currentV * currentV;
        nextU[cell] = clamp(currentU + du * laplaceU - reaction + feed * (1 - currentU), 0, 1);
        nextV[cell] = clamp(currentV + dv * laplaceV + reaction - (feed + kill) * currentV, 0, 1);
      }
    }
    const oldU = u;
    const oldV = v;
    u = nextU;
    v = nextV;
    nextU = oldU;
    nextV = oldV;
  }

  const bounds = { x: 85, y: 96, width: 1430, height: 808 };
  const levels = [0.16, 0.29, 0.42];
  const colors = [PALETTE.clay, PALETTE.inkSoft, PALETTE.ink];
  let body =
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">';
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex += 1) {
    const segments = contourSegments(v, columns, rows, levels[levelIndex], bounds);
    const paths = stitchSegments(segments, 3);
    let neutral = '';
    let red = '';
    for (let pathIndex = 0; pathIndex < paths.length; pathIndex += 1) {
      const path = paths[pathIndex];
      if (
        levelIndex === levels.length - 1 &&
        path.length > 14 &&
        pathIndex % Math.max(5, Math.floor(paths.length / 8)) === 1
      ) {
        red += '<path d="' + openCatmullRom(path, 0.8) + '"/>';
      } else {
        neutral += '<path d="' + openCatmullRom(path, 0.72) + '"/>';
      }
    }
    body +=
      '<g stroke="' +
      colors[levelIndex] +
      '" stroke-width="' +
      (levelIndex === levels.length - 1 ? '1.55' : levelIndex === 1 ? '1.05' : '0.72') +
      '" opacity="' +
      (0.62 + levelIndex * 0.1).toFixed(2) +
      '">' +
      neutral +
      '</g>';
    if (red) {
      body +=
        '<g stroke="' +
        PALETTE.red +
        '" stroke-width="1.9" opacity=".82">' +
        red +
        '</g>';
    }
  }
  body += '</g>';

  return svgDocument(
    'gray-scott-contours',
    'Gray–Scott contour study',
    'A deterministic reaction–diffusion field rendered as layered cellular contours on warm paper.',
    seed,
    body,
  );
}

function growContour(seed, settings) {
  const random = rngFrom(String(seed) + ':' + settings.name);
  const count = settings.count;
  const center = { x: settings.cx, y: settings.cy };
  const points = [];
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * TAU;
    const wobble = 1 + (random() - 0.5) * 0.12;
    points.push(
      point(
        center.x + Math.cos(angle) * settings.rx * wobble,
        center.y + Math.sin(angle) * settings.ry * wobble,
      ),
    );
  }
  const history = [points.map((item) => point(item.x, item.y))];
  const targetLength = ((settings.rx + settings.ry) * Math.PI) / count;

  for (let iteration = 0; iteration < settings.iterations; iteration += 1) {
    const next = [];
    for (let index = 0; index < count; index += 1) {
      const current = points[index];
      const previous = points[(index - 1 + count) % count];
      const following = points[(index + 1) % count];
      let forceX = 0;
      let forceY = 0;

      const previousDistance = distance(current, previous) || 1;
      const followingDistance = distance(current, following) || 1;
      forceX +=
        ((previous.x - current.x) / previousDistance) *
        (previousDistance - targetLength) *
        0.025;
      forceY +=
        ((previous.y - current.y) / previousDistance) *
        (previousDistance - targetLength) *
        0.025;
      forceX +=
        ((following.x - current.x) / followingDistance) *
        (followingDistance - targetLength) *
        0.025;
      forceY +=
        ((following.y - current.y) / followingDistance) *
        (followingDistance - targetLength) *
        0.025;

      for (let otherIndex = 0; otherIndex < count; otherIndex += 1) {
        if (
          otherIndex === index ||
          otherIndex === (index - 1 + count) % count ||
          otherIndex === (index + 1) % count
        ) {
          continue;
        }
        const other = points[otherIndex];
        const dx = current.x - other.x;
        const dy = current.y - other.y;
        const squared = dx * dx + dy * dy;
        if (squared < 14500 && squared > 0.01) {
          const push = (targetLength * targetLength) / (squared + 18) * 0.17;
          forceX += (dx / Math.sqrt(squared)) * push;
          forceY += (dy / Math.sqrt(squared)) * push;
        }
      }

      const angle = (index / count) * TAU;
      const targetX =
        center.x +
        Math.cos(angle) *
          settings.rx *
          (1 + 0.09 * Math.sin(angle * 3 + settings.phase));
      const targetY =
        center.y +
        Math.sin(angle) *
          settings.ry *
          (1 + 0.09 * Math.cos(angle * 2 - settings.phase));
      forceX += (targetX - current.x) * 0.006;
      forceY += (targetY - current.y) * 0.006;

      const swirl = Math.sin(iteration * 0.09 + index * 0.33 + settings.phase);
      forceX += -Math.sin(angle) * swirl * 0.055;
      forceY += Math.cos(angle) * swirl * 0.055;
      next.push(point(current.x + forceX, current.y + forceY));
    }
    for (let index = 0; index < count; index += 1) {
      points[index] = next[index];
    }
    if (iteration % settings.snapshotEvery === 0 || iteration === settings.iterations - 1) {
      history.push(points.map((item) => point(item.x, item.y)));
    }
  }
  return { history, points };
}

function generateDifferentialGrowth(seed) {
  const random = rngFrom(String(seed) + ':growth');
  const first = growContour(seed, {
    name: 'outer',
    count: 92,
    cx: 830,
    cy: 502,
    rx: 545,
    ry: 322,
    phase: random() * TAU,
    iterations: 88,
    snapshotEvery: 22,
  });
  const second = growContour(seed, {
    name: 'inner',
    count: 64,
    cx: 610 + random() * 180,
    cy: 520 + (random() - 0.5) * 60,
    rx: 255 + random() * 70,
    ry: 155 + random() * 45,
    phase: random() * TAU,
    iterations: 72,
    snapshotEvery: 24,
  });
  const third = growContour(seed, {
    name: 'satellite',
    count: 44,
    cx: 1230 + (random() - 0.5) * 90,
    cy: 270 + (random() - 0.5) * 90,
    rx: 138 + random() * 40,
    ry: 92 + random() * 30,
    phase: random() * TAU,
    iterations: 64,
    snapshotEvery: 32,
  });

  const systems = [first, second, third];
  let body =
    '<g fill="none" stroke-linejoin="round" stroke-linecap="round">';
  const colors = [PALETTE.clay, PALETTE.inkSoft, PALETTE.ink];
  for (let systemIndex = 0; systemIndex < systems.length; systemIndex += 1) {
    const system = systems[systemIndex];
    for (let historyIndex = 0; historyIndex < system.history.length; historyIndex += 1) {
      const ring = system.history[historyIndex];
      const progress = historyIndex / Math.max(1, system.history.length - 1);
      const stroke = historyIndex === system.history.length - 1 ? PALETTE.ink : colors[systemIndex];
      const width = historyIndex === system.history.length - 1 ? 1.55 : 0.72;
      const opacity = 0.3 + progress * 0.48;
      body +=
        '<path d="' +
        closedCatmullRom(ring, 0.88) +
        '" stroke="' +
        stroke +
        '" stroke-width="' +
        width.toFixed(2) +
        '" opacity="' +
        opacity.toFixed(2) +
        '"/>';
    }
  }

  const accent = first.points
    .slice(12, 31)
    .map((item) => point(item.x, item.y));
  body +=
    '<path d="' +
    openCatmullRom(accent, 0.9) +
    '" fill="none" stroke="' +
    PALETTE.red +
    '" stroke-width="2.1" opacity=".86"/>';
  body +=
    '</g>';

  return svgDocument(
    'differential-growth-contours',
    'Differential growth contour study',
    'A deterministic family of repelling, spring-linked contours with nested growth histories.',
    seed,
    body,
  );
}

function clipPolygon(polygon, a, b) {
  const clipped = [];
  if (polygon.length === 0) return clipped;
  const coefficientX = 2 * (b.x - a.x);
  const coefficientY = 2 * (b.y - a.y);
  const constant =
    b.x * b.x +
    b.y * b.y -
    a.x * a.x -
    a.y * a.y;
  const inside = (item) => coefficientX * item.x + coefficientY * item.y <= constant + 1e-7;
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const previous = polygon[(index - 1 + polygon.length) % polygon.length];
    const currentInside = inside(current);
    const previousInside = inside(previous);
    if (currentInside !== previousInside) {
      const denominator =
        coefficientX * (current.x - previous.x) +
        coefficientY * (current.y - previous.y);
      const amount =
        Math.abs(denominator) < 1e-9
          ? 0
          : (constant - coefficientX * previous.x - coefficientY * previous.y) / denominator;
      clipped.push(
        point(
          previous.x + (current.x - previous.x) * amount,
          previous.y + (current.y - previous.y) * amount,
        ),
      );
    }
    if (currentInside) clipped.push(current);
  }
  return clipped;
}

function voronoiCell(site, sites, bounds) {
  let polygon = [
    point(bounds.x, bounds.y),
    point(bounds.x + bounds.width, bounds.y),
    point(bounds.x + bounds.width, bounds.y + bounds.height),
    point(bounds.x, bounds.y + bounds.height),
  ];
  for (let index = 0; index < sites.length; index += 1) {
    if (sites[index] === site) continue;
    polygon = clipPolygon(polygon, site, sites[index]);
    if (polygon.length === 0) break;
  }
  return polygon;
}

function generateSites(seed, bounds) {
  const random = rngFrom(String(seed) + ':sites');
  const sites = [];
  const minimumDistance = 112;
  let attempts = 0;
  while (sites.length < 44 && attempts < 1400) {
    attempts += 1;
    const candidate = point(
      bounds.x + 28 + random() * (bounds.width - 56),
      bounds.y + 28 + random() * (bounds.height - 56),
    );
    let valid = true;
    for (let index = 0; index < sites.length; index += 1) {
      if (distance(candidate, sites[index]) < minimumDistance) {
        valid = false;
        break;
      }
    }
    if (valid) sites.push(candidate);
  }
  return sites;
}

function circumcircle(a, b, c) {
  const denominator = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(denominator) < 1e-8) return null;
  const aa = a.x * a.x + a.y * a.y;
  const bb = b.x * b.x + b.y * b.y;
  const cc = c.x * c.x + c.y * c.y;
  const center = point(
    (aa * (b.y - c.y) + bb * (c.y - a.y) + cc * (a.y - b.y)) / denominator,
    (aa * (c.x - b.x) + bb * (a.x - c.x) + cc * (b.x - a.x)) / denominator,
  );
  const radiusSquared = (center.x - a.x) ** 2 + (center.y - a.y) ** 2;
  return { center, radiusSquared };
}

function delaunayEdges(sites) {
  const edges = new Map();
  for (let first = 0; first < sites.length - 2; first += 1) {
    for (let second = first + 1; second < sites.length - 1; second += 1) {
      for (let third = second + 1; third < sites.length; third += 1) {
        const orientation =
          (sites[second].x - sites[first].x) * (sites[third].y - sites[first].y) -
          (sites[second].y - sites[first].y) * (sites[third].x - sites[first].x);
        if (Math.abs(orientation) < 1e-7) continue;
        const circle = circumcircle(sites[first], sites[second], sites[third]);
        if (!circle) continue;
        let empty = true;
        for (let other = 0; other < sites.length; other += 1) {
          if (other === first || other === second || other === third) continue;
          const dx = sites[other].x - circle.center.x;
          const dy = sites[other].y - circle.center.y;
          if (dx * dx + dy * dy < circle.radiusSquared - 0.5) {
            empty = false;
            break;
          }
        }
        if (!empty) continue;
        const triangleEdges = [
          [first, second],
          [second, third],
          [third, first],
        ];
        for (let edgeIndex = 0; edgeIndex < triangleEdges.length; edgeIndex += 1) {
          const edge = triangleEdges[edgeIndex];
          const key = Math.min(edge[0], edge[1]) + ':' + Math.max(edge[0], edge[1]);
          if (!edges.has(key)) edges.set(key, edge);
        }
      }
    }
  }
  return Array.from(edges.values());
}

function polygonPath(polygon) {
  return pointPath(polygon, true);
}

function generateVoronoiField(seed) {
  const bounds = { x: 84, y: 86, width: 1432, height: 828 };
  const sites = generateSites(seed, bounds);
  const cells = sites.map((site) => voronoiCell(site, sites, bounds));
  const edges = delaunayEdges(sites);
  const fills = [PALETTE.paper, PALETTE.paperDeep, '#eee5d8'];
  let body =
    '<g stroke-linejoin="round" stroke-linecap="round">';
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    if (cell.length < 3) continue;
    const isAccent = index === Math.floor(sites.length * 0.62);
    body +=
      '<path d="' +
      polygonPath(cell) +
      '" fill="' +
      (isAccent ? '#ead1c5' : fills[index % fills.length]) +
      '" stroke="' +
      (isAccent ? PALETTE.redDark : PALETTE.inkSoft) +
      '" stroke-width="' +
      (isAccent ? '1.8' : '0.95') +
      '" opacity=".82"/>';
  }
  let network = '';
  for (let index = 0; index < edges.length; index += 1) {
    const edge = edges[index];
    const first = sites[edge[0]];
    const second = sites[edge[1]];
    network +=
      'M ' +
      fmt(first.x) +
      ' ' +
      fmt(first.y) +
      ' L ' +
      fmt(second.x) +
      ' ' +
      fmt(second.y);
  }
  body +=
    '<path d="' +
    network +
    '" fill="none" stroke="' +
    PALETTE.clay +
    '" stroke-width=".7" opacity=".48"/>';

  const accentSite = sites[Math.floor(sites.length * 0.62)];
  let accentNetwork = '';
  const nearest = sites
    .map((site, index) => ({ site, index, distance: distance(site, accentSite) }))
    .filter((item) => item.index !== Math.floor(sites.length * 0.62))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
  for (let index = 0; index < nearest.length; index += 1) {
    accentNetwork +=
      'M ' +
      fmt(accentSite.x) +
      ' ' +
      fmt(accentSite.y) +
      ' L ' +
      fmt(nearest[index].site.x) +
      ' ' +
      fmt(nearest[index].site.y);
  }
  body +=
    '<path d="' +
    accentNetwork +
    '" fill="none" stroke="' +
    PALETTE.red +
    '" stroke-width="1.75" opacity=".78"/>';

  let points = '';
  for (let index = 0; index < sites.length; index += 1) {
    const isAccent = sites[index] === accentSite;
    points +=
      '<circle cx="' +
      fmt(sites[index].x) +
      '" cy="' +
      fmt(sites[index].y) +
      '" r="' +
      (isAccent ? '4.2' : '1.9') +
      '" fill="' +
      (isAccent ? PALETTE.red : PALETTE.ink) +
      '" opacity="' +
      (isAccent ? '.94' : '.78') +
      '"/>';
  }
  body += points + '</g>';

  return svgDocument(
    'voronoi-delaunay-field',
    'Voronoi and Delaunay field study',
    'A deterministic dual geometric field of clipped Voronoi cells and a restrained Delaunay network.',
    seed,
    body,
  );
}

function cliffordPoints(seed, count, offset, scale, rotation, center) {
  const random = rngFrom(String(seed) + ':clifford:' + count + ':' + offset);
  const presets = [
    [1.641, 1.902, 1.557, 1.268],
    [-1.24458, -1.25151, -1.81591, -1.90867],
    [1.7, 1.3, 1.1, -1.2],
    [-1.7, 1.8, -1.9, -0.4],
  ];
  const chosen = presets[hashSeed(seed) % presets.length];
  const drift = (random() - 0.5) * 0.08;
  const a = chosen[0] + drift;
  const b = chosen[1] - drift * 0.7;
  const c = chosen[2] + drift * 0.4;
  const d = chosen[3] - drift * 0.5;
  let x = 0.13 + (random() - 0.5) * 0.1;
  let y = -0.17 + (random() - 0.5) * 0.1;
  for (let index = 0; index < 260; index += 1) {
    const nextX = Math.sin(a * y) + c * Math.cos(a * x);
    const nextY = Math.sin(b * x) + d * Math.cos(b * y);
    x = nextX;
    y = nextY;
  }
  const points = [];
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  for (let index = 0; index < count; index += 1) {
    const nextX = Math.sin(a * y) + c * Math.cos(a * x);
    const nextY = Math.sin(b * x) + d * Math.cos(b * y);
    x = nextX;
    y = nextY;
    const rotatedX = (x * cos - y * sin) * scale;
    const rotatedY = (x * sin + y * cos) * scale;
    points.push(point(center.x + rotatedX, center.y + rotatedY));
  }
  return points;
}

function compactAttractorWindow(points, length) {
  let bestStart = 0;
  let bestScore = Infinity;
  for (let start = 0; start < points.length - length; start += 7) {
    let score = 0;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let index = start; index < start + length; index += 1) {
      const current = points[index];
      const previous = points[Math.max(start, index - 1)];
      score += distance(current, previous);
      minX = Math.min(minX, current.x);
      minY = Math.min(minY, current.y);
      maxX = Math.max(maxX, current.x);
      maxY = Math.max(maxY, current.y);
    }
    const span = Math.hypot(maxX - minX, maxY - minY);
    score += span * 0.42;
    if (score < bestScore) {
      bestScore = score;
      bestStart = start;
    }
  }
  return points.slice(bestStart, bestStart + length);
}

function generateStrangeAttractor(seed) {
  const random = rngFrom(String(seed) + ':attractor-style');
  const center = point(805 + (random() - 0.5) * 95, 510 + (random() - 0.5) * 70);
  const rotation = random() * TAU;
  const primary = cliffordPoints(seed, 920, 0, 204, rotation, center);
  const secondary = cliffordPoints(
    seed,
    240,
    1,
    148,
    rotation + 0.77,
    point(center.x + 130, center.y - 64),
  );
  let body =
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">';
  const chunks = 14;
  const primaryChunk = Math.ceil(primary.length / chunks);
  for (let index = 0; index < primary.length; index += primaryChunk) {
    const chunk = primary.slice(index, Math.min(index + primaryChunk + 2, primary.length));
    const chunkIndex = Math.floor(index / primaryChunk);
    const stroke = chunkIndex % 5 === 0 ? PALETTE.ink : PALETTE.inkSoft;
    const width = chunkIndex % 5 === 0 ? '0.72' : '0.56';
    body +=
      '<path d="' +
      openCatmullRom(chunk, 0.46) +
      '" stroke="' +
      stroke +
      '" stroke-width="' +
      width +
      '" opacity="' +
      (0.16 + (chunkIndex % 7) * 0.018).toFixed(2) +
      '"/>';
  }
  const secondaryChunk = 52;
  for (let index = 0; index < secondary.length; index += secondaryChunk) {
    const chunk = secondary.slice(index, Math.min(index + secondaryChunk + 2, secondary.length));
    body +=
      '<path d="' +
      openCatmullRom(chunk, 0.42) +
      '" stroke="' +
      PALETTE.clay +
      '" stroke-width=".52" opacity=".16"/>';
  }

  const accent = compactAttractorWindow(primary, 16);
  let accentDots = '';
  for (let index = 0; index < accent.length; index += 5) {
    accentDots +=
      '<circle cx="' +
      fmt(accent[index].x) +
      '" cy="' +
      fmt(accent[index].y) +
      '" r="' +
      (1.7 + (index % 3) * 0.45).toFixed(2) +
      '" fill="' +
      PALETTE.red +
      '" opacity=".7"/>';
  }
  body += accentDots + '</g>';

  return svgDocument(
    'strange-attractor-field',
    'Strange attractor field study',
    'A deterministic Clifford attractor accumulated into layered filament and density marks.',
    seed,
    body,
  );
}

export const simulationStudies = Object.freeze([
  {
    slug: 'gray-scott-contours',
    title: 'Gray–Scott contour study',
    description: 'Layered reaction–diffusion contours with cellular strata and restrained vermilion marks.',
    generate: generateGrayScott,
  },
  {
    slug: 'differential-growth-contours',
    title: 'Differential growth contour study',
    description: 'Repelling spring-linked contours recorded as nested growth histories.',
    generate: generateDifferentialGrowth,
  },
  {
    slug: 'voronoi-delaunay-field',
    title: 'Voronoi and Delaunay field study',
    description: 'Clipped Voronoi cells overlaid with a deterministic Delaunay network.',
    generate: generateVoronoiField,
  },
  {
    slug: 'strange-attractor-field',
    title: 'Strange attractor field study',
    description: 'A Clifford attractor translated into accumulated filament and density marks.',
    generate: generateStrangeAttractor,
  },
]);

export {
  generateGrayScott,
  generateDifferentialGrowth,
  generateVoronoiField,
  generateStrangeAttractor,
};
