// Deterministic JavaScript/SVG studies derived from the documented mechanics in
// Inconvergent's Differential Line, Differential Mesh, and Differential Lattice.
// The source projects use Cython/CUDA and spatial indexes; this file keeps the
// same local rules in a small CPU implementation so every SVG is reproducible.

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const ART_VERSION = 'inconvergent-differential-1.0.0';

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

const SOURCE = {
  line: 'https://inconvergent.net/generative/differential-line/',
  mesh: 'https://inconvergent.net/generative/differential-mesh/',
  lattice: 'https://inconvergent.net/generative/differential-lattice/',
};

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deriveSeed(seed, label) {
  return hashSeed(`${seed}:${label}`);
}

function f(value) {
  return Number(value.toFixed(2));
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function normalize(x, y) {
  const magnitude = Math.hypot(x, y) || 1;
  return [x / magnitude, y / magnitude];
}

function dot(ax, ay, bx, by) {
  return ax * bx + ay * by;
}

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

function pathD(points, close = false) {
  if (!points.length) return '';
  return `${points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point[0])} ${f(point[1])}`).join(' ')}${close ? ' Z' : ''}`;
}

function pathElement(points, stroke, width = 1, opacity = 1, close = false, extra = '') {
  return `<path d="${pathD(points, close)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round" opacity="${f(opacity)}" ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" ${extra}/>`;
}

function circle(cx, cy, radius, fill, opacity = 1, stroke = 'none', strokeWidth = 0, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(strokeWidth)}" ${extra}/>`;
}

function polygon(points, fill = 'none', stroke = 'none', width = 0, opacity = 1, extra = '') {
  return `<path d="${pathD(points, true)}" fill="${fill}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linejoin="round" ${extra}/>`;
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function edgeKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function background() {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.paper}"/>`;
}

function svg(name, description, seed, source, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" data-generator="inconvergent-differential" data-generator-version="${ART_VERSION}" data-seed="${seed >>> 0}" data-source="${source}" data-artwork="${name}">
  <title>${escapeText(name.replaceAll('-', ' '))}</title>
  <desc>${escapeText(description)}</desc>
  ${background()}
  ${body}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Differential Line
// ---------------------------------------------------------------------------

function lineCurvature(nodes, index) {
  const count = nodes.length;
  const previous = nodes[(index - 1 + count) % count];
  const current = nodes[index];
  const next = nodes[(index + 1) % count];
  const aX = current.x - previous.x;
  const aY = current.y - previous.y;
  const bX = next.x - current.x;
  const bY = next.y - current.y;
  const aLength = Math.hypot(aX, aY) || 1;
  const bLength = Math.hypot(bX, bY) || 1;
  return Math.abs(cross(aX, aY, bX, bY)) / (aLength * bLength) * (aLength + bLength) * 0.5;
}

function lineEdgeLength(nodes, index) {
  return distance(nodes[index], nodes[(index + 1) % nodes.length]);
}

function lineRelax(nodes, near, far, passes = 2) {
  const count = nodes.length;
  for (let pass = 0; pass < passes; pass += 1) {
    const delta = nodes.map(() => [0, 0]);
    for (let index = 0; index < count; index += 1) {
      const current = nodes[index];
      const previousIndex = (index - 1 + count) % count;
      const nextIndex = (index + 1) % count;
      const force = [0, 0];

      for (const neighborIndex of [previousIndex, nextIndex]) {
        const neighbor = nodes[neighborIndex];
        const dx = neighbor.x - current.x;
        const dy = neighbor.y - current.y;
        const length = Math.hypot(dx, dy) || 1;
        const spring = (length - near) * 0.018;
        force[0] += dx / length * spring;
        force[1] += dy / length * spring;
      }

      for (let otherIndex = 0; otherIndex < count; otherIndex += 1) {
        if (otherIndex === index || otherIndex === previousIndex || otherIndex === nextIndex) continue;
        const other = nodes[otherIndex];
        const dx = current.x - other.x;
        const dy = current.y - other.y;
        const length = Math.hypot(dx, dy);
        if (length <= 0 || length >= far) continue;
        const repel = (far / length - 1) * 0.055;
        force[0] += dx / length * repel;
        force[1] += dy / length * repel;
      }

      if (current.x < 100) force[0] += (100 - current.x) * 0.018;
      if (current.x > WIDTH - 100) force[0] -= (current.x - (WIDTH - 100)) * 0.018;
      if (current.y < 100) force[1] += (100 - current.y) * 0.018;
      if (current.y > HEIGHT - 100) force[1] -= (current.y - (HEIGHT - 100)) * 0.018;

      const forceLength = Math.hypot(force[0], force[1]);
      const maximumStep = 3.2;
      if (forceLength > maximumStep) {
        force[0] = force[0] / forceLength * maximumStep;
        force[1] = force[1] / forceLength * maximumStep;
      }
      delta[index] = force;
    }
    for (let index = 0; index < count; index += 1) {
      nodes[index].x = clamp(nodes[index].x + delta[index][0], 54, WIDTH - 54);
      nodes[index].y = clamp(nodes[index].y + delta[index][1], 54, HEIGHT - 54);
    }
  }
}

function lineSplitCurvedEdges(nodes, random, near, maximumNodes) {
  if (nodes.length >= maximumNodes) return;
  let maximumCurvature = 0;
  const candidates = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const curvature = lineCurvature(nodes, index);
    maximumCurvature = Math.max(maximumCurvature, curvature);
    candidates.push({ index, curvature });
  }
  if (maximumCurvature <= 0) return;

  const selected = candidates
    .filter((candidate) => lineEdgeLength(nodes, candidate.index) > near * 0.74)
    .filter((candidate) => random() < (candidate.curvature / maximumCurvature) * 0.3)
    .sort((a, b) => b.curvature - a.curvature)
    .slice(0, 8);

  for (const candidate of selected.sort((a, b) => b.index - a.index)) {
    if (nodes.length >= maximumNodes) break;
    const index = candidate.index;
    const next = (index + 1) % nodes.length;
    const a = nodes[index];
    const b = nodes[next];
    const midpoint = { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
    let clear = true;
    for (let otherIndex = 0; otherIndex < nodes.length; otherIndex += 1) {
      if (otherIndex === index || otherIndex === next) continue;
      if (distance(midpoint, nodes[otherIndex]) < near * 0.58) {
        clear = false;
        break;
      }
    }
    if (clear) nodes.splice(index + 1, 0, midpoint);
  }
}

function differentialLine(seed = 0x1a1e2026) {
  const random = rng(deriveSeed(seed, 'line'));
  const nodes = [];
  const initialCount = 38;
  const phase = random() * TAU;
  for (let index = 0; index < initialCount; index += 1) {
    const angle = index * TAU / initialCount;
    // Start from a broad, gently folded contour.  The fold is only an initial
    // condition; the visible shape is still produced by linked relaxation and
    // curvature-weighted edge splitting below.
    const radialX = 430 + Math.sin(angle * 2 + phase) * 62 + (random() - 0.5) * 38;
    const radialY = 286 + Math.cos(angle * 3 - phase) * 34 + (random() - 0.5) * 28;
    const fold = Math.sin(angle * 2 + phase) * 72;
    nodes.push({
      x: 800 + Math.cos(angle) * radialX + fold,
      y: 500 + Math.sin(angle) * radialY + Math.cos(angle * 2 - phase) * 22,
    });
  }

  const snapshots = [nodes.map((node) => ({ ...node }))];
  const near = 54;
  const far = 170;
  for (let iteration = 0; iteration < 142; iteration += 1) {
    lineRelax(nodes, near, far, 3);
    lineSplitCurvedEdges(nodes, random, near, 220);
    if (iteration === 24 || iteration === 64 || iteration === 104) snapshots.push(nodes.map((node) => ({ ...node })));
  }

  const curvatures = nodes.map((_, index) => lineCurvature(nodes, index));
  const redEdges = new Set();
  curvatures
    .map((curvature, index) => ({ curvature, index }))
    .sort((a, b) => b.curvature - a.curvature)
    .filter((candidate) => {
      for (const selected of redEdges) {
        const separation = Math.abs(candidate.index - selected);
        if (separation < 8 || nodes.length - separation < 8) return false;
      }
      return true;
    })
    .slice(0, 6)
    .forEach((candidate) => redEdges.add(candidate.index));

  const parts = [];
  for (const [index, snapshot] of snapshots.entries()) {
    const points = snapshot.map((node) => [node.x, node.y]);
    // These are actual intermediate contours, not decorative grain: the
    // translucent fills and wider strokes preserve the line's growth history
    // as a quiet architectural field behind the final contour.
    const stroke = index === 0 ? COLOR.clay : (index === 1 ? COLOR.sand : COLOR.paperDeep);
    const width = index === 0 ? 4.6 : (index === 1 ? 3.3 : 2.2);
    const opacity = index === 0 ? 0.17 : (index === 1 ? 0.16 : 0.14);
    parts.push(polygon(points, COLOR.paperDeep, 'none', 0, index === 0 ? 0.035 : 0.022));
    parts.push(pathElement(points, stroke, width, opacity, true));
  }
  // A broad clay under-contour gives the final line a material presence, while
  // the darker path keeps every edge legible without filling the form.
  parts.push(pathElement(nodes.map((node) => [node.x, node.y]), COLOR.clay, 7.2, 0.12, true));
  parts.push(pathElement(nodes.map((node) => [node.x, node.y]), COLOR.ink, 2.35, 0.82, true));
  for (let index = 0; index < nodes.length; index += 1) {
    const next = (index + 1) % nodes.length;
    const red = redEdges.has(index);
    if (!red) continue;
    parts.push(line(nodes[index].x, nodes[index].y, nodes[next].x, nodes[next].y, COLOR.red, 3.8, 0.92));
    parts.push(circle(nodes[index].x, nodes[index].y, 5.5, COLOR.red, 0.92, COLOR.paper, 1.35));
  }

  return svg(
    'differential-line',
    'A closed line grown by curvature-weighted edge splitting and relaxed by linked attraction and non-linked repulsion.',
    seed,
    SOURCE.line,
    parts.join(''),
  );
}

// ---------------------------------------------------------------------------
// Differential Mesh
// ---------------------------------------------------------------------------

function createSeedMesh(seed) {
  const random = rng(deriveSeed(seed, 'mesh-seed'));
  const nodes = [{ x: 800, y: 500, generation: 0 }];
  const ringCount = 7;
  for (let index = 0; index < ringCount; index += 1) {
    const angle = index * TAU / ringCount - Math.PI / 2;
    const radius = 82 + (random() - 0.5) * 10;
    nodes.push({ x: 800 + Math.cos(angle) * radius, y: 500 + Math.sin(angle) * radius, generation: 0 });
  }
  const faces = [];
  for (let index = 0; index < ringCount; index += 1) {
    const next = (index + 1) % ringCount;
    faces.push({ a: 0, b: 1 + index, c: 1 + next, generation: 0 });
  }
  return { nodes, faces };
}

function faceEdges(face) {
  return [[face.a, face.b], [face.b, face.c], [face.c, face.a]];
}

function meshEdgeMap(faces) {
  const map = new Map();
  for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
    const face = faces[faceIndex];
    for (const [a, b] of faceEdges(face)) {
      const key = edgeKey(a, b);
      if (!map.has(key)) map.set(key, { a, b, faces: [] });
      map.get(key).faces.push(faceIndex);
    }
  }
  return map;
}

function meshFrontier(nodes, faces) {
  const map = meshEdgeMap(faces);
  const frontier = [];
  for (const edge of map.values()) {
    if (edge.faces.length !== 1) continue;
    const face = faces[edge.faces[0]];
    const third = [face.a, face.b, face.c].find((index) => index !== edge.a && index !== edge.b);
    frontier.push({ a: edge.a, b: edge.b, face: edge.faces[0], third, generation: face.generation });
  }
  return frontier;
}

function segmentIntersects(a, b, c, d) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const acx = c.x - a.x;
  const acy = c.y - a.y;
  const adx = d.x - a.x;
  const ady = d.y - a.y;
  const cdx = d.x - c.x;
  const cdy = d.y - c.y;
  const cax = a.x - c.x;
  const cay = a.y - c.y;
  const cbx = b.x - c.x;
  const cby = b.y - c.y;
  const first = cross(abx, aby, acx, acy);
  const second = cross(abx, aby, adx, ady);
  const third = cross(cdx, cdy, cax, cay);
  const fourth = cross(cdx, cdy, cbx, cby);
  return ((first > 0 && second < 0) || (first < 0 && second > 0))
    && ((third > 0 && fourth < 0) || (third < 0 && fourth > 0));
}

function meshCandidateClear(candidate, a, b, nodes, faces, minimum) {
  for (let index = 0; index < nodes.length; index += 1) {
    if (index === a || index === b) continue;
    if (distance(candidate, nodes[index]) < minimum) return false;
  }
  const edges = meshEdgeMap(faces);
  for (const edge of edges.values()) {
    if (edge.a === a || edge.a === b || edge.b === a || edge.b === b) continue;
    const first = nodes[edge.a];
    const second = nodes[edge.b];
    if (segmentIntersects(candidate, nodes[a], first, second) || segmentIntersects(candidate, nodes[b], first, second)) return false;
  }
  return true;
}

function meshRelax(mesh, near, far, passes = 2) {
  const { nodes, faces } = mesh;
  const adjacency = nodes.map(() => new Set());
  const incident = nodes.map(() => []);
  for (const face of faces) {
    const edges = faceEdges(face);
    for (const [a, b] of edges) {
      adjacency[a].add(b);
      adjacency[b].add(a);
    }
    incident[face.a].push(face);
    incident[face.b].push(face);
    incident[face.c].push(face);
  }

  for (let pass = 0; pass < passes; pass += 1) {
    const delta = nodes.map(() => [0, 0]);
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const force = [0, 0];
      for (const neighborIndex of adjacency[index]) {
        const neighbor = nodes[neighborIndex];
        const dx = neighbor.x - node.x;
        const dy = neighbor.y - node.y;
        const length = Math.hypot(dx, dy) || 1;
        const spring = (length - near) * 0.012;
        force[0] += dx / length * spring;
        force[1] += dy / length * spring;
      }
      for (let otherIndex = 0; otherIndex < nodes.length; otherIndex += 1) {
        if (otherIndex === index || adjacency[index].has(otherIndex)) continue;
        const other = nodes[otherIndex];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const length = Math.hypot(dx, dy);
        if (length <= 0 || length >= far) continue;
        const repel = (far / length - 1) * 0.012;
        force[0] += dx / length * repel;
        force[1] += dy / length * repel;
      }
      for (const face of incident[index]) {
        const opposite = [face.a, face.b, face.c].filter((vertex) => vertex !== index);
        const midpoint = {
          x: (nodes[opposite[0]].x + nodes[opposite[1]].x) * 0.5,
          y: (nodes[opposite[0]].y + nodes[opposite[1]].y) * 0.5,
        };
        const dx = midpoint.x - node.x;
        const dy = midpoint.y - node.y;
        const length = Math.hypot(dx, dy) || 1;
        const ideal = near * 0.866;
        const triangleForce = (length - ideal) * 0.009;
        force[0] += dx / length * triangleForce;
        force[1] += dy / length * triangleForce;
      }
      const magnitude = Math.hypot(force[0], force[1]);
      const maximum = near * 0.16;
      if (magnitude > maximum) {
        force[0] = force[0] / magnitude * maximum;
        force[1] = force[1] / magnitude * maximum;
      }
      delta[index] = force;
    }
    for (let index = 0; index < nodes.length; index += 1) {
      nodes[index].x = clamp(nodes[index].x + delta[index][0], 58, WIDTH - 58);
      nodes[index].y = clamp(nodes[index].y + delta[index][1], 58, HEIGHT - 58);
    }
  }
}

function meshSplitLongEdges(mesh, limit) {
  const { nodes, faces } = mesh;
  const midpointIds = new Map();
  const newFaces = [];
  const midpoint = (a, b, generation) => {
    const key = edgeKey(a, b);
    if (midpointIds.has(key)) return midpointIds.get(key);
    const id = nodes.length;
    nodes.push({ x: (nodes[a].x + nodes[b].x) * 0.5, y: (nodes[a].y + nodes[b].y) * 0.5, generation });
    midpointIds.set(key, id);
    return id;
  };

  for (const face of faces) {
    const candidates = faceEdges(face).map(([a, b]) => ({ a, b, length: distance(nodes[a], nodes[b]) }));
    candidates.sort((a, b) => b.length - a.length);
    const longest = candidates[0];
    if (longest.length <= limit) {
      newFaces.push(face);
      continue;
    }
    const middle = midpoint(longest.a, longest.b, face.generation);
    const opposite = [face.a, face.b, face.c].find((vertex) => vertex !== longest.a && vertex !== longest.b);
    const first = { a: longest.a, b: middle, c: opposite, generation: face.generation };
    const second = { a: middle, b: longest.b, c: opposite, generation: face.generation };
    if (cross(nodes[first.b].x - nodes[first.a].x, nodes[first.b].y - nodes[first.a].y, nodes[first.c].x - nodes[first.a].x, nodes[first.c].y - nodes[first.a].y) < 0) {
      [first.a, first.b] = [first.b, first.a];
    }
    if (cross(nodes[second.b].x - nodes[second.a].x, nodes[second.b].y - nodes[second.a].y, nodes[second.c].x - nodes[second.a].x, nodes[second.c].y - nodes[second.a].y) < 0) {
      [second.a, second.b] = [second.b, second.a];
    }
    newFaces.push(first, second);
  }
  mesh.faces = newFaces;
}

function differentialMesh(seed = 0x0e52026) {
  const random = rng(deriveSeed(seed, 'mesh'));
  const mesh = createSeedMesh(seed);
  const height = 54;
  const near = height * 1.06;
  const far = height * 3.7;

  for (let iteration = 0; iteration < 34; iteration += 1) {
    const frontier = meshFrontier(mesh.nodes, mesh.faces);
    const candidates = [];
    for (const edge of frontier) {
      const a = mesh.nodes[edge.a];
      const b = mesh.nodes[edge.b];
      const third = mesh.nodes[edge.third];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy) || 1;
      if (length < height * 0.7 || length > height * 2.2) continue;
      const tangent = [dx / length, dy / length];
      const leftNormal = [-tangent[1], tangent[0]];
      const midpoint = { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
      const interior = dot(third.x - midpoint.x, third.y - midpoint.y, leftNormal[0], leftNormal[1]);
      const outward = interior > 0 ? [-leftNormal[0], -leftNormal[1]] : leftNormal;
      const offset = (random() - 0.5) * height * 0.38;
      const candidate = {
        x: midpoint.x + outward[0] * height + tangent[0] * offset,
        y: midpoint.y + outward[1] * height + tangent[1] * offset,
      };
      if (candidate.x < 60 || candidate.x > WIDTH - 60 || candidate.y < 60 || candidate.y > HEIGHT - 60) continue;
      if (!meshCandidateClear(candidate, edge.a, edge.b, mesh.nodes, mesh.faces, height * 0.68)) continue;
      const preference = edge.generation + random() * 2.2 + (iteration % 5 === 0 ? random() : 0);
      candidates.push({ edge, candidate, preference });
    }

    candidates.sort((a, b) => b.preference - a.preference);
    const accepted = [];
    for (const item of candidates.slice(0, 9)) {
      if (mesh.nodes.length >= 360) break;
      if (!meshCandidateClear(item.candidate, item.edge.a, item.edge.b, mesh.nodes, mesh.faces, height * 0.68)) continue;
      if (accepted.some((other) => distance(item.candidate, other.candidate) < height * 0.8)) continue;
      const id = mesh.nodes.length;
      mesh.nodes.push({ x: item.candidate.x, y: item.candidate.y, generation: iteration + 1 });
      const raw = { a: item.edge.a, b: item.edge.b, c: id, generation: iteration + 1 };
      if (cross(mesh.nodes[raw.b].x - mesh.nodes[raw.a].x, mesh.nodes[raw.b].y - mesh.nodes[raw.a].y, mesh.nodes[raw.c].x - mesh.nodes[raw.a].x, mesh.nodes[raw.c].y - mesh.nodes[raw.a].y) < 0) {
        [raw.a, raw.b] = [raw.b, raw.a];
      }
      mesh.faces.push(raw);
      accepted.push(item);
    }

    meshRelax(mesh, near, far, 2);
    if (iteration % 7 === 6) meshSplitLongEdges(mesh, height * 1.85);
  }

  const edges = meshEdgeMap(mesh.faces);
  const growthFaces = mesh.faces
    .map((face, index) => ({ face, index }))
    .filter(({ face }) => face.generation > 15)
    .filter(({ index }) => (index + Math.floor(seed)) % 13 === 0)
    .slice(0, 8)
    .map(({ index }) => index);
  const redFaces = new Set(growthFaces);
  const parts = [];

  for (const [index, face] of mesh.faces.entries()) {
    const points = [mesh.nodes[face.a], mesh.nodes[face.b], mesh.nodes[face.c]].map((node) => [node.x, node.y]);
    const red = redFaces.has(index);
    const fill = red ? COLOR.red : face.generation % 5 === 0 ? COLOR.clay : COLOR.paperDeep;
    const opacity = red ? 0.12 : 0.025 + Math.min(0.045, face.generation * 0.0015);
    parts.push(polygon(points, fill, 'none', 0, opacity));
  }

  for (const edge of edges.values()) {
    const first = mesh.nodes[edge.a];
    const second = mesh.nodes[edge.b];
    const red = edge.faces.some((faceIndex) => redFaces.has(faceIndex));
    const boundary = edge.faces.length === 1;
    parts.push(line(first.x, first.y, second.x, second.y, red ? COLOR.red : (boundary ? COLOR.ink : COLOR.inkSoft), red ? 2.2 : boundary ? 1.25 : 0.68, red ? 0.76 : boundary ? 0.48 : 0.2));
  }

  for (const faceIndex of growthFaces) {
    const face = mesh.faces[faceIndex];
    const centroid = {
      x: (mesh.nodes[face.a].x + mesh.nodes[face.b].x + mesh.nodes[face.c].x) / 3,
      y: (mesh.nodes[face.a].y + mesh.nodes[face.b].y + mesh.nodes[face.c].y) / 3,
    };
    parts.push(circle(centroid.x, centroid.y, 3.2, COLOR.red, 0.82, COLOR.paper, 1));
  }

  return svg(
    'differential-mesh',
    'A triangular mesh grown from a compact seed by outward surface insertion, free-space tests, local attraction, repulsion, and edge splitting.',
    seed,
    SOURCE.mesh,
    parts.join(''),
  );
}

// ---------------------------------------------------------------------------
// Differential Lattice
// ---------------------------------------------------------------------------

function latticeDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function latticeProximity(nodes, outer) {
  return nodes.map((node, index) => nodes
    .map((candidate, candidateIndex) => ({ candidateIndex, distance: candidateIndex === index ? Infinity : latticeDistance(node, candidate) }))
    .filter((item) => item.distance < outer)
    .sort((a, b) => a.distance - b.distance));
}

function latticeLinksFor(i, j, proximity, linkIgnore) {
  const distanceIJ = proximity[i].find((item) => item.candidateIndex === j)?.distance ?? Infinity;
  if (distanceIJ > linkIgnore) return false;
  for (const item of proximity[i]) {
    const k = item.candidateIndex;
    if (k === j) continue;
    const distanceJK = proximity[j].find((candidate) => candidate.candidateIndex === k)?.distance ?? Infinity;
    if (distanceIJ > Math.max(item.distance, distanceJK)) return false;
  }
  return true;
}

function latticeStep(nodes, options) {
  const proximity = latticeProximity(nodes, options.outerInfluence);
  const links = nodes.map(() => new Set());
  const delta = nodes.map(() => [0, 0]);

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const force = [0, 0];
    for (const item of proximity[index]) {
      const other = nodes[item.candidateIndex];
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const length = item.distance || 1;
      const nx = dx / length;
      const ny = dy / length;
      const linked = latticeLinksFor(index, item.candidateIndex, proximity, options.linkIgnore);
      if (linked) {
        links[index].add(item.candidateIndex);
        if (length > options.springAttract) {
          force[0] -= nx * options.springStrength;
          force[1] -= ny * options.springStrength;
        } else if (length < options.springReject) {
          force[0] += nx * options.springStrength;
          force[1] += ny * options.springStrength;
        }
      } else {
        force[0] += nx * options.rejectStrength;
        force[1] += ny * options.rejectStrength;
      }
    }
    if (proximity[index].length) {
      let averageX = 0;
      let averageY = 0;
      for (const item of proximity[index]) {
        averageX += nodes[item.candidateIndex].x;
        averageY += nodes[item.candidateIndex].y;
      }
      averageX /= proximity[index].length;
      averageY /= proximity[index].length;
      const away = normalize(node.x - averageX, node.y - averageY);
      force[0] += away[0] * options.cohesionStrength;
      force[1] += away[1] * options.cohesionStrength;
    }
    if (node.x < 92) force[0] += 0.45;
    if (node.x > WIDTH - 92) force[0] -= 0.45;
    if (node.y < 92) force[1] += 0.45;
    if (node.y > HEIGHT - 92) force[1] -= 0.45;
    delta[index] = [force[0] * options.step, force[1] * options.step];
    node.capacity = proximity[index].length;
  }

  for (let index = 0; index < nodes.length; index += 1) {
    nodes[index].x = clamp(nodes[index].x + delta[index][0], 54, WIDTH - 54);
    nodes[index].y = clamp(nodes[index].y + delta[index][1], 54, HEIGHT - 54);
  }
  return links;
}

function latticeSpawn(nodes, random, iteration, options) {
  const originalCount = nodes.length;
  const additions = [];
  for (let index = 0; index < originalCount; index += 1) {
    const node = nodes[index];
    if (node.capacity >= options.maxCapacity || random() > options.spawnRatio || nodes.length + additions.length >= options.maxNodes) continue;
    const angle = random() * TAU;
    const radius = options.nodeRadius * (0.35 + random() * 0.45);
    additions.push({
      x: clamp(node.x + Math.cos(angle) * radius, 54, WIDTH - 54),
      y: clamp(node.y + Math.sin(angle) * radius, 54, HEIGHT - 54),
      age: iteration,
      capacity: 0,
    });
  }
  nodes.push(...additions);
}

function latticeRoute(nodes, edges, degree) {
  const adjacency = nodes.map(() => []);
  for (const edge of edges.values()) {
    adjacency[edge.a].push(edge.b);
    adjacency[edge.b].push(edge.a);
  }

  const anchor = degree
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value || a.index - b.index)[0]?.index ?? 0;
  const sweep = (start) => {
    const previous = Array(nodes.length).fill(-1);
    const distanceFromStart = Array(nodes.length).fill(-1);
    const queue = [start];
    distanceFromStart[start] = 0;
    let farthest = start;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      if (distanceFromStart[current] > distanceFromStart[farthest]) farthest = current;
      for (const next of adjacency[current]) {
        if (distanceFromStart[next] >= 0) continue;
        distanceFromStart[next] = distanceFromStart[current] + 1;
        previous[next] = current;
        queue.push(next);
      }
    }
    return { farthest, previous };
  };

  // Two breadth-first sweeps select a long route through the actual lattice
  // edges.  It gives the red accent a single legible gesture instead of a set
  // of unrelated highlighted nodes.
  const first = sweep(anchor).farthest;
  const second = sweep(first);
  const route = [];
  for (let current = second.farthest; current >= 0; current = second.previous[current]) {
    route.push(current);
    if (current === first) break;
  }
  route.reverse();
  const maximumRouteLength = 56;
  if (route.length <= maximumRouteLength) return route;
  const trim = Math.floor((route.length - maximumRouteLength) * 0.5);
  return route.slice(trim, trim + maximumRouteLength);
}

function differentialLattice(seed = 0x1a771ce) {
  const random = rng(deriveSeed(seed, 'lattice'));
  const nodes = [];
  const initialCount = 24;
  for (let index = 0; index < initialCount; index += 1) {
    const angle = index * TAU / initialCount;
    const radius = 46 + (random() - 0.5) * 12;
    nodes.push({ x: 800 + Math.cos(angle) * radius, y: 500 + Math.sin(angle) * radius, age: 0, capacity: 0 });
  }
  const options = {
    nodeRadius: 18,
    outerInfluence: 150,
    linkIgnore: 74,
    springReject: 14,
    springAttract: 28,
    springStrength: 0.92,
    rejectStrength: 0.18,
    cohesionStrength: 0.85,
    step: 1.25,
    maxCapacity: 30,
    maxNodes: 360,
    spawnRatio: 0.12,
  };

  let finalLinks = [];
  for (let iteration = 0; iteration < 105; iteration += 1) {
    finalLinks = latticeStep(nodes, options);
    latticeSpawn(nodes, random, iteration, options);
  }
  finalLinks = latticeStep(nodes, options);

  const degree = nodes.map(() => 0);
  const edges = new Map();
  for (let index = 0; index < finalLinks.length; index += 1) {
    for (const otherIndex of finalLinks[index]) {
      const key = edgeKey(index, otherIndex);
      if (edges.has(key)) continue;
      edges.set(key, { a: index, b: otherIndex });
      degree[index] += 1;
      degree[otherIndex] += 1;
    }
  }
  const route = latticeRoute(nodes, edges, degree);
  const redNodes = new Set();
  if (route.length) {
    const markerStep = Math.max(1, Math.floor((route.length - 1) / 4));
    for (let index = 0; index < route.length; index += markerStep) redNodes.add(route[index]);
    redNodes.add(route[route.length - 1]);
  }
  // The simulation is allowed to reach the renderer's safe bounds.  A modest
  // anisotropic presentation scale then keeps that living field comfortably
  // inside the paper, so the links read as a composed lattice rather than a
  // clipped wall of marks.  It does not alter the local growth dynamics.
  const project = (node) => ({
    x: 800 + (node.x - 800) * 1.12,
    y: 500 + (node.y - 500) * 0.78,
  });
  const parts = [];
  for (const edge of edges.values()) {
    const first = project(nodes[edge.a]);
    const second = project(nodes[edge.b]);
    const tone = edge.a % 5 === 0 ? COLOR.clay : COLOR.ink;
    parts.push(line(first.x, first.y, second.x, second.y, tone, 1.3 + Math.min(1.05, degree[edge.a] * 0.12), 0.5));
  }
  if (route.length > 1) {
    parts.push(pathElement(route.map((index) => {
      const point = project(nodes[index]);
      return [point.x, point.y];
    }), COLOR.red, 4.4, 0.9, false));
  }
  const rankedNodes = nodes
    .map((node, index) => ({ node, index }))
    .sort((a, b) => (a.node.age || 0) - (b.node.age || 0));
  for (const { node, index } of rankedNodes) {
    const point = project(node);
    const red = redNodes.has(index);
    const radius = red ? 8.6 : 4.8 + Math.min(5.8, degree[index] * 0.42);
    parts.push(circle(point.x, point.y, radius, red ? COLOR.red : COLOR.paper, red ? 0.92 : 0.88, red ? COLOR.red : COLOR.ink, red ? 1.9 : 1.05));
    if (red) parts.push(circle(point.x, point.y, radius + 11, 'none', 0.22, COLOR.red, 1.3));
  }

  return svg(
    'differential-lattice',
    'A seeded lattice grown by offset spawning, mutual-nearest links, spring attraction, short-range rejection, and local cohesion forces.',
    seed,
    SOURCE.lattice,
    parts.join(''),
  );
}

export const differentialStudies = [
  {
    slug: 'differential-line',
    title: 'Differential Line',
    description: 'Curvature-weighted edge splitting with linked attraction and non-linked repulsion.',
    source: SOURCE.line,
    generate: (seed = 0x1a1e2026) => differentialLine(seed),
  },
  {
    slug: 'differential-mesh',
    title: 'Differential Mesh',
    description: 'Outward triangle growth with free-space tests, mesh relaxation, and long-edge splitting.',
    source: SOURCE.mesh,
    generate: (seed = 0x0e52026) => differentialMesh(seed),
  },
  {
    slug: 'differential-lattice',
    title: 'Differential Lattice',
    description: 'Offset node spawning with mutual-nearest links and coupled spring/rejection forces.',
    source: SOURCE.lattice,
    generate: (seed = 0x1a771ce) => differentialLattice(seed),
  },
];
