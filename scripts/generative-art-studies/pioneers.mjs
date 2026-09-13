/**
 * Four small, deterministic SVG studies derived from generative-art methods.
 *
 * These are studies of systems, not replicas of historical works:
 * - controlled disorder over a quiet grid;
 * - a Markov field of visual signs;
 * - a projected graph with selected/complementary subsets;
 * - an instruction translated into a permutation of line directions.
 *
 * Every generator returns a complete, self-contained SVG string.  The module
 * intentionally has no runtime or rendering dependencies so it can be used by
 * a build script, a test, or a design sandbox.
 */

const WIDTH = 1600;
const HEIGHT = 1000;
const VERSION = '1.0.0';

const PALETTE = Object.freeze({
  paper: '#f6f0e7',
  ink: '#191719',
  clay: '#a65442',
  red: '#ca2121',
});

function rng(seed) {
  let state = (seed >>> 0) || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function f(value) {
  return Number(value.toFixed(2));
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pathFrom(points, close = false) {
  if (points.length === 0) return '';
  const commands = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${f(point[0])} ${f(point[1])}`;
  });
  return `${commands.join(' ')}${close ? ' Z' : ''}`;
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" ${extra}/>`;
}

function path(points, stroke, width = 1, opacity = 1, extra = '', close = false) {
  return `<path d="${pathFrom(points, close)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function circle(cx, cy, radius, fill, opacity = 1, stroke = 'none', strokeWidth = 0) {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(strokeWidth)}"/>`;
}

function rotatePoint(point, angle, center) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const x = point[0] - center[0];
  const y = point[1] - center[1];
  return [
    center[0] + x * cosine - y * sine,
    center[1] + x * sine + y * cosine,
  ];
}

function transformPoints(points, { angle = 0, scale = 1, center = [0, 0], translate = [0, 0] } = {}) {
  return points.map((point) => {
    const scaled = [
      center[0] + (point[0] - center[0]) * scale,
      center[1] + (point[1] - center[1]) * scale,
    ];
    const rotated = rotatePoint(scaled, angle, center);
    return [rotated[0] + translate[0], rotated[1] + translate[1]];
  });
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function background() {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.paper}"/>`;
}

function documentSvg({ slug, title, description, seed, body }) {
  const studyId = `study-${hashSeed(slug).toString(16)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="title-${studyId} desc-${studyId}" data-generator="pioneer-study" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${escapeXml(slug)}">
  <title id="title-${studyId}">${escapeXml(title)}</title>
  <desc id="desc-${studyId}">${escapeXml(description)}</desc>
  ${background()}
  ${body}
</svg>
`;
}

function weightedChoice(weights, random) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = random() * total;
  for (let index = 0; index < weights.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return index;
  }
  return weights.length - 1;
}

function controlledDisorderGrid(seed = 0x4d4f4c4e) {
  const random = rng(seed);
  const columns = 12;
  const rows = 7;
  const origin = [180, 190];
  const cell = [110, 96];
  const body = [];

  const baseFrame = [
    [-30, -27], [30, -27], [30, 27], [-30, 27],
  ];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const progress = column / (columns - 1);
      const disorder = Math.pow(progress, 1.65);
      const wave = Math.sin(column * 0.56 + row * 0.22) * disorder * 12;
      const center = [
        origin[0] + column * cell[0] + wave + (random() - 0.5) * disorder * 32,
        origin[1] + row * cell[1] + Math.sin(column * 0.35) * disorder * 15 + (random() - 0.5) * disorder * 42,
      ];
      const angle = (random() - 0.5) * (0.025 + disorder * 0.42);
      const scale = 0.92 + (random() - 0.5) * disorder * 0.28;
      const frame = transformPoints(
        baseFrame,
        { angle, scale, center: [0, 0], translate: center },
      );
      const isQuietAperture = column === 6 && row === 3;
      if (isQuietAperture) continue;

      const redCell = column === 10 && row === 4;
      const clayCell = (column === 8 && row === 2) || (column === 9 && row === 3);
      const stroke = redCell ? PALETTE.red : clayCell ? PALETTE.clay : PALETTE.ink;
      const opacity = redCell ? 0.96 : clayCell ? 0.78 : 0.42 + disorder * 0.34;
      const width = redCell ? 3 : 1.25;

      // A frame is occasionally interrupted; later disorder is therefore a
      // change in grammar, not a cloud of independent jitter.
      const missingEdge = disorder > 0.22 && random() < disorder * 0.48
        ? Math.floor(random() * 4)
        : -1;
      const frameLines = [];
      for (let edge = 0; edge < 4; edge += 1) {
        if (edge === missingEdge) continue;
        frameLines.push(line(
          frame[edge][0],
          frame[edge][1],
          frame[(edge + 1) % 4][0],
          frame[(edge + 1) % 4][1],
          stroke,
          width,
          opacity,
        ));
      }
      body.push(`<g>${frameLines.join('')}</g>`);
    }
  }

  return documentSvg({
    slug: 'controlled-disorder-grid',
    title: 'Controlled disorder grid',
    description: 'A deterministic field of rectangular marks moves from measured alignment into a sparse, bounded disturbance.',
    seed,
    body: body.join(''),
  });
}

const SIGN_GLYPHS = [
  [[-0.46, -0.46], [0.46, 0.46]],
  [[-0.44, -0.42], [-0.44, 0.42], [0.42, 0.42]],
  [[-0.45, 0.32], [0, -0.32], [0.45, 0.32]],
  [[-0.45, 0], [0, 0], [0.43, -0.34]],
  [[-0.46, 0], [0.46, 0]],
  [[-0.4, -0.34], [0, 0], [0.4, -0.34], [0, 0], [0, 0.42]],
];

const SIGN_TRANSITIONS = [
  [5, 3, 2, 2, 1, 1],
  [2, 3, 1, 2, 1, 1],
  [1, 2, 4, 2, 1, 1],
  [2, 1, 2, 4, 1, 1],
  [1, 1, 2, 3, 4, 1],
  [2, 2, 1, 2, 2, 3],
];

function drawGlyph(glyph, x, y, size, angle, stroke, width, opacity) {
  const points = glyph.map(([gx, gy]) => [x + gx * size, y + gy * size]);
  const transformed = transformPoints(points, { angle, center: [x, y] });
  return path(transformed, stroke, width, opacity);
}

function probabilisticSignField(seed = 0x4e414b45) {
  const random = rng(seed);
  const columns = 18;
  const rows = 10;
  const x0 = 240;
  const y0 = 240;
  const dx = 66;
  const dy = 64;
  const body = [];
  let previous = 0;

  // The cells are only a sampling scaffold. No cell border is rendered, so
  // the Markov chain is perceived as a field of signs rather than a matrix.
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = x0 + column * dx + (random() - 0.5) * 8;
      const y = y0 + row * dy + (random() - 0.5) * 8;
      const nx = (x - 830) / 720;
      const ny = (y - 510) / 370;
      const ellipseDistance = nx * nx + ny * ny;
      if (ellipseDistance > 1.04) continue;

      const field = 0.62 + 0.38 * (1 - clamp(ellipseDistance, 0, 1));
      const glyph = weightedChoice(SIGN_TRANSITIONS[previous], random);
      previous = glyph;
      const localAngle = (random() - 0.5) * (0.16 + (1 - field) * 0.28);
      const size = (23 + random() * 8) * (0.9 + field * 0.18);
      const weight = 1.45 + field * 0.35;
      const isRed = column === 14 && row === 5;
      const isClay = !isRed && ((column === 5 && row === 2) || (column === 11 && row === 7));
      const stroke = isRed ? PALETTE.red : isClay ? PALETTE.clay : PALETTE.ink;
      const opacity = isRed ? 0.96 : isClay ? 0.82 : 0.62 + field * 0.16;
      body.push(drawGlyph(SIGN_GLYPHS[glyph], x, y, size, localAngle, stroke, weight, opacity));
    }
  }

  return documentSvg({
    slug: 'probabilistic-sign-field',
    title: 'Probabilistic sign field',
    description: 'A deterministic Markov field translates a small alphabet of line signs into a softly bounded abstract composition.',
    seed,
    body: body.join(''),
  });
}

function rotate4(vector, a, b, angle) {
  const next = vector.slice();
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  next[a] = vector[a] * cosine - vector[b] * sine;
  next[b] = vector[a] * sine + vector[b] * cosine;
  return next;
}

function projectHypercubeVertex(bits, seed) {
  const random = rng(seed);
  const source = bits.map((bit) => bit ? 1 : -1);
  let transformed = rotate4(source, 0, 1, 0.31);
  transformed = rotate4(transformed, 2, 3, -0.44);
  transformed = rotate4(transformed, 0, 2, 0.23);
  transformed = rotate4(transformed, 1, 3, -0.19);
  const wobble = (random() - 0.5) * 0.015;
  const x = 800 + (transformed[0] * 0.92 + transformed[1] * 0.47 - transformed[2] * 0.35 + transformed[3] * 0.2) * 225;
  const y = 500 + (transformed[0] * 0.22 - transformed[1] * 0.7 + transformed[2] * 0.62 + transformed[3] * 0.3) * 205;
  return { x: x + wobble, y: y - wobble, depth: transformed[0] * 0.4 + transformed[3] * 0.2 };
}

function hypercubeEdges() {
  const edges = [];
  for (let value = 0; value < 16; value += 1) {
    for (let dimension = 0; dimension < 4; dimension += 1) {
      const other = value ^ (1 << dimension);
      if (value < other) edges.push({ from: value, to: other, dimension, index: edges.length });
    }
  }
  return edges;
}

function combinatorialProjection(seed = 0x4d4f4852) {
  const random = rng(seed);
  const vertices = [];
  for (let value = 0; value < 16; value += 1) {
    const bits = [0, 1, 2, 3].map((dimension) => (value >> dimension) & 1);
    vertices.push(projectHypercubeVertex(bits, seed + value * 41));
  }
  const edges = hypercubeEdges();
  const selected = new Set();
  const selectedBudget = 10;
  while (selected.size < selectedBudget) {
    const edge = edges[Math.floor(random() * edges.length)];
    selected.add(edge.index);
  }
  const redEdgeIndex = [...selected][Math.floor(random() * selected.size)];
  const complement = new Set();
  while (complement.size < 4) {
    const edge = edges[Math.floor(random() * edges.length)];
    if (!selected.has(edge.index)) complement.add(edge.index);
  }
  const body = [];

  // The full possibility space is deliberately quieter than the selected
  // subset. This is a projection study, not a literal 3D object.
  for (const edge of edges) {
    const from = vertices[edge.from];
    const to = vertices[edge.to];
    body.push(line(from.x, from.y, to.x, to.y, PALETTE.ink, 0.8, 0.2));
  }

  for (const edge of edges) {
    if (!selected.has(edge.index)) continue;
    const from = vertices[edge.from];
    const to = vertices[edge.to];
    const red = edge.index === redEdgeIndex;
    body.push(line(
      from.x,
      from.y,
      to.x,
      to.y,
      red ? PALETTE.red : PALETTE.ink,
      red ? 3 : 2.2,
      red ? 0.96 : 0.74,
    ));
  }

  // A small complementary subset carries the clay accent. It shares the
  // projection exactly, so the contrast comes from selection rather than
  // from an ornamental offset or shadow.
  for (const edge of edges) {
    if (!complement.has(edge.index)) continue;
    const from = vertices[edge.from];
    const to = vertices[edge.to];
    body.push(line(from.x, from.y, to.x, to.y, PALETTE.clay, 1.5, 0.72));
  }

  for (const vertex of vertices) {
    body.push(circle(vertex.x, vertex.y, 2.2, PALETTE.paper, 0.95, PALETTE.ink, 0.9));
  }

  return documentSvg({
    slug: 'combinatorial-projection',
    title: 'Combinatorial projection',
    description: 'A four-dimensional edge alphabet is projected into two dimensions while a selected subset fractures the larger symmetry.',
    seed,
    body: body.join(''),
  });
}

const LINE_DIRECTIONS = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4];

function grayCode(index) {
  return index ^ (index >> 1);
}

function drawDirectionBundle(centerX, centerY, width, height, direction, phase, stroke, opacity, weight) {
  const lines = [];
  const count = 3;
  const spacing = height / (count + 1);
  for (let index = 0; index < count; index += 1) {
    const offset = (index - (count - 1) / 2) * spacing;
    const jitter = Math.sin(phase + index * 1.7) * 1.5;
    const directionX = Math.cos(direction);
    const directionY = Math.sin(direction);
    const normalX = -directionY;
    const normalY = directionX;
    const halfLength = width * 0.42;
    const start = [
      centerX + normalX * (offset + jitter) - directionX * halfLength,
      centerY + normalY * (offset + jitter) - directionY * halfLength,
    ];
    const end = [
      centerX + normalX * (offset + jitter) + directionX * halfLength,
      centerY + normalY * (offset + jitter) + directionY * halfLength,
    ];
    lines.push(line(start[0], start[1], end[0], end[1], stroke, weight, opacity));
  }
  return lines.join('');
}

function instructionPermutation(seed = 0x4c455749) {
  const panels = 11;
  const panelWidth = 112;
  const gap = 22;
  const startX = 74;
  const body = [];

  // The instruction is simple: translate the non-empty Gray-code subsets of
  // four directions through an undulating field. Every bundle repeats the
  // same three-line grammar; only its direction, position, and color clause
  // change from panel to panel.
  for (let panel = 0; panel < panels; panel += 1) {
    const x = startX + panel * (panelWidth + gap);
    const centerY = 500 + Math.sin(panel * 0.68) * 33;
    const mask = grayCode(panel + 1) & 0xf;
    const activeDirections = [];
    for (let direction = 0; direction < LINE_DIRECTIONS.length; direction += 1) {
      if (mask & (1 << direction)) activeDirections.push(direction);
    }
    for (const direction of activeDirections) {
      const red = direction === 2 && panel === 8;
      const clay = !red && direction === 3 && panel === 7;
      const opacity = red ? 0.96 : clay ? 0.82 : 0.58 + activeDirections.length * 0.055;
      const weight = red ? 2.6 : clay ? 1.7 : 1.25 + activeDirections.length * 0.08;
      body.push(drawDirectionBundle(
        x + panelWidth / 2,
        centerY,
        panelWidth,
        300 + Math.sin(panel * 0.4) * 22,
        LINE_DIRECTIONS[direction],
        panel * 0.47 + direction * 0.91,
        red ? PALETTE.red : clay ? PALETTE.clay : PALETTE.ink,
        opacity,
        weight,
      ));
    }
  }

  return documentSvg({
    slug: 'instruction-permutation',
    title: 'Instruction permutation',
    description: 'A compact line instruction becomes a serial field of directional combinations with one restrained chromatic clause.',
    seed,
    body: body.join(''),
  });
}

export const pioneerStudies = [
  {
    slug: 'controlled-disorder-grid',
    title: 'Controlled disorder grid',
    description: 'Molnár/Nees study: measured alignment gradually yields to bounded displacement, rotation, and omission.',
    generate: controlledDisorderGrid,
  },
  {
    slug: 'probabilistic-sign-field',
    title: 'Probabilistic sign field',
    description: 'Nake study: a finite alphabet of signs follows a seeded transition process across a soft field.',
    generate: probabilisticSignField,
  },
  {
    slug: 'combinatorial-projection',
    title: 'Combinatorial projection',
    description: 'Mohr study: a projected edge system reveals selected and complementary subsets of a larger structure.',
    generate: combinatorialProjection,
  },
  {
    slug: 'instruction-permutation',
    title: 'Instruction permutation',
    description: 'LeWitt study: a short directional instruction unfolds as a serial field of bounded combinations.',
    generate: instructionPermutation,
  },
];
