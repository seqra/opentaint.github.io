import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This generator intentionally has no image or noise dependency. Every mark in the
// five illustrations is derived from the small seeded PRNG below, so a rebuild is
// reproducible and the artwork stays editable as SVG.

const WIDTH = 1920;
const HEIGHT = 840;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public', 'pictures', 'blog', 'generated');
const ART_VERSION = '2.0.0';

const COLOR = {
  paper: '#f6f0e7',
  paperDeep: '#eee1d2',
  ink: '#191719',
  inkSoft: '#53484a',
  red: '#ca2121',
  redDark: '#8f2426',
  clay: '#a65442',
  sand: '#d4bba1',
};

const TAU = Math.PI * 2;

function rng(seed) {
  let state = seed >>> 0;
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

function escapeAttr(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function smoothstep(edge0, edge1, value) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function distance(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return [x / length, y / length];
}

function noiseHash(x, y, seed) {
  let value = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(0, 1, x - x0);
  const ty = smoothstep(0, 1, y - y0);
  const a = noiseHash(x0, y0, seed);
  const b = noiseHash(x0 + 1, y0, seed);
  const c = noiseHash(x0, y0 + 1, seed);
  const d = noiseHash(x0 + 1, y0 + 1, seed);
  return lerp(lerp(a, b, tx), lerp(c, d, tx), ty) * 2 - 1;
}

function fractalNoise(x, y, seed, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let normalizer = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + octave * 1013) * amplitude;
    normalizer += amplitude;
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value / normalizer;
}

function curlVector(x, y, seed) {
  const epsilon = 0.018;
  const dx = (fractalNoise(x + epsilon, y, seed) - fractalNoise(x - epsilon, y, seed)) / (2 * epsilon);
  const dy = (fractalNoise(x, y + epsilon, seed) - fractalNoise(x, y - epsilon, seed)) / (2 * epsilon);
  return { x: dy, y: -dx };
}

function chaikin(points, passes = 1, closed = false) {
  let current = points.map((point) => [point[0], point[1]]);
  for (let pass = 0; pass < passes; pass += 1) {
    if (current.length < 3) return current;
    const next = [];
    const limit = closed ? current.length : current.length - 1;
    if (!closed) next.push(current[0]);
    for (let index = 0; index < limit; index += 1) {
      const a = current[index];
      const b = current[(index + 1) % current.length];
      next.push([lerp(a[0], b[0], 0.25), lerp(a[1], b[1], 0.25)]);
      next.push([lerp(a[0], b[0], 0.75), lerp(a[1], b[1], 0.75)]);
    }
    if (!closed) next.push(current.at(-1));
    current = next;
  }
  return current;
}

function pointAlong(points, amount) {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return points[0];
  const target = clamp(amount, 0, 1);
  const lengths = [];
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const length = distance(points[index - 1], points[index]);
    lengths.push(length);
    total += length;
  }
  let remaining = target * total;
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index]) {
      const amountOnSegment = lengths[index] ? remaining / lengths[index] : 0;
      return [
        lerp(points[index][0], points[index + 1][0], amountOnSegment),
        lerp(points[index][1], points[index + 1][1], amountOnSegment),
      ];
    }
    remaining -= lengths[index];
  }
  return points.at(-1);
}

function pathFrom(points, close = false) {
  if (points.length === 0) return '';
  return `${points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point[0])} ${f(point[1])}`).join(' ')}${close ? ' Z' : ''}`;
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" ${extra}/>`;
}

function circle(cx, cy, radius, fill, opacity = 1, stroke = 'none', strokeWidth = 0, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="${fill}" opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}" ${extra}/>`;
}

function polyline(points, stroke, width = 1, opacity = 1, extra = '') {
  return `<path d="${pathFrom(points)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" ${extra}/>`;
}

function baseDefs() {
  return '<defs></defs>';
}

function background(seed) {
  const random = rng(seed);
  const fibers = Array.from({ length: 54 }, (_, index) => {
    const x = 40 + random() * (WIDTH - 80);
    const y = 60 + random() * (HEIGHT - 120);
    const length = 25 + random() * 100;
    const tilt = -0.35 + random() * 0.7;
    return line(x, y, x + Math.cos(tilt) * length, y + Math.sin(tilt) * length, index % 4 === 0 ? COLOR.sand : COLOR.ink, 0.55, 0.055);
  }).join('');

  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.paper}"/>
    <g>${fibers}</g>`;
}

function svg(name, body, seed, description) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" data-generator="algorithmic" data-generator-version="${ART_VERSION}" data-seed="${seed >>> 0}" data-artwork="${escapeAttr(name)}">
  <title>${escapeText(name.replaceAll('-', ' '))}</title>
  <desc>${escapeText(description || 'Deterministic algorithmic line artwork in the OpenTaint editorial palette.')}</desc>
  ${baseDefs()}
  ${background(seed)}
  ${body}
</svg>
`;
}

function flowFieldArt() {
  const random = rng(0x1f0a2026);
  const target = [1505, 420];
  let body = '';
  body += `<g fill="none" stroke="${COLOR.ink}" stroke-linecap="round" stroke-linejoin="round">`;

  for (let stream = 0; stream < 68; stream += 1) {
    let x = 78;
    let y = 76 + stream * 10.1 + (random() - 0.5) * 12;
    const points = [[x, y]];
    for (let step = 0; step < 44; step += 1) {
      const dx = target[0] - x;
      const dy = target[1] - y;
      const swirl = Math.sin((y + x * 0.11) * 0.015) * 11;
      const pull = Math.max(0.012, Math.min(0.082, (step / 44) * 0.065));
      x += 30 + random() * 7;
      y += dy * pull + swirl * 0.12 + (random() - 0.5) * 5;
      points.push([x, y]);
    }
    const accent = stream % 11 === 0 || stream % 17 === 0;
    body += polyline(points, accent ? COLOR.red : COLOR.ink, accent ? 3.1 : 1.35, accent ? 0.84 : 0.22);
  }
  body += '</g>';

  // A handful of crisp paths make the converging state legible over the quiet field.
  for (let state = 0; state < 7; state += 1) {
    const startY = 150 + state * 88;
    const points = [[88, startY]];
    for (let step = 1; step <= 25; step += 1) {
      const progress = step / 25;
      const x = 88 + progress * 1360;
      const y = startY + (target[1] - startY) * Math.pow(progress, 1.4) + Math.sin(progress * 14 + state) * (1 - progress) * 22;
      points.push([x, y]);
    }
    body += polyline(points, state === 2 || state === 5 ? COLOR.red : COLOR.inkSoft, state === 2 || state === 5 ? 4.5 : 2.2, state === 2 || state === 5 ? 0.9 : 0.42);
  }

  body += circle(target[0], target[1], 65, 'none', 1, COLOR.red, 3, 'filter="url(#soft-red)"');
  body += circle(target[0], target[1], 42, COLOR.paper, 0.82, COLOR.ink, 2.5);
  body += circle(target[0], target[1], 12, COLOR.red, 1);
  for (let spoke = 0; spoke < 8; spoke += 1) {
    const angle = spoke * TAU / 8;
    body += line(target[0] + Math.cos(angle) * 74, target[1] + Math.sin(angle) * 74, target[0] + Math.cos(angle) * 103, target[1] + Math.sin(angle) * 103, spoke % 2 ? COLOR.ink : COLOR.red, spoke % 2 ? 1.3 : 2.2, 0.7);
  }
  for (let state = 0; state < 10; state += 1) {
    const angle = state * TAU / 10 + 0.15;
    body += circle(target[0] + Math.cos(angle) * 98, target[1] + Math.sin(angle) * 98, state % 3 === 0 ? 5 : 3, state % 3 === 0 ? COLOR.red : COLOR.ink, 0.88);
  }
  body += `<path d="M 83 715 C 430 680 702 738 940 680 S 1320 604 1608 646" fill="none" stroke="${COLOR.red}" stroke-width="1.2" opacity="0.24" stroke-dasharray="2 18"/>`;
  return svg('what-is-taint-analysis', body, 0x20f0a1);
}

function appsecAgentArt() {
  const random = rng(0x2a91a7);
  let body = '';
  const branches = [];
  const leaves = [];

  function branch(x, y, angle, length, depth, lineage) {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    const bend = (random() - 0.5) * 0.18;
    const midX = x + Math.cos(angle + bend) * length * 0.55;
    const midY = y + Math.sin(angle + bend) * length * 0.55;
    branches.push({ points: [[x, y], [midX, midY], [endX, endY]], depth, lineage });
    if (depth === 0) {
      leaves.push({ x: endX, y: endY, lineage });
      return;
    }
    const spread = 0.24 + random() * 0.16;
    branch(endX, endY, angle - spread, length * (0.76 + random() * 0.08), depth - 1, `${lineage}0`);
    branch(endX, endY, angle + spread, length * (0.76 + random() * 0.08), depth - 1, `${lineage}1`);
    if (depth < 3 && random() > 0.35) {
      branch(endX, endY, angle + (random() - 0.5) * 0.48, length * 0.6, depth - 1, `${lineage}2`);
    }
  }

  branch(130, 420, -0.03, 215, 6, 'r');
  body += '<g fill="none" stroke-linecap="round" stroke-linejoin="round">';
  for (const segment of branches) {
    const red = segment.lineage.endsWith('1') && segment.depth < 4;
    body += polyline(segment.points, red ? COLOR.red : COLOR.ink, red ? 2.5 : 1.35 + (5 - segment.depth) * 0.11, red ? 0.78 : 0.28 + (6 - segment.depth) * 0.055);
  }
  body += '</g>';
  body += circle(130, 420, 15, COLOR.red, 1, COLOR.paper, 6);

  const laneCount = 12;
  for (let lane = 0; lane < laneCount; lane += 1) {
    const y = 108 + lane * 56;
    const source = leaves[lane % leaves.length];
    const points = [[source.x + 5, source.y]];
    const laneRandom = rng(0x501 + lane * 47);
    for (let step = 1; step <= 26; step += 1) {
      const progress = step / 26;
      const x = source.x + progress * (1740 - source.x);
      const wobble = Math.sin(progress * 12 + lane * 0.8) * (1 - progress) * 17;
      const targetY = y + (source.y - y) * (1 - progress) * 0.25;
      points.push([x, targetY + wobble + (laneRandom() - 0.5) * 3]);
    }
    const red = lane === 3 || lane === 9;
    body += polyline(points, red ? COLOR.red : COLOR.inkSoft, red ? 3.3 : 1.9, red ? 0.82 : 0.3, red ? '' : 'stroke-dasharray="1 10"');
    for (let token = 1; token < 8; token += 1) {
      const progress = token / 8;
      const index = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));
      const point = points[index];
      body += circle(point[0], point[1], red ? 5 : 3.1, red ? COLOR.red : COLOR.ink, red ? 0.95 : 0.4);
    }
  }

  // Feedback arcs keep the agent motif alive instead of making it a one-way tree.
  body += `<g fill="none" stroke-linecap="round"><path d="M 1740 108 C 1834 192 1822 318 1732 374 C 1664 416 1602 378 1554 337" stroke="${COLOR.red}" stroke-width="2.6" opacity="0.8"/><path d="M 1740 660 C 1834 580 1822 462 1732 418 C 1664 385 1602 425 1554 473" stroke="${COLOR.ink}" stroke-width="1.4" opacity="0.32"/></g>`;
  body += circle(1740, 108, 11, COLOR.red, 0.95);
  body += circle(1740, 660, 8, COLOR.ink, 0.45);
  return svg('appsec-agent', body, 0x2aa7c1);
}

function rewriteLSystem(axiom, rule, iterations) {
  let current = axiom;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    current = [...current].map((symbol) => rule[symbol] || symbol).join('');
  }
  return current;
}

function lSystemSegments({ x, y, angle, step, iterations, seed }) {
  const random = rng(seed);
  const sequence = rewriteLSystem('F', { F: 'F[+F]F[-F]F' }, iterations);
  const stack = [];
  const segments = [];
  let cursor = { x, y, angle, depth: 0 };
  for (const symbol of sequence) {
    if (symbol === 'F') {
      const jitter = (random() - 0.5) * 0.045;
      const next = {
        x: cursor.x + Math.cos(cursor.angle + jitter) * step,
        y: cursor.y + Math.sin(cursor.angle + jitter) * step,
      };
      segments.push({ from: [cursor.x, cursor.y], to: [next.x, next.y], depth: cursor.depth });
      cursor = { ...cursor, ...next };
    } else if (symbol === '+') {
      cursor.angle += 0.39 + (random() - 0.5) * 0.03;
    } else if (symbol === '-') {
      cursor.angle -= 0.39 + (random() - 0.5) * 0.03;
    } else if (symbol === '[') {
      stack.push({ ...cursor });
      cursor.depth += 1;
    } else if (symbol === ']') {
      cursor = stack.pop() || cursor;
    }
  }
  return segments;
}

function springAnalyzerArt() {
  let body = '';
  const strata = [118, 220, 322, 424, 526, 628, 730];
  for (let index = 0; index < strata.length; index += 1) {
    const y = strata[index];
    body += `<rect x="62" y="${y - 49}" width="1796" height="98" fill="${index % 2 ? COLOR.paperDeep : COLOR.paper}" opacity="0.52"/>`;
    body += line(76, y, 1844, y, index === 3 ? COLOR.red : COLOR.ink, index === 3 ? 2.6 : 1, index === 3 ? 0.58 : 0.16, 'stroke-dasharray="3 18"');
    for (let dot = 0; dot < 16; dot += 1) {
      body += circle(112 + dot * 113 + (index % 2) * 14, y, index === 3 ? 3.5 : 2.2, index === 3 ? COLOR.red : COLOR.ink, index === 3 ? 0.82 : 0.3);
    }
  }

  const forestA = lSystemSegments({ x: 590, y: 748, angle: -Math.PI / 2, step: 11.4, iterations: 4, seed: 0x317 });
  const forestB = lSystemSegments({ x: 1180, y: 748, angle: -Math.PI / 2 - 0.12, step: 10.8, iterations: 4, seed: 0x613 });
  for (const [segments, offset] of [[forestA, 0], [forestB, 1]]) {
    for (const segment of segments) {
      const red = (segment.depth + offset) % 7 === 0 || (segment.depth === 0 && offset === 1);
      body += line(segment.from[0], segment.from[1], segment.to[0], segment.to[1], red ? COLOR.red : COLOR.ink, red ? 2.1 : 1.35, red ? 0.74 : 0.34);
    }
  }

  // Persistence is shown as a separate, horizontal graph that collects branch points.
  for (let row = 0; row < 5; row += 1) {
    const y = 174 + row * 122;
    const points = [[220, y]];
    for (let node = 0; node < 8; node += 1) {
      const x = 260 + node * 194;
      points.push([x, y + Math.sin(node * 1.8 + row) * 14]);
    }
    body += polyline(points, row === 2 ? COLOR.red : COLOR.inkSoft, row === 2 ? 3.3 : 1.6, row === 2 ? 0.8 : 0.3, 'stroke-dasharray="1 8"');
    points.slice(1).forEach((point, index) => {
      body += circle(point[0], point[1], row === 2 ? 6 : 4, row === 2 ? COLOR.red : COLOR.paper, 0.9, COLOR.ink, 1);
      if (index < points.length - 2) {
        body += line(point[0], point[1], point[0], point[1] + 34, row === 2 ? COLOR.red : COLOR.ink, row === 2 ? 1.9 : 1, row === 2 ? 0.62 : 0.22);
      }
    });
  }
  body += `<path d="M 208 778 C 486 804 718 785 930 799 S 1384 815 1718 774" fill="none" stroke="${COLOR.red}" stroke-width="2" opacity="0.45"/>`;
  return svg('spring-analyzer', body, 0x31aa17);
}

function buildMaze(columns, rows, random) {
  const cells = Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({ n: true, e: true, s: true, w: true, visited: false })));
  const directions = [
    { dx: 1, dy: 0, wall: 'e', opposite: 'w' },
    { dx: -1, dy: 0, wall: 'w', opposite: 'e' },
    { dx: 0, dy: 1, wall: 's', opposite: 'n' },
    { dx: 0, dy: -1, wall: 'n', opposite: 's' },
  ];
  const stack = [[0, Math.floor(rows / 2)]];
  cells[stack[0][1]][stack[0][0]].visited = true;
  while (stack.length) {
    const [x, y] = stack.at(-1);
    const options = directions.filter(({ dx, dy }) => {
      const nx = x + dx;
      const ny = y + dy;
      return nx >= 0 && nx < columns && ny >= 0 && ny < rows && !cells[ny][nx].visited;
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const direction = options[Math.floor(random() * options.length)];
    const nx = x + direction.dx;
    const ny = y + direction.dy;
    cells[y][x][direction.wall] = false;
    cells[ny][nx][direction.opposite] = false;
    cells[ny][nx].visited = true;
    stack.push([nx, ny]);
  }
  return { cells, directions };
}

function mazeNeighbors(maze, cell, columns, rows) {
  const [x, y] = cell;
  const state = maze[y][x];
  const result = [];
  if (!state.n && y > 0) result.push([x, y - 1]);
  if (!state.e && x < columns - 1) result.push([x + 1, y]);
  if (!state.s && y < rows - 1) result.push([x, y + 1]);
  if (!state.w && x > 0) result.push([x - 1, y]);
  return result;
}

function mazePath(maze, start, goal, columns, rows) {
  const queue = [start];
  const previous = new Map([[start.join(','), null]]);
  while (queue.length) {
    const cell = queue.shift();
    if (cell[0] === goal[0] && cell[1] === goal[1]) break;
    for (const next of mazeNeighbors(maze, cell, columns, rows)) {
      const key = next.join(',');
      if (!previous.has(key)) {
        previous.set(key, cell);
        queue.push(next);
      }
    }
  }
  const result = [];
  let cursor = goal;
  while (cursor) {
    result.unshift(cursor);
    cursor = previous.get(cursor.join(','));
  }
  return result;
}

function exploratoryPath(maze, start, goal, columns, rows, seed, bias) {
  const random = rng(seed);
  const visited = new Set([start.join(',')]);
  const result = [start];
  let current = start;
  for (let step = 0; step < 62; step += 1) {
    let options = mazeNeighbors(maze, current, columns, rows).filter((candidate) => !visited.has(candidate.join(',')) && !(candidate[0] === goal[0] && candidate[1] === goal[1]));
    if (!options.length) break;
    options = options.sort((a, b) => {
      const distanceA = Math.abs(a[0] - goal[0]) + Math.abs(a[1] - goal[1]);
      const distanceB = Math.abs(b[0] - goal[0]) + Math.abs(b[1] - goal[1]);
      return (distanceA - distanceB) * bias + (random() - 0.5) * 3;
    });
    const pick = options[Math.min(options.length - 1, Math.floor(random() * Math.min(3, options.length)))];
    result.push(pick);
    visited.add(pick.join(','));
    current = pick;
    if (step > 14 && random() > 0.78) break;
  }
  return result;
}

function branchingDecoy(maze, start, goal, columns, rows, seed, redPath, branchOffset) {
  const random = rng(seed);
  const redKeys = new Set(redPath.map((cell) => cell.join(',')));
  const candidates = [];
  for (let index = 1; index < redPath.length - 1; index += 1) {
    const current = redPath[index];
    const previousKey = redPath[index - 1].join(',');
    const nextKey = redPath[index + 1].join(',');
    const branches = mazeNeighbors(maze, current, columns, rows).filter((candidate) => {
      const key = candidate.join(',');
      return key !== previousKey && key !== nextKey && !redKeys.has(key);
    });
    for (const branch of branches) candidates.push({ index, branch });
  }
  if (!candidates.length) return exploratoryPath(maze, start, goal, columns, rows, seed, 0.4);

  const choice = candidates[(branchOffset + Math.floor(random() * candidates.length)) % candidates.length];
  const result = redPath.slice(0, choice.index + 1).concat([choice.branch]);
  const visited = new Set(result.map((cell) => cell.join(',')));
  let current = choice.branch;
  for (let step = 0; step < 42; step += 1) {
    const options = mazeNeighbors(maze, current, columns, rows).filter((candidate) => !visited.has(candidate.join(',')) && !(candidate[0] === goal[0] && candidate[1] === goal[1]));
    if (!options.length) break;
    const next = options[Math.floor(random() * options.length)];
    result.push(next);
    visited.add(next.join(','));
    current = next;
    if (step > 10 && random() > 0.7) break;
  }
  return result;
}

function mazeArt() {
  const random = rng(0x4e6a3);
  const columns = 31;
  const rows = 13;
  const cellSize = 42;
  const x0 = (WIDTH - columns * cellSize) / 2;
  const y0 = (HEIGHT - rows * cellSize) / 2;
  const { cells } = buildMaze(columns, rows, random);
  const start = [0, Math.floor(rows / 2)];
  const goal = [columns - 1, Math.floor(rows / 2)];
  let body = '<g fill="none" stroke-linecap="round" stroke-linejoin="round">';
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cell = cells[y][x];
      const left = x0 + x * cellSize;
      const top = y0 + y * cellSize;
      if (cell.n) body += line(left, top, left + cellSize, top, COLOR.ink, 2.3, 0.4);
      if (cell.w && !(x === start[0] && y === start[1])) body += line(left, top, left, top + cellSize, COLOR.ink, 2.3, 0.4);
      if (cell.e && !(x === goal[0] && y === goal[1])) body += line(left + cellSize, top, left + cellSize, top + cellSize, COLOR.ink, 2.3, 0.4);
      if (cell.s) body += line(left, top + cellSize, left + cellSize, top + cellSize, COLOR.ink, 2.3, 0.4);
    }
  }
  body += '</g>';

  const center = (cell) => [x0 + cell[0] * cellSize + cellSize / 2, y0 + cell[1] * cellSize + cellSize / 2];
  const redPath = mazePath(cells, start, goal, columns, rows);
  const wrongBranchA = branchingDecoy(cells, start, goal, columns, rows, 0x101, redPath, 1);
  const wrongBranchB = branchingDecoy(cells, start, goal, columns, rows, 0x212, redPath, Math.floor(redPath.length / 3));
  // Two searchers lose confidence at different points on the same maze. Their
  // offset, interrupted traces stay readable even when a decoy branch is short.
  const wrongPathA = redPath.slice(0, Math.max(4, Math.floor(redPath.length * 0.45)));
  const wrongPathB = redPath.slice(0, Math.max(4, Math.floor(redPath.length * 0.69)));
  body += polyline(wrongBranchA.map(center), COLOR.clay, 6, 0.52, 'stroke-dasharray="2 11"');
  body += polyline(wrongBranchB.map(center), COLOR.inkSoft, 5, 0.5, 'stroke-dasharray="1 9"');
  body += polyline(redPath.map(center), COLOR.red, 7, 0.95, 'filter="url(#soft-red)"');
  body += polyline(redPath.map(center), COLOR.red, 3.5, 1);
  body += polyline(wrongPathA.map(([x, y]) => [x - 5, y + 4]), COLOR.clay, 3.8, 0.78, 'stroke-dasharray="2 10"');
  body += polyline(wrongPathB.map(([x, y]) => [x + 5, y - 4]), COLOR.inkSoft, 3.2, 0.7, 'stroke-dasharray="1 9"');
  const startPoint = center(start);
  const goalPoint = center(goal);
  body += circle(startPoint[0], startPoint[1], 12, COLOR.ink, 1, COLOR.paper, 4);
  body += circle(goalPoint[0], goalPoint[1], 18, 'none', 1, COLOR.red, 4, 'filter="url(#soft-red)"');
  body += circle(goalPoint[0], goalPoint[1], 6, COLOR.red, 1);
  const wrongEndA = center(wrongPathA.at(-1));
  const wrongEndB = center(wrongPathB.at(-1));
  body += circle(wrongEndA[0] - 5, wrongEndA[1] + 4, 6, COLOR.clay, 0.9, COLOR.paper, 2);
  body += circle(wrongEndB[0] + 5, wrongEndB[1] - 4, 5, COLOR.inkSoft, 0.78, COLOR.paper, 2);
  for (const [index, point] of redPath.entries()) {
    if (index % 5 === 0 && index > 0 && index < redPath.length - 1) {
      const coordinate = center(point);
      body += circle(coordinate[0], coordinate[1], 3.5, COLOR.paper, 0.9, COLOR.red, 1.4);
    }
  }
  body += `<path d="M ${x0 - 92} ${goalPoint[1]} L ${x0 - 38} ${goalPoint[1]} M ${x0 + columns * cellSize + 38} ${goalPoint[1]} L ${x0 + columns * cellSize + 92} ${goalPoint[1]}" stroke="${COLOR.red}" stroke-width="2" opacity="0.5" stroke-dasharray="2 8"/>`;
  return svg('semgrep-vs-codeql-vs-opentaint', body, 0x4cda0e);
}

function conductorArt() {
  const random = rng(0x5c0117);
  const aperture = [1538, 420];
  let body = '';
  const laneCount = 14;
  const lanes = [];
  for (let lane = 0; lane < laneCount; lane += 1) {
    const sourceY = 100 + lane * 49;
    const points = [];
    for (let step = 0; step <= 36; step += 1) {
      const progress = step / 36;
      const x = 118 + progress * 1430;
      const eased = progress * progress * (3 - 2 * progress);
      const y = sourceY + (aperture[1] - sourceY) * eased + Math.sin(progress * TAU * 1.25 + lane * 0.62) * (1 - progress) * (12 + (lane % 3) * 7);
      points.push([x, y]);
    }
    lanes.push(points);
    const accent = lane === 3 || lane === 7 || lane === 11;
    body += polyline(points, accent ? COLOR.red : COLOR.ink, accent ? 3.2 : 1.6, accent ? 0.82 : 0.28);
    body += polyline(points.map(([x, y]) => [x, y + 10]), accent ? COLOR.redDark : COLOR.inkSoft, accent ? 1.1 : 0.75, accent ? 0.42 : 0.15);
    for (let token = 1; token < 9; token += 1) {
      const progress = token / 9;
      const pointIndex = Math.floor(progress * (points.length - 1));
      const point = points[pointIndex];
      const size = accent ? 7 : 4;
      const direction = points[Math.min(points.length - 1, pointIndex + 1)];
      const angle = Math.atan2(direction[1] - point[1], direction[0] - point[0]);
      const diamond = [[point[0] + Math.cos(angle) * size, point[1] + Math.sin(angle) * size], [point[0] + Math.cos(angle + Math.PI / 2) * size * 0.65, point[1] + Math.sin(angle + Math.PI / 2) * size * 0.65], [point[0] - Math.cos(angle) * size, point[1] - Math.sin(angle) * size], [point[0] + Math.cos(angle - Math.PI / 2) * size * 0.65, point[1] + Math.sin(angle - Math.PI / 2) * size * 0.65]];
      body += `<path d="${pathFrom(diamond, true)}" fill="${accent ? COLOR.red : COLOR.ink}" opacity="${accent ? 0.88 : 0.34}"/>`;
    }
  }

  // Small side channels provide the feeling of a configurable workflow feeding the main belt.
  for (let branch = 0; branch < 6; branch += 1) {
    const y = 130 + branch * 118;
    const points = [[180, y], [420, y - 28], [680, y + 32], [870, 420 + (y - 420) * 0.55]];
    body += polyline(points, branch % 2 ? COLOR.clay : COLOR.inkSoft, branch % 2 ? 2 : 1.2, branch % 2 ? 0.54 : 0.26, 'stroke-dasharray="1 13"');
  }
  body += `<g transform="translate(${aperture[0]} ${aperture[1]})"><circle r="108" fill="${COLOR.paperDeep}" opacity="0.72"/><circle r="86" fill="none" stroke="${COLOR.ink}" stroke-width="2" opacity="0.5" stroke-dasharray="2 12"/><circle r="64" fill="${COLOR.ink}" opacity="0.96"/><circle r="42" fill="${COLOR.paper}" opacity="0.96"/><circle r="28" fill="${COLOR.red}" opacity="0.96" filter="url(#soft-red)"/><circle r="11" fill="${COLOR.ink}"/></g>`;
  for (let ray = 0; ray < 12; ray += 1) {
    const angle = ray * TAU / 12;
    const inner = 116;
    const outer = 145 + random() * 18;
    body += line(aperture[0] + Math.cos(angle) * inner, aperture[1] + Math.sin(angle) * inner, aperture[0] + Math.cos(angle) * outer, aperture[1] + Math.sin(angle) * outer, ray % 3 === 0 ? COLOR.red : COLOR.ink, ray % 3 === 0 ? 2.2 : 1, ray % 3 === 0 ? 0.72 : 0.3);
  }
  body += `<path d="M 1660 420 C 1720 420 1744 364 1810 364 M 1660 420 C 1720 420 1744 476 1810 476" fill="none" stroke="${COLOR.red}" stroke-width="2.2" opacity="0.65" stroke-dasharray="1 11"/>`;
  body += circle(1810, 364, 6, COLOR.red, 0.85);
  body += circle(1810, 476, 6, COLOR.red, 0.85);
  return svg('conductor-rce', body, 0x5a17ce);
}

// Version two treats every header as a small visual grammar. The shared paper,
// line language, and signal gate hold the set together; the governing system is
// deliberately different for every article.
function signalGate(x, y, angle = 0, scale = 1, color = COLOR.red) {
  const dx = Math.cos(angle) * 18 * scale;
  const dy = Math.sin(angle) * 18 * scale;
  const px = -Math.sin(angle) * 13 * scale;
  const py = Math.cos(angle) * 13 * scale;
  return `<g stroke="${color}" stroke-width="${f(3 * scale)}" stroke-linecap="round">
    ${line(x - dx - px, y - dy - py, x - px, y - py, color, 3 * scale, 0.95)}
    ${line(x + px, y + py, x + dx + px, y + dy + py, color, 3 * scale, 0.95)}
  </g>`;
}

function flowFieldArtV2() {
  const random = rng(0x1f0a2027);
  const gate = [1135, 420];
  let body = '';
  const families = [
    { base: 170, color: COLOR.ink, phase: 0.3 },
    { base: 670, color: COLOR.clay, phase: 2.1 },
  ];

  body += '<g fill="none" stroke-linecap="round" stroke-linejoin="round">';
  for (const [familyIndex, family] of families.entries()) {
    for (let stream = 0; stream < 34; stream += 1) {
      let x = 46 + random() * 75;
      let y = family.base + (stream - 17) * 11 + (random() - 0.5) * 12;
      const points = [[x, y]];
      for (let step = 0; step < 62; step += 1) {
        const progress = x / gate[0];
        const pull = 0.012 + Math.pow(Math.max(0, progress), 2.3) * 0.13;
        const curl = Math.sin(x * 0.006 + family.phase) * 7 + Math.sin(y * 0.021 - x * 0.003) * 5;
        x += 18 + random() * 4.5;
        y += (gate[1] - y) * pull + curl * 0.2 + (random() - 0.5) * 2.2;
        points.push([x, y]);
        if (x > gate[0] - 12) break;
      }
      const major = stream % 9 === (familyIndex ? 5 : 2);
      body += polyline(points, family.color, major ? 3.2 : 1.1, major ? 0.68 : 0.17);
      if (stream % 5 === 0) {
        for (let mark = 7; mark < points.length; mark += 8) {
          const [mx, my] = points[mark];
          body += line(mx - 2, my - 5, mx + 2, my + 5, family.color, 0.9, 0.28);
        }
      }
    }
  }
  body += '</g>';

  body += `<ellipse cx="${gate[0]}" cy="${gate[1]}" rx="116" ry="92" fill="${COLOR.paper}" opacity="0.76"/>`;
  body += signalGate(gate[0], gate[1], Math.PI / 2, 1.25);
  body += circle(gate[0] - 48, gate[1] - 31, 7, COLOR.ink, 0.9);
  body += circle(gate[0] - 48, gate[1] + 31, 7, COLOR.clay, 0.9);
  body += line(gate[0] - 40, gate[1] - 28, gate[0] - 5, gate[1] - 6, COLOR.ink, 2.2, 0.72);
  body += line(gate[0] - 40, gate[1] + 28, gate[0] - 5, gate[1] + 6, COLOR.clay, 2.2, 0.72);

  // Only the joined state is red. Its descendants form a widening interference
  // field, so the semantic transition is visible without a label or target icon.
  for (let branch = 0; branch < 17; branch += 1) {
    const offset = branch - 8;
    const points = [];
    for (let step = 0; step <= 30; step += 1) {
      const p = step / 30;
      const x = gate[0] + 30 + p * 710;
      const y = gate[1] + offset * (8 + 22 * p) + Math.sin(p * 9 + branch) * 8 * p;
      points.push([x, y]);
    }
    body += polyline(points, branch === 8 ? COLOR.red : (branch % 3 === 0 ? COLOR.redDark : COLOR.ink), branch === 8 ? 4.2 : 1.3, branch === 8 ? 0.95 : 0.22 + (branch % 3 === 0 ? 0.18 : 0));
  }
  for (let dust = 0; dust < 130; dust += 1) {
    const x = 1210 + random() * 610;
    const envelope = 24 + (x - 1210) * 0.24;
    const y = gate[1] + (random() - 0.5) * envelope * 2;
    body += circle(x, y, 0.9 + random() * 1.8, dust % 13 === 0 ? COLOR.red : COLOR.ink, dust % 13 === 0 ? 0.62 : 0.16);
  }
  return svg('what-is-taint-analysis-v2', body, 0x20f0a2);
}

function appsecAgentArtV2() {
  const random = rng(0x2a91a8);
  const columns = 23;
  const rows = 9;
  const sx = 72;
  const sy = 72;
  const x0 = 146;
  const y0 = 128;
  const nodes = [];
  let body = '';

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const calm = column / (columns - 1);
      const variance = 34 * Math.pow(1 - calm, 1.5) + 2;
      const x = x0 + column * sx + (random() - 0.5) * variance;
      const y = y0 + row * sy + (random() - 0.5) * variance;
      const mass = 2.2 + random() * 3.8 + (column > 17 && row % 4 === 1 ? 4 : 0);
      nodes.push({ x, y, row, column, mass });
    }
  }

  // Evidence exchange is local: each node only affects its nearest forward
  // neighbors. Ordered review artifacts emerge on the right of the disturbed field.
  body += '<g fill="none" stroke-linecap="round">';
  for (const node of nodes) {
    if (node.column === columns - 1) continue;
    const candidates = nodes
      .filter((other) => other.column === node.column + 1 && Math.abs(other.row - node.row) <= 1)
      .sort((a, b) => Math.abs(a.y - node.y) - Math.abs(b.y - node.y));
    for (const target of candidates.slice(0, node.column < 8 ? 2 : 1)) {
      const mid = (node.x + target.x) / 2;
      body += `<path d="M ${f(node.x)} ${f(node.y)} C ${f(mid)} ${f(node.y)}, ${f(mid)} ${f(target.y)}, ${f(target.x)} ${f(target.y)}" stroke="${COLOR.ink}" stroke-width="${f(0.65 + node.mass * 0.12)}" opacity="${f(0.1 + node.column / columns * 0.2)}"/>`;
    }
  }
  body += '</g>';

  for (const node of nodes) {
    const ordered = node.column > 16;
    if (ordered) {
      const size = 9 + node.mass;
      body += `<rect x="${f(node.x - size)}" y="${f(node.y - size * 0.58)}" width="${f(size * 2)}" height="${f(size * 1.16)}" rx="3" fill="${COLOR.paper}" stroke="${COLOR.ink}" stroke-width="1.35" opacity="${f(0.36 + node.column / columns * 0.42)}"/>`;
    } else {
      body += circle(node.x, node.y, node.mass, node.column < 5 ? COLOR.inkSoft : COLOR.ink, 0.22 + node.column / columns * 0.4);
    }
  }

  const review = nodes.filter((node) => node.row === 4 || (node.column > 12 && node.row === 3));
  const trace = review.sort((a, b) => a.column - b.column).filter((node, index, all) => index === 0 || node.column !== all[index - 1].column);
  body += polyline(trace.map((node) => [node.x, node.y]), COLOR.red, 3.4, 0.9);
  for (const node of trace.filter((_, index) => index % 3 === 0)) body += circle(node.x, node.y, 5.2, COLOR.red, 0.94, COLOR.paper, 2);
  const last = trace.at(-1);
  body += `<path d="M ${f(last.x)} ${f(last.y)} C 1850 690, 1710 760, 1512 704 C 1340 656, 1390 570, 1510 560" fill="none" stroke="${COLOR.red}" stroke-width="2.3" opacity="0.68" stroke-dasharray="2 10"/>`;
  body += signalGate(1510, 560, Math.PI / 2, 0.9);
  return svg('appsec-agent-v2', body, 0x2aa7c2);
}

function springAnalyzerArtV2() {
  const random = rng(0x317a2027);
  const regions = [];
  let body = '';
  function split(x, y, width, height, depth, lineage) {
    if (depth === 0 || width < 92 || height < 72) {
      regions.push({ x, y, width, height, depth, lineage });
      return;
    }
    const vertical = width / height > 1.45 ? true : height / width > 1.45 ? false : random() > 0.48;
    const ratio = 0.35 + random() * 0.3;
    if (vertical) {
      split(x, y, width * ratio, height, depth - 1, `${lineage}0`);
      split(x + width * ratio, y, width * (1 - ratio), height, depth - 1, `${lineage}1`);
    } else {
      split(x, y, width, height * ratio, depth - 1, `${lineage}0`);
      split(x, y + height * ratio, width, height * (1 - ratio), depth - 1, `${lineage}1`);
    }
  }
  split(105, 82, 1710, 676, 6, 'r');

  const bands = [82, 245, 420, 595, 758];
  for (let band = 0; band < bands.length - 1; band += 1) {
    body += `<rect x="72" y="${bands[band]}" width="1776" height="${bands[band + 1] - bands[band]}" fill="${band % 2 ? COLOR.paperDeep : COLOR.paper}" opacity="0.36"/>`;
  }
  for (const region of regions) {
    const inset = 7 + (region.lineage.length % 3) * 3;
    const opacity = 0.16 + (region.lineage.length % 4) * 0.055;
    body += `<rect x="${f(region.x + inset)}" y="${f(region.y + inset)}" width="${f(Math.max(2, region.width - inset * 2))}" height="${f(Math.max(2, region.height - inset * 2))}" rx="${f(2 + region.lineage.length % 5)}" fill="none" stroke="${COLOR.ink}" stroke-width="1.2" opacity="${f(opacity)}"/>`;
    if (region.width * region.height > 16000) {
      const cy = region.y + region.height / 2;
      body += line(region.x + inset * 2, cy, region.x + region.width - inset * 2, cy, COLOR.ink, 0.8, 0.12, 'stroke-dasharray="1 8"');
    }
  }

  // Neutral dependencies use the legal gates cut by the partition; the red rule
  // changes semantic state and crosses persistence independently of that grammar.
  const neutralRows = [155, 325, 500, 680];
  for (const [rowIndex, y] of neutralRows.entries()) {
    const points = [];
    for (let step = 0; step <= 18; step += 1) {
      const x = 125 + step * 92;
      points.push([x, y + Math.sin(step * 1.4 + rowIndex) * 18]);
    }
    body += polyline(points, COLOR.inkSoft, 1.6, 0.36, 'stroke-dasharray="2 9"');
  }
  const redPath = [[132, 165], [385, 165], [555, 316], [780, 316], [936, 455], [1168, 455], [1370, 672], [1768, 672]];
  body += polyline(redPath, COLOR.red, 4, 0.92);
  for (const [index, point] of redPath.entries()) {
    if (index === 2 || index === 4 || index === 6) body += signalGate(point[0], point[1], Math.PI / 4, 0.7);
    else body += circle(point[0], point[1], 5, COLOR.red, 0.92, COLOR.paper, 2);
  }
  for (let deposit = 0; deposit < 90; deposit += 1) {
    const x = 930 + random() * 500;
    const y = 438 + random() * 48;
    body += line(x, y, x + 5 + random() * 13, y + (random() - 0.5) * 8, COLOR.red, 0.9, 0.14 + random() * 0.16);
  }
  return svg('spring-analyzer-v2', body, 0x31aa18);
}

function comparisonArtV2() {
  const random = rng(0x4e6a4);
  const columns = 28;
  const rows = 7;
  const x0 = 150;
  const width = 1620;
  const panelY = [140, 420, 700];
  const topology = [];
  for (let column = 0; column < columns; column += 1) {
    topology.push(Array.from({ length: rows }, (_, row) => ({
      x: x0 + column * width / (columns - 1),
      y: (row - (rows - 1) / 2) * 28 + Math.sin(column * 0.7 + row) * 9 + (random() - 0.5) * 8,
    })));
  }
  let body = '';
  const budgets = [9, 18, 28];
  for (const [panel, centerY] of panelY.entries()) {
    body += line(104, centerY - 112, 1816, centerY - 112, COLOR.ink, 1, 0.12);
    for (let column = 0; column < columns - 1; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const node = topology[column][row];
        const choices = [row, Math.max(0, row - 1), Math.min(rows - 1, row + 1)];
        for (const nextRow of choices.slice(0, column % 3 === 0 ? 3 : 2)) {
          const next = topology[column + 1][nextRow];
          body += line(node.x, centerY + node.y, next.x, centerY + next.y, COLOR.ink, 0.9, panel === 2 ? 0.23 : 0.13);
        }
      }
    }
    const active = [];
    let row = 3;
    for (let column = 0; column < budgets[panel]; column += 1) {
      const node = topology[column][row];
      active.push([node.x, centerY + node.y]);
      if (column % 5 === 2) row = Math.max(0, Math.min(rows - 1, row + (column % 10 < 5 ? -1 : 1)));
    }
    body += polyline(active, panel === 2 ? COLOR.red : (panel === 1 ? COLOR.clay : COLOR.inkSoft), panel === 2 ? 4 : 2.8, panel === 2 ? 0.94 : 0.64);
    for (const [index, point] of active.entries()) {
      if (index % 4 === 0) body += circle(point[0], point[1], panel === 2 ? 4.4 : 3.2, panel === 2 ? COLOR.red : COLOR.ink, 0.8, COLOR.paper, 1.4);
    }
    const end = active.at(-1);
    body += signalGate(end[0], end[1], 0, panel === 2 ? 0.8 : 0.55, panel === 2 ? COLOR.red : COLOR.inkSoft);
  }
  return svg('semgrep-codeql-opentaint-v2', body, 0x4cda0f);
}

function conductorArtV2() {
  const random = rng(0x5c0118);
  const center = [1080, 420];
  const rings = [120, 220, 330];
  const counts = [7, 13, 19];
  const nodes = [];
  let body = '';
  for (const [ringIndex, radius] of rings.entries()) {
    const ring = [];
    for (let index = 0; index < counts[ringIndex]; index += 1) {
      const angle = index * TAU / counts[ringIndex] + ringIndex * 0.23;
      const radial = radius + (random() - 0.5) * 32;
      ring.push({ x: center[0] + Math.cos(angle) * radial * 1.55, y: center[1] + Math.sin(angle) * radial, angle, ringIndex, index });
    }
    nodes.push(ring);
  }

  body += `<ellipse cx="${center[0]}" cy="${center[1]}" rx="188" ry="118" fill="${COLOR.paperDeep}" opacity="0.48"/>`;
  body += `<ellipse cx="${center[0]}" cy="${center[1]}" rx="154" ry="92" fill="${COLOR.paper}" stroke="${COLOR.ink}" stroke-width="1.4" opacity="0.9"/>`;
  body += '<g fill="none" stroke-linecap="round">';
  for (const [ringIndex, ring] of nodes.entries()) {
    for (let index = 0; index < ring.length; index += 1) {
      const node = ring[index];
      const next = ring[(index + 1) % ring.length];
      body += line(node.x, node.y, next.x, next.y, COLOR.ink, ringIndex === 0 ? 1.7 : 1.05, 0.18 + (2 - ringIndex) * 0.08);
      if (ringIndex > 0) {
        const inner = nodes[ringIndex - 1];
        const target = inner[Math.floor(index * inner.length / ring.length) % inner.length];
        body += line(node.x, node.y, target.x, target.y, COLOR.inkSoft, 0.9, 0.17);
      }
      if (index % 3 === 0) {
        const chord = ring[(index + 4 + ringIndex) % ring.length];
        body += line(node.x, node.y, chord.x, chord.y, COLOR.ink, 0.7, 0.11);
      }
    }
  }
  body += '</g>';
  for (const ring of nodes) {
    for (const node of ring) body += circle(node.x, node.y, node.ringIndex === 0 ? 5 : 3, COLOR.paper, 0.9, COLOR.ink, node.ringIndex === 0 ? 1.6 : 1);
  }

  // A selected complementary subset enters from the upper-left, crosses the
  // workflow boundary, changes state at the gate, and exits independently.
  const active = [[78, 108], [280, 164], [465, 132], [650, 248], [812, 230], [927, 335], [1005, 382], [1172, 502], [1308, 478], [1460, 620], [1665, 584], [1845, 730]];
  body += polyline(active, COLOR.red, 4, 0.92);
  for (const [index, point] of active.entries()) {
    if (index === 6) body += signalGate(point[0], point[1], -0.55, 0.95);
    else if (index % 2 === 0) body += circle(point[0], point[1], 4.5, COLOR.red, 0.92, COLOR.paper, 1.8);
  }
  for (let echo = 0; echo < 8; echo += 1) {
    const offset = 18 + echo * 11;
    const echoPath = active.slice(3, 10).map(([x, y], index) => [x, y + Math.sin(index * 1.3 + echo) * offset]);
    body += polyline(echoPath, echo % 3 === 0 ? COLOR.clay : COLOR.ink, 0.8, 0.08 + echo * 0.012);
  }
  return svg('conductor-rce-v2', body, 0x5a17cf);
}

// V3 moves away from explanatory diagrams. These functions build fields first,
// then let repeated local interactions accumulate into the final composition.
function hashNoiseV3(x, y, seed) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 0.000173) * 43758.5453123;
  return value - Math.floor(value);
}

function smoothstepV3(value) {
  return value * value * (3 - 2 * value);
}

function valueNoiseV3(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstepV3(x - ix);
  const fy = smoothstepV3(y - iy);
  const a = hashNoiseV3(ix, iy, seed);
  const b = hashNoiseV3(ix + 1, iy, seed);
  const c = hashNoiseV3(ix, iy + 1, seed);
  const d = hashNoiseV3(ix + 1, iy + 1, seed);
  const top = a + (b - a) * fx;
  const bottom = c + (d - c) * fx;
  return top + (bottom - top) * fy;
}

function fbmV3(x, y, seed, octaves = 4) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoiseV3(x * frequency, y * frequency, seed + octave * 1013) * amplitude;
    frequency *= 2.03;
    amplitude *= 0.48;
  }
  return value;
}

function closedPolyline(points, stroke, width = 1, opacity = 1, extra = '') {
  return `<path d="${pathFrom(points, true)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" ${extra}/>`;
}

function taintFieldArtV3() {
  const random = rng(0x71a1728);
  const join = [1080, 455];
  let body = '';
  const traces = [];

  for (let family = 0; family < 2; family += 1) {
    const count = family === 0 ? 82 : 49;
    for (let index = 0; index < count; index += 1) {
      let x = -30 + random() * 75;
      let y = family === 0
        ? -20 + index * 4.45 + (random() - 0.5) * 18
        : 840 - index * 5.2 + (random() - 0.5) * 18;
      const points = [[x, y]];
      for (let step = 0; step < 92; step += 1) {
        const progress = Math.max(0, Math.min(1, x / join[0]));
        const field = fbmV3(x * 0.0028, y * 0.0038, 0x71a + family * 97, 3) - 0.48;
        const envelope = Math.pow(progress, 1.65);
        x += 13 + random() * 2.2;
        y += (join[1] - y) * (0.004 + envelope * 0.075) + field * 10 + Math.sin(x * 0.008 + index * 0.13) * 1.4;
        points.push([x, y]);
        if (x >= join[0] - 16) break;
      }
      traces.push({ points, family, major: index % 13 === 4 || index % 17 === 8 });
    }
  }

  // Broad underdrawing creates visual mass; fine lines and deposits retain a
  // plotted, material surface at full size.
  for (const trace of traces) {
    const tone = trace.family === 0 ? COLOR.ink : COLOR.clay;
    if (trace.major) body += polyline(trace.points, tone, 9, 0.075);
  }
  for (const trace of traces) {
    const tone = trace.family === 0 ? COLOR.ink : COLOR.clay;
    body += polyline(trace.points, tone, trace.major ? 2.9 : 0.9, trace.major ? 0.72 : 0.19);
    if (trace.major) {
      for (let index = 8; index < trace.points.length - 1; index += 7) {
        const current = trace.points[index];
        const next = trace.points[index + 1];
        const angle = Math.atan2(next[1] - current[1], next[0] - current[0]) + Math.PI / 2;
        const length = 4 + random() * 11;
        body += line(current[0] - Math.cos(angle) * length, current[1] - Math.sin(angle) * length, current[0] + Math.cos(angle) * length, current[1] + Math.sin(angle) * length, tone, 0.7, 0.22);
      }
    }
  }

  // The new state does not merely continue: it drives a turbulent wake whose
  // density is determined by distance from the semantic join.
  for (let index = 0; index < 51; index += 1) {
    let x = join[0] + 31;
    let y = join[1] + (random() - 0.5) * 18;
    const points = [[x, y]];
    const direction = (index - 31) / 38 - 0.18;
    for (let step = 0; step < 58; step += 1) {
      const p = step / 58;
      const field = fbmV3(x * 0.0035, y * 0.004, 0x991, 4) - 0.5;
      x += 14 + random() * 2;
      y += direction * (0.8 + p * 3.8) + field * 11 + Math.sin(step * 0.22 + index) * 0.7;
      points.push([x, y]);
    }
    const active = index === 18 || index === 23 || index === 28;
    body += polyline(points, active ? COLOR.red : (index % 2 ? COLOR.ink : COLOR.redDark), active ? 3.3 : 0.9, active ? 0.9 : 0.12 + (index % 2) * 0.05);
  }
  return svg('taint-field-v3', body, 0x71a1728);
}

function appsecSwarmArtV3() {
  const random = rng(0xa993c28);
  const attractors = [[420, 250], [690, 560], [985, 290], [1250, 525], [1535, 280]];
  const trails = [];
  let body = '';
  for (let agent = 0; agent < 148; agent += 1) {
    let x = 90 + random() * 330;
    let y = 90 + random() * 660;
    let vx = 2 + random() * 3;
    let vy = (random() - 0.5) * 3;
    const points = [[x, y]];
    for (let step = 0; step < 155; step += 1) {
      const targetIndex = Math.min(attractors.length - 1, Math.floor((x / WIDTH) * attractors.length));
      const target = attractors[targetIndex];
      const dx = target[0] - x;
      const dy = target[1] - y;
      const distance = Math.max(30, Math.hypot(dx, dy));
      const swirl = (agent % 2 ? 1 : -1) * Math.min(1.6, 1300 / (distance * distance));
      const field = fbmV3(x * 0.003, y * 0.003, 0xa93 + targetIndex * 71, 3) - 0.5;
      vx += dx / distance * 0.045 - dy / distance * swirl * 0.18 + field * 0.09;
      vy += dy / distance * 0.045 + dx / distance * swirl * 0.18 + field * 0.13;
      const speed = Math.hypot(vx, vy);
      if (speed > 6.2) { vx *= 6.2 / speed; vy *= 6.2 / speed; }
      x += vx;
      y += vy;
      if (step % 3 === 0) points.push([x, y]);
      if (x > 1840 || y < 28 || y > 812) break;
    }
    trails.push({ points, weight: 0.7 + random() * 1.4 });
  }

  for (const trail of trails) {
    body += polyline(trail.points, COLOR.ink, trail.weight, 0.11 + trail.weight * 0.055);
  }
  const feedback = trails[37].points.slice(9);
  body += polyline(feedback, COLOR.paper, 10, 0.72);
  body += polyline(feedback, COLOR.red, 3.2, 0.9);
  // Quiet evidence particles turn the swarm into a field rather than a bundle
  // of identical curves.
  for (let mark = 0; mark < 420; mark += 1) {
    const x = 130 + random() * 1580;
    const wave = 420 + Math.sin(x * 0.007) * 170;
    const y = wave + (random() - 0.5) * 300;
    body += circle(x, y, 0.7 + random() * 2.1, COLOR.ink, 0.09 + random() * 0.13);
  }
  return svg('appsec-swarm-v3', body, 0xa993c28);
}

function reactionDiffusionArtV3() {
  const gridWidth = 154;
  const gridHeight = 62;
  let u = new Float32Array(gridWidth * gridHeight).fill(1);
  let v = new Float32Array(gridWidth * gridHeight);
  const random = rng(0x5a71b28);
  const indexOf = (x, y) => y * gridWidth + x;
  for (let seed = 0; seed < 24; seed += 1) {
    const cx = 8 + Math.floor(random() * (gridWidth - 16));
    const cy = 5 + Math.floor(random() * (gridHeight - 10));
    const radius = 2 + Math.floor(random() * 3);
    for (let y = -radius; y <= radius; y += 1) for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y <= radius * radius) v[indexOf(cx + x, cy + y)] = 1;
    }
  }
  for (let iteration = 0; iteration < 310; iteration += 1) {
    const nextU = u.slice();
    const nextV = v.slice();
    for (let y = 1; y < gridHeight - 1; y += 1) {
      for (let x = 1; x < gridWidth - 1; x += 1) {
        const index = indexOf(x, y);
        const lapU = u[indexOf(x - 1, y)] + u[indexOf(x + 1, y)] + u[indexOf(x, y - 1)] + u[indexOf(x, y + 1)] - 4 * u[index];
        const lapV = v[indexOf(x - 1, y)] + v[indexOf(x + 1, y)] + v[indexOf(x, y - 1)] + v[indexOf(x, y + 1)] - 4 * v[index];
        const feed = 0.034 + y / gridHeight * 0.018;
        const kill = 0.061 + Math.sin(x * 0.06) * 0.0025;
        const uvv = u[index] * v[index] * v[index];
        nextU[index] = u[index] + 0.17 * (0.96 * lapU - uvv + feed * (1 - u[index]));
        nextV[index] = v[index] + 0.17 * (0.48 * lapV + uvv - (feed + kill) * v[index]);
      }
    }
    u = nextU;
    v = nextV;
  }

  let body = '';
  const scaleX = 1760 / gridWidth;
  const scaleY = 700 / gridHeight;
  const x0 = 80;
  const y0 = 70;
  for (let band = 1; band < 4; band += 1) {
    const y = y0 + band * 700 / 4;
    body += `<rect x="60" y="${f(y - 34)}" width="1800" height="68" fill="${COLOR.paperDeep}" opacity="0.28"/>`;
  }
  const levels = [0.12, 0.2, 0.29, 0.38];
  for (const [levelIndex, level] of levels.entries()) {
    for (let y = 0; y < gridHeight - 1; y += 1) {
      for (let x = 0; x < gridWidth - 1; x += 1) {
        const a = v[indexOf(x, y)] >= level;
        const b = v[indexOf(x + 1, y)] >= level;
        const c = v[indexOf(x + 1, y + 1)] >= level;
        const d = v[indexOf(x, y + 1)] >= level;
        const state = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
        if (state === 0 || state === 15) continue;
        const left = [x0 + x * scaleX, y0 + (y + 0.5) * scaleY];
        const right = [x0 + (x + 1) * scaleX, y0 + (y + 0.5) * scaleY];
        const top = [x0 + (x + 0.5) * scaleX, y0 + y * scaleY];
        const bottom = [x0 + (x + 0.5) * scaleX, y0 + (y + 1) * scaleY];
        const pairs = {
          1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]],
          5: [[top, left], [bottom, right]], 6: [[top, bottom]], 7: [[top, left]], 8: [[left, top]],
          9: [[top, bottom]], 10: [[left, bottom], [top, right]], 11: [[top, right]], 12: [[left, right]],
          13: [[bottom, right]], 14: [[left, bottom]],
        }[state] || [];
        for (const pair of pairs) {
          const semanticBand = y > 25 && y < 38 && x > 61 && x < 126 && levelIndex === 2;
          body += line(pair[0][0], pair[0][1], pair[1][0], pair[1][1], semanticBand ? COLOR.red : (levelIndex === 0 ? COLOR.clay : COLOR.ink), semanticBand ? 2.1 : 0.8 + levelIndex * 0.22, semanticBand ? 0.78 : 0.11 + levelIndex * 0.08);
        }
      }
    }
  }
  // Sparse vertical gates cut through the organic field and make the framework
  // layering felt without turning it back into architecture boxes.
  return svg('spring-reaction-v3', body, 0x5a71b28);
}

function analysisDepthArtV3() {
  const random = rng(0xd3e9728);
  const islands = [
    { x: 340, y: 505, rx: 300, ry: 205, count: 52, steps: 24, color: COLOR.ink },
    { x: 930, y: 280, rx: 345, ry: 220, count: 44, steps: 48, color: COLOR.clay },
    { x: 1510, y: 500, rx: 350, ry: 235, count: 38, steps: 76, color: COLOR.red },
  ];
  let body = '';
  // A single quiet terrain sits underneath three different traversal species.
  for (let contour = 0; contour < 24; contour += 1) {
    const points = [];
    for (let step = 0; step <= 80; step += 1) {
      const p = step / 80;
      points.push([10 + p * 1900, 420 + Math.sin(p * 7 + contour * 0.21) * (90 + contour * 3) + (contour - 12) * 9]);
    }
    body += polyline(points, COLOR.ink, 0.7, 0.045);
  }
  for (const [islandIndex, island] of islands.entries()) {
    for (let strand = 0; strand < island.count; strand += 1) {
      const points = [];
      const phase = random() * TAU;
      const startAngle = random() * TAU;
      const length = island.steps - Math.floor(random() * 9);
      for (let step = 0; step <= length; step += 1) {
        const p = step / Math.max(1, length);
        const angle = startAngle + p * (islandIndex === 0 ? 1.1 : islandIndex === 1 ? 2.7 : 4.8);
        const radius = (0.18 + p * 0.82) * (0.5 + strand / island.count * 0.5);
        const field = fbmV3(Math.cos(angle) + strand * 0.04, Math.sin(angle) + p * 1.7, 0xd39 + islandIndex * 111, 4) - 0.48;
        const x = island.x + Math.cos(angle) * island.rx * radius + field * 80;
        const y = island.y + Math.sin(angle) * island.ry * radius + field * 55;
        points.push([x, y]);
      }
      const chosen = islandIndex === 2 && strand === 17;
      body += polyline(points, chosen ? COLOR.red : island.color, chosen ? 3.6 : 0.8 + islandIndex * 0.15, chosen ? 0.92 : 0.1 + islandIndex * 0.035);
    }
    for (let deposit = 0; deposit < 120 + islandIndex * 35; deposit += 1) {
      const angle = random() * TAU;
      const radius = Math.sqrt(random());
      const x = island.x + Math.cos(angle) * island.rx * radius;
      const y = island.y + Math.sin(angle) * island.ry * radius;
      body += line(x, y, x + (random() - 0.5) * 15, y + (random() - 0.5) * 8, island.color, 0.8, 0.08 + islandIndex * 0.025);
    }
  }
  return svg('analysis-depth-v3', body, 0xd3e9728);
}

function conductorGrowthArtV3() {
  const random = rng(0xc0dd728);
  const center = [1150, 420];
  let body = '';
  const contours = [];
  for (let layer = 0; layer < 28; layer += 1) {
    const points = [];
    const base = 72 + layer * 13.2;
    for (let index = 0; index < 180; index += 1) {
      const angle = index / 180 * TAU;
      const fold = Math.sin(angle * 3 + layer * 0.21) * 15
        + Math.sin(angle * 7 - layer * 0.13) * (5 + layer * 0.44)
        + (fbmV3(Math.cos(angle) * 1.3 + 2, Math.sin(angle) * 1.3 + layer * 0.035, 0xc0d, 4) - 0.45) * 54;
      const radius = base + fold;
      points.push([center[0] + Math.cos(angle) * radius * 1.62, center[1] + Math.sin(angle) * radius]);
    }
    contours.push(points);
  }
  for (const [layer, points] of contours.entries()) {
    const start = 7 + layer % 17;
    const end = 166 - layer % 13;
    const openArc = points.slice(start, end);
    if (layer % 7 === 0) body += polyline(openArc, COLOR.ink, 8, 0.045);
    body += polyline(openArc, layer % 5 === 0 ? COLOR.clay : COLOR.ink, layer % 6 === 0 ? 2 : 0.85, layer % 6 === 0 ? 0.38 : 0.14 + layer * 0.003);
  }
  // Cross-contour fibers expose the growth history and add a second scale.
  for (let fiber = 0; fiber < 88; fiber += 1) {
    const angleIndex = Math.floor(random() * 180);
    const fromLayer = Math.floor(random() * 14);
    const toLayer = Math.min(27, fromLayer + 5 + Math.floor(random() * 9));
    const points = [];
    for (let layer = fromLayer; layer <= toLayer; layer += 1) points.push(contours[layer][(angleIndex + layer) % 180]);
    body += polyline(points, COLOR.inkSoft, 0.7, 0.1 + random() * 0.08);
  }
  // The breach is an incision through a self-organizing boundary, not an arrow.
  const breachPath = 'M -30 690 C 360 790 690 650 920 585 C 1080 710 1245 650 1390 390 C 1510 260 1715 165 1950 84';
  body += `<path d="${breachPath}" fill="none" stroke="${COLOR.paper}" stroke-width="13" stroke-linecap="round" opacity="0.92"/>`;
  body += `<path d="${breachPath}" fill="none" stroke="${COLOR.red}" stroke-width="4.2" stroke-linecap="round" opacity="0.94"/>`;
  return svg('conductor-growth-v3', body, 0xc0dd728);
}

const artworks = {
  'what-is-taint-analysis.svg': taintFieldArtV3(),
  'appsec-agent.svg': appsecSwarmArtV3(),
  'spring-analyzer.svg': reactionDiffusionArtV3(),
  'semgrep-vs-codeql-vs-opentaint.svg': analysisDepthArtV3(),
  'conductor-rce.svg': conductorGrowthArtV3(),
};

fs.mkdirSync(OUTPUT, { recursive: true });
for (const [filename, contents] of Object.entries(artworks)) {
  fs.writeFileSync(path.join(OUTPUT, filename), contents, 'utf8');
}

console.log(`Generated ${Object.keys(artworks).length} deterministic SVG artworks in ${path.relative(ROOT, OUTPUT)}`);
for (const filename of Object.keys(artworks)) console.log(`- ${filename}`);
