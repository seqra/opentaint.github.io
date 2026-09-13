// Deterministic topology studies for the OpenTaint visual system.
//
// These are original relatives of advancing-front and differential-mesh work:
// each study makes topology visible through connected triangles, restrained
// fills, and a small number of state accents. They intentionally stay purely
// structural and abstract.

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const VERSION = 'mesh-relatives-1.0.0';

const PALETTE = Object.freeze({
  paper: '#f6f0e7',
  paperDeep: '#eee1d2',
  ink: '#191719',
  inkSoft: '#53484a',
  clay: '#a65442',
  sand: '#d4bba1',
  red: '#ca2121',
  redDark: '#8f2426',
});

const SOURCE = 'https://inconvergent.net/generative/differential-mesh/';

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

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
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

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function triangleArea(a, b, c) {
  return Math.abs(cross(a, b, c)) * 0.5;
}

function edgeKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function pathD(points, close = false) {
  if (!points.length) return '';
  const commands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point.x)} ${f(point.y)}`);
  return `${commands.join(' ')}${close ? ' Z' : ''}`;
}

function pathElement(points, stroke, width = 1, opacity = 1, close = false, extra = '') {
  if (points.length < 2) return '';
  return `<path d="${pathD(points, close)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round" opacity="${f(opacity)}" ${extra}/>`;
}

function polygonElement(points, fill, opacity = 1, stroke = 'none', width = 0, extra = '') {
  if (points.length < 3) return '';
  return `<path d="${pathD(points, true)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(width)}" stroke-linejoin="round" ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" ${extra}/>`;
}

function circle(cx, cy, radius, fill, opacity = 1, stroke = 'none', width = 0, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(width)}" ${extra}/>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgDocument(slug, title, description, seed, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${slug}-title ${slug}-description" data-generator="topology-mesh-relatives" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${slug}" data-source="${SOURCE}">
  <title id="${slug}-title">${escapeXml(title)}</title>
  <desc id="${slug}-description">${escapeXml(description)}</desc>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.paper}"/>
  ${body}
</svg>
`;
}

function trianglePoints(triangle, vertices) {
  const indices = Array.isArray(triangle) ? triangle : [triangle.a, triangle.b, triangle.c];
  return indices.map((index) => vertices[index]);
}

function orientIndices(vertices, a, b, c) {
  return cross(vertices[a], vertices[b], vertices[c]) >= 0 ? [a, b, c] : [a, c, b];
}

function buildEdgeMap(triangles) {
  const edges = new Map();
  for (let index = 0; index < triangles.length; index += 1) {
    const triangle = Array.isArray(triangles[index])
      ? triangles[index]
      : [triangles[index].a, triangles[index].b, triangles[index].c];
    for (let side = 0; side < 3; side += 1) {
      const a = triangle[side];
      const b = triangle[(side + 1) % 3];
      const key = edgeKey(a, b);
      if (!edges.has(key)) edges.set(key, { a, b, faces: [] });
      edges.get(key).faces.push(index);
    }
  }
  return edges;
}

// ---------------------------------------------------------------------------
// 1. Advancing-front triangulation: a continuous terrain grown from its rim.
// ---------------------------------------------------------------------------

function orientation(a, b, c) {
  const value = cross(a, b, c);
  if (Math.abs(value) < 1e-8) return 0;
  return value > 0 ? 1 : -1;
}

function terrainHeight(x, y, phase) {
  const u = x / 660;
  const v = y / 400;
  const peakWest = 310 * Math.exp(-(((u + 0.48) ** 2) / 0.095 + ((v + 0.22) ** 2) / 0.12));
  const peakCenter = 238 * Math.exp(-(((u - 0.05) ** 2) / 0.12 + ((v - 0.38) ** 2) / 0.1));
  const peakEast = 270 * Math.exp(-(((u - 0.52) ** 2) / 0.1 + ((v + 0.12) ** 2) / 0.14));
  const ridge = 78 * Math.exp(-((v - Math.sin(u * 2.2 + phase) * 0.16) ** 2) / 0.075);
  const valley = 205 * Math.exp(-(((u + 0.03 - v * 0.16) ** 2) / 0.065 + ((v - 0.02) ** 2) / 0.5));
  const shoulder = 34 * Math.sin(u * 2.4 + phase) * Math.cos(v * 1.6 - phase * 0.35);
  return peakWest + peakCenter + peakEast + ridge - valley + shoulder;
}

function terrainGeometry(seed) {
  const random = rng(deriveSeed(seed, 'terrain-grid'));
  const columns = 18;
  const rows = 12;
  const vertices = [];
  const grid = [];
  const triangles = [];
  const phase = random() * TAU;
  for (let row = 0; row < rows; row += 1) {
    const v = row / (rows - 1) * 2 - 1;
    const rowIndices = [];
    for (let column = 0; column < columns; column += 1) {
      const u = column / (columns - 1) * 2 - 1;
      const edge = Math.max(Math.abs(u), Math.abs(v));
      const x = u * 660 + Math.sin(v * 2.15 + phase) * (12 + edge * 24) + Math.cos(u * 3.1 - phase) * 8;
      const y = v * 400 + Math.cos(u * 2.1 - phase) * (10 + edge * 19) + Math.sin(v * 3.2 + phase) * 7;
      vertices.push({ x, y, z: terrainHeight(x, y, phase), row, column });
      rowIndices.push(vertices.length - 1);
    }
    grid.push(rowIndices);
  }
  const addFace = (a, b, c, growth, parent) => {
    const oriented = orientIndices(vertices, a, b, c);
    triangles.push({ a: oriented[0], b: oriented[1], c: oriented[2], growth, parent });
    return triangles.length - 1;
  };
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const a = grid[row][column];
      const b = grid[row][column + 1];
      const c = grid[row + 1][column];
      const d = grid[row + 1][column + 1];
      if ((row + column + Math.floor(phase * 2)) % 2 === 0) {
        const first = addFace(a, b, d, row, -1);
        addFace(a, d, c, row, first);
      } else {
        const first = addFace(a, b, c, row, -1);
        addFace(b, d, c, row, first);
      }
    }
  }
  return { vertices, triangles, grid, columns, rows, phase };
}

function terrainProjection(vertices) {
  const projectRaw = (vertex) => ({
    // Oblique axes turn the rectangular footprint into a readable landscape;
    // z lifts peaks toward the horizon while retaining one shared vertex map.
    x: vertex.x * 0.86 + vertex.y * 0.34 + vertex.z * 0.26,
    y: vertex.x * 0.08 + vertex.y * 0.58 - vertex.z * 0.68,
    depth: vertex.y * 0.5 + vertex.z * 0.56,
  });
  const raw = vertices.map(projectRaw);
  const minimumX = Math.min(...raw.map((point) => point.x));
  const maximumX = Math.max(...raw.map((point) => point.x));
  const minimumY = Math.min(...raw.map((point) => point.y));
  const maximumY = Math.max(...raw.map((point) => point.y));
  const centerX = (minimumX + maximumX) * 0.5;
  const centerY = (minimumY + maximumY) * 0.5;
  const scale = Math.min(1320 / Math.max(1, maximumX - minimumX), 800 / Math.max(1, maximumY - minimumY));
  return raw.map((point) => ({
    x: 800 + (point.x - centerX) * scale,
    y: 500 + (point.y - centerY) * scale,
    depth: point.depth,
  }));
}

function terrainFaceNormal(first, second, third) {
  const ab = { x: second.x - first.x, y: second.y - first.y, z: second.z - first.z };
  const ac = { x: third.x - first.x, y: third.y - first.y, z: third.z - first.z };
  let normal = {
    x: ab.y * ac.z - ab.z * ac.y,
    y: ab.z * ac.x - ab.x * ac.z,
    z: ab.x * ac.y - ab.y * ac.x,
  };
  if (normal.z < 0) normal = { x: -normal.x, y: -normal.y, z: -normal.z };
  const magnitude = Math.hypot(normal.x, normal.y, normal.z) || 1;
  return { x: normal.x / magnitude, y: normal.y / magnitude, z: normal.z / magnitude };
}

function terrainFaceFill(light) {
  if (light > 0.68) return PALETTE.paperDeep;
  if (light > -0.08) return PALETTE.sand;
  return PALETTE.clay;
}

function terrainSurfaceRoute(grid, rows, columns, triangles) {
  // A short, hand-curated walk keeps the accent legible: each move is one
  // shared grid edge or one cell diagonal, with only a few gentle reversals.
  // It climbs from the near-left rim toward the far-right horizon instead of
  // tracing the whole surface as a raster scan.
  const coordinates = [
    [rows - 1, 0], [rows - 1, 1], [rows - 1, 2], [rows - 1, 3],
    [rows - 2, 4], [rows - 2, 5], [rows - 2, 6],
    [rows - 3, 7], [rows - 3, 8], [rows - 3, 9],
    [rows - 4, 10], [rows - 4, 11], [rows - 4, 12],
    [rows - 5, 13], [rows - 5, 14], [rows - 6, 14],
    [rows - 7, 13], [rows - 8, 12], [rows - 9, 13],
    [rows - 10, 12], [rows - 11, 13], [0, 12],
  ];
  const route = [];
  const available = buildEdgeMap(triangles);
  const append = (row, column) => {
    const index = grid[row][column];
    if (route[route.length - 1] !== index) route.push(index);
  };
  append(coordinates[0][0], coordinates[0][1]);
  for (let index = 1; index < coordinates.length; index += 1) {
    const [row, column] = coordinates[index];
    const previous = coordinates[index - 1];
    const previousIndex = grid[previous[0]][previous[1]];
    const nextIndex = grid[row][column];
    if (available.has(edgeKey(previousIndex, nextIndex))) {
      append(row, column);
      continue;
    }
    // The checkerboard diagonal changes with the deterministic phase. Use a
    // short orthogonal dog-leg when the desired diagonal is not in this mesh.
    const middle = [previous[0], column];
    const middleIndex = grid[middle[0]][middle[1]];
    if (available.has(edgeKey(previousIndex, middleIndex)) && available.has(edgeKey(middleIndex, nextIndex))) {
      append(middle[0], middle[1]);
      append(row, column);
      continue;
    }
    append(row, previous[1]);
    append(row, column);
  }
  return route;
}

function renderTriangulatedTerrain(seed) {
  const { vertices, triangles, grid, columns, rows } = terrainGeometry(seed);
  const visualVertices = terrainProjection(vertices);
  const edges = buildEdgeMap(triangles);
  const light = { x: 0.32, y: -0.5, z: 0.8 };
  const faceRecords = triangles.map((triangle, index) => {
    const surfacePoints = [triangle.a, triangle.b, triangle.c].map((vertexIndex) => vertices[vertexIndex]);
    const normal = terrainFaceNormal(surfacePoints[0], surfacePoints[1], surfacePoints[2]);
    const illumination = normal.x * light.x + normal.y * light.y + normal.z * light.z;
    const averageDepth = [triangle.a, triangle.b, triangle.c].reduce((sum, vertexIndex) => sum + visualVertices[vertexIndex].depth, 0) / 3;
    return {
      points: [triangle.a, triangle.b, triangle.c].map((vertexIndex) => visualVertices[vertexIndex]),
      depth: averageDepth + index * 0.0001,
      fill: terrainFaceFill(illumination),
      opacity: 1,
    };
  });
  const edgeRecords = [...edges.values()].map((edge) => ({
    edge,
    depth: (visualVertices[edge.a].depth + visualVertices[edge.b].depth) * 0.5,
    boundary: edge.faces.length === 1,
  }));
  const body = [];
  const drawables = faceRecords.concat(edgeRecords).sort((first, second) => first.depth - second.depth);
  for (const drawable of drawables) {
    if (drawable.points) {
      body.push(polygonElement(drawable.points, drawable.fill, drawable.opacity));
      continue;
    }
    if (drawable.boundary) continue;
    const edge = drawable.edge;
    body.push(line(visualVertices[edge.a].x, visualVertices[edge.a].y, visualVertices[edge.b].x, visualVertices[edge.b].y, PALETTE.inkSoft, 0.72, 0.7));
  }
  for (const edge of edges.values()) {
    if (edge.faces.length !== 1) continue;
    body.push(line(visualVertices[edge.a].x, visualVertices[edge.a].y, visualVertices[edge.b].x, visualVertices[edge.b].y, PALETTE.ink, 2.1, 0.94));
  }

  const routeIndices = terrainSurfaceRoute(grid, rows, columns, triangles);
  body.push(pathElement(routeIndices.map((index) => visualVertices[index]), PALETTE.red, 3.25, 0.96, false));
  for (const index of [routeIndices[0], routeIndices[routeIndices.length - 1]]) {
    const point = visualVertices[index];
    body.push(circle(point.x, point.y, 5.7, PALETTE.red, 0.98, PALETTE.paper, 1.25));
  }

  return svgDocument(
    'triangulated-terrain-path',
    'Triangulated Terrain Path',
    'An oblique triangulated mountain landscape with peaks, a carved valley, and one continuous path following adjacent mesh edges.',
    seed,
    body.join(''),
  );
}

// ---------------------------------------------------------------------------
// 2. Constrained triangulated field: a Delaunay-like field with voids.
// ---------------------------------------------------------------------------

function voidRadial(hole, angle) {
  if (!hole.lobes) return 1;
  return 1 + (hole.bump || 0) * Math.sin(angle * hole.lobes + (hole.phase || 0));
}

function pointInVoid(point, hole, margin = 0) {
  const cosine = Math.cos(hole.rotation || 0);
  const sine = Math.sin(hole.rotation || 0);
  const dx = point.x - hole.cx;
  const dy = point.y - hole.cy;
  const x = (dx * cosine + dy * sine) / (hole.rx + margin);
  const y = (-dx * sine + dy * cosine) / (hole.ry + margin);
  const angle = Math.atan2(y, x);
  const radius = voidRadial(hole, angle);
  return x * x + y * y < radius * radius;
}

function segmentCrossesVoid(a, b, hole) {
  for (let step = 1; step < 12; step += 1) {
    const amount = step / 12;
    const point = {
      x: a.x + (b.x - a.x) * amount,
      y: a.y + (b.y - a.y) * amount,
    };
    if (pointInVoid(point, hole, -3)) return true;
  }
  return false;
}

function circumcircleContains(point, a, b, c) {
  const determinant = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(determinant) < 1e-7) return false;
  const aSquared = a.x * a.x + a.y * a.y;
  const bSquared = b.x * b.x + b.y * b.y;
  const cSquared = c.x * c.x + c.y * c.y;
  const centerX = (aSquared * (b.y - c.y) + bSquared * (c.y - a.y) + cSquared * (a.y - b.y)) / determinant;
  const centerY = (aSquared * (c.x - b.x) + bSquared * (a.x - c.x) + cSquared * (b.x - a.x)) / determinant;
  const radiusSquared = (centerX - a.x) ** 2 + (centerY - a.y) ** 2;
  return (point.x - centerX) ** 2 + (point.y - centerY) ** 2 <= radiusSquared + 0.01;
}

function delaunay(points) {
  const working = points.concat([
    { x: -500, y: -400 },
    { x: 2100, y: -400 },
    { x: 800, y: 1700 },
  ]);
  const superA = points.length;
  const superB = points.length + 1;
  const superC = points.length + 2;
  let triangles = [[superA, superB, superC]];
  for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
    const bad = [];
    for (const triangle of triangles) {
      if (circumcircleContains(working[pointIndex], working[triangle[0]], working[triangle[1]], working[triangle[2]])) {
        bad.push(triangle);
      }
    }
    const boundary = new Map();
    for (const triangle of bad) {
      for (let side = 0; side < 3; side += 1) {
        const a = triangle[side];
        const b = triangle[(side + 1) % 3];
        const key = edgeKey(a, b);
        const existing = boundary.get(key);
        if (existing) existing.count += 1;
        else boundary.set(key, { a, b, count: 1 });
      }
    }
    const badSet = new Set(bad);
    triangles = triangles.filter((triangle) => !badSet.has(triangle));
    for (const edge of boundary.values()) {
      if (edge.count === 1) triangles.push(orientIndices(working, edge.a, edge.b, pointIndex));
    }
  }
  return triangles.filter((triangle) => triangle.every((index) => index < points.length));
}

function voidFieldGeometry(seed) {
  const random = rng(deriveSeed(seed, 'constrained-field'));
  const holes = [
    { cx: 374, cy: 336, rx: 126, ry: 164, rotation: -0.35, lobes: 3, bump: 0.16, phase: 0.3, segments: 17 },
    { cx: 566, cy: 420, rx: 104, ry: 78, rotation: 0.4, lobes: 5, bump: 0.2, phase: 1.1, segments: 15 },
    { cx: 714, cy: 524, rx: 82, ry: 137, rotation: -0.18, lobes: 4, bump: 0.14, phase: -0.4, segments: 16 },
    { cx: 936, cy: 580, rx: 184, ry: 103, rotation: 0.22, lobes: 3, bump: 0.18, phase: 0.8, segments: 21 },
    { cx: 974, cy: 286, rx: 118, ry: 77, rotation: -0.42, lobes: 6, bump: 0.13, phase: 2.2, segments: 16 },
    { cx: 1212, cy: 296, rx: 106, ry: 94, rotation: 0.5, lobes: 5, bump: 0.2, phase: -0.7, segments: 15 },
    { cx: 1224, cy: 648, rx: 136, ry: 119, rotation: -0.28, lobes: 4, bump: 0.16, phase: 1.7, segments: 17 },
    { cx: 454, cy: 700, rx: 117, ry: 71, rotation: -0.48, lobes: 4, bump: 0.18, phase: 0.1, segments: 15 },
  ];
  const points = [];
  const spacingX = 92;
  const spacingY = 86;
  for (let y = 112; y <= 888; y += spacingY) {
    for (let x = 108; x <= 1492; x += spacingX) {
      const candidate = {
        x: x + (random() - 0.5) * 42,
        y: y + (random() - 0.5) * 38,
      };
      const fieldX = (candidate.x - 800) / 720;
      const fieldY = (candidate.y - 500) / 405;
      if (fieldX * fieldX + fieldY * fieldY > 1.02) continue;
      if (holes.some((hole) => pointInVoid(candidate, hole, 16))) continue;
      points.push(candidate);
    }
  }
  const rings = holes.map((hole, holeIndex) => {
    const ring = [];
    for (let index = 0; index < hole.segments; index += 1) {
      const angle = index * TAU / hole.segments;
      const wobble = 1.065 + (random() - 0.5) * 0.025;
      const cosine = Math.cos(hole.rotation);
      const sine = Math.sin(hole.rotation);
      const radius = voidRadial(hole, angle);
      const localX = Math.cos(angle) * hole.rx * radius * wobble;
      const localY = Math.sin(angle) * hole.ry * radius * wobble;
      ring.push({
        x: hole.cx + localX * cosine - localY * sine,
        y: hole.cy + localX * sine + localY * cosine,
      });
    }
    // Ring points are constraints, but remain just outside the void.
    points.push(...ring);
    return ring;
  });
  const rawTriangles = delaunay(points);
  const triangles = rawTriangles.filter((triangle) => {
    const [a, b, c] = triangle.map((index) => points[index]);
    const center = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
    if (holes.some((hole) => pointInVoid(center, hole, -2))) return false;
    for (const hole of holes) {
      if (segmentCrossesVoid(a, b, hole) || segmentCrossesVoid(b, c, hole) || segmentCrossesVoid(c, a, hole)) return false;
    }
    return distance(a, b) < 205 && distance(b, c) < 205 && distance(c, a) < 205 && triangleArea(a, b, c) > 90;
  });
  return { points, triangles, holes, rings };
}

function renderVoidField(seed) {
  const { points, triangles, holes, rings } = voidFieldGeometry(seed);
  const edges = buildEdgeMap(triangles);
  const body = [];
  for (let index = 0; index < triangles.length; index += 1) {
    const triangle = triangles[index];
    const shape = trianglePoints(triangle, points);
    if (index % 23 === 4 || index % 31 === 12) {
      body.push(polygonElement(shape, index % 31 === 12 ? PALETTE.sand : PALETTE.paperDeep, 0.17));
    }
  }
  for (const edge of edges.values()) {
    const first = points[edge.a];
    const second = points[edge.b];
    const boundary = edge.faces.length === 1;
    body.push(line(first.x, first.y, second.x, second.y, boundary ? PALETTE.ink : PALETTE.inkSoft, boundary ? 1.45 : 0.78, boundary ? 0.75 : 0.52));
  }
  for (let index = 0; index < rings.length; index += 1) {
    const ring = rings[index];
    body.push(pathElement(ring, PALETTE.clay, 2.1, 0.58, true));
    if (index === 1) {
      const accent = ring.slice(2, 11);
      body.push(pathElement(accent, PALETTE.red, 4, 0.86, false));
    }
  }
  // A handful of structural anchors makes the field read as constrained
  // geometry while preserving the deliberately open interiors.
  for (const hole of holes) body.push(circle(hole.cx, hole.cy, 4.2, PALETTE.paper, 0.9, PALETTE.clay, 1.1));

  return svgDocument(
    'constrained-void-field',
    'Constrained void field',
    'A triangulated field filtered by eight varied intentional voids, with boundary rings and a restrained state path.',
    seed,
    body.join(''),
  );
}

// ---------------------------------------------------------------------------
// 3. Relaxed and edge-flipped ribbons: separated triangular archipelago.
// ---------------------------------------------------------------------------

function ribbonTriangle(vertices, a, b, c, ribbon) {
  const oriented = orientIndices(vertices, a, b, c);
  return { a: oriented[0], b: oriented[1], c: oriented[2], ribbon };
}

function ribbonGeometry(seed) {
  const random = rng(deriveSeed(seed, 'ribbon-archipelago'));
  const vertices = [];
  const triangles = [];
  const ribbons = [];
  const definitions = [
    { start: 165, end: 915, base: 282, amplitude: 96, phase: 0.2, width: 100, segments: 19 },
    { start: 690, end: 1465, base: 545, amplitude: 132, phase: 1.8, width: 112, segments: 20 },
    { start: 135, end: 760, base: 785, amplitude: 68, phase: -0.6, width: 78, segments: 16 },
  ];
  for (let ribbonIndex = 0; ribbonIndex < definitions.length; ribbonIndex += 1) {
    const definition = definitions[ribbonIndex];
    const rows = [];
    for (let segment = 0; segment <= definition.segments; segment += 1) {
      const amount = segment / definition.segments;
      const x = definition.start + (definition.end - definition.start) * amount;
      const wave = definition.amplitude * Math.sin(amount * TAU * 0.72 + definition.phase);
      const secondary = 24 * Math.sin(amount * TAU * 1.55 + definition.phase * 0.7);
      const y = definition.base + wave + secondary;
      const nextAmount = clamp(amount + 0.01, 0, 1);
      const nextWave = definition.amplitude * Math.sin(nextAmount * TAU * 0.72 + definition.phase);
      const nextSecondary = 24 * Math.sin(nextAmount * TAU * 1.55 + definition.phase * 0.7);
      const tangentLength = Math.hypot((definition.end - definition.start) * 0.01, nextWave + nextSecondary - wave - secondary) || 1;
      const tx = (definition.end - definition.start) * 0.01 / tangentLength;
      const ty = (nextWave + nextSecondary - wave - secondary) / tangentLength;
      const normal = { x: -ty, y: tx };
      const width = definition.width * (0.82 + 0.14 * Math.sin(amount * Math.PI));
      const wobble = (random() - 0.5) * 5;
      const centerIndex = vertices.length;
      vertices.push({ x, y: y + wobble });
      const leftIndex = vertices.length;
      vertices.push({ x: x + normal.x * width, y: y + wobble + normal.y * width });
      const rightIndex = vertices.length;
      vertices.push({ x: x - normal.x * width, y: y + wobble - normal.y * width });
      rows.push({ left: leftIndex, center: centerIndex, right: rightIndex });
    }
    for (let index = 0; index < rows.length - 1; index += 1) {
      const first = rows[index];
      const second = rows[index + 1];
      triangles.push(ribbonTriangle(vertices, first.left, first.center, second.left, ribbonIndex));
      triangles.push(ribbonTriangle(vertices, first.center, second.center, second.left, ribbonIndex));
      triangles.push(ribbonTriangle(vertices, first.center, first.right, second.center, ribbonIndex));
      triangles.push(ribbonTriangle(vertices, first.right, second.right, second.center, ribbonIndex));
    }
    ribbons.push({ rows, ribbon: ribbonIndex });
  }
  return { vertices, triangles, ribbons };
}

function relaxRibbon(vertices, triangles, ribbons) {
  const initial = vertices.map((vertex) => ({ ...vertex }));
  const neighbors = vertices.map(() => new Set());
  for (const triangle of triangles) {
    neighbors[triangle.a].add(triangle.b); neighbors[triangle.a].add(triangle.c);
    neighbors[triangle.b].add(triangle.a); neighbors[triangle.b].add(triangle.c);
    neighbors[triangle.c].add(triangle.a); neighbors[triangle.c].add(triangle.b);
  }
  const pinned = new Set();
  for (const ribbon of ribbons) {
    const first = ribbon.rows[0];
    const last = ribbon.rows[ribbon.rows.length - 1];
    for (const row of [first, last]) {
      pinned.add(row.left); pinned.add(row.center); pinned.add(row.right);
    }
  }
  for (let iteration = 0; iteration < 7; iteration += 1) {
    const updates = [];
    for (let index = 0; index < vertices.length; index += 1) {
      if (pinned.has(index) || neighbors[index].size === 0) {
        updates[index] = vertices[index];
        continue;
      }
      let averageX = 0;
      let averageY = 0;
      for (const neighbor of neighbors[index]) {
        averageX += vertices[neighbor].x;
        averageY += vertices[neighbor].y;
      }
      averageX /= neighbors[index].size;
      averageY /= neighbors[index].size;
      updates[index] = {
        x: vertices[index].x * 0.72 + averageX * 0.18 + initial[index].x * 0.1,
        y: vertices[index].y * 0.72 + averageY * 0.18 + initial[index].y * 0.1,
      };
    }
    for (let index = 0; index < vertices.length; index += 1) vertices[index] = updates[index];
  }
}

function edgeFlipPass(vertices, triangles) {
  const edges = buildEdgeMap(triangles);
  const flipped = [];
  for (const edge of edges.values()) {
    if (edge.faces.length !== 2) continue;
    const firstTriangle = triangles[edge.faces[0]];
    const secondTriangle = triangles[edge.faces[1]];
    const opposite = (triangle) => [triangle.a, triangle.b, triangle.c].find((index) => index !== edge.a && index !== edge.b);
    const firstOpposite = opposite(firstTriangle);
    const secondOpposite = opposite(secondTriangle);
    const a = vertices[edge.a];
    const b = vertices[edge.b];
    const c = vertices[firstOpposite];
    const d = vertices[secondOpposite];
    if (orientation(a, b, c) * orientation(a, b, d) >= 0) continue;
    if (orientation(c, a, d) * orientation(c, b, d) >= 0) continue;
    if (distance(a, b) <= distance(c, d) * 1.08) continue;
    const newKey = edgeKey(firstOpposite, secondOpposite);
    if (edges.has(newKey)) continue;
    triangles[edge.faces[0]] = ribbonTriangle(vertices, firstOpposite, secondOpposite, edge.a, firstTriangle.ribbon);
    triangles[edge.faces[1]] = ribbonTriangle(vertices, firstOpposite, edge.b, secondOpposite, secondTriangle.ribbon);
    flipped.push({ a: firstOpposite, b: secondOpposite });
    if (flipped.length >= 18) break;
  }
  return flipped;
}

function renderRibbonArchipelago(seed) {
  const geometry = ribbonGeometry(seed);
  relaxRibbon(geometry.vertices, geometry.triangles, geometry.ribbons);
  const flipped = edgeFlipPass(geometry.vertices, geometry.triangles);
  const edges = buildEdgeMap(geometry.triangles);
  const body = [];
  for (let index = 0; index < geometry.triangles.length; index += 1) {
    const triangle = geometry.triangles[index];
    if (index % 13 === 2 || index % 29 === 7) {
      body.push(polygonElement(trianglePoints([triangle.a, triangle.b, triangle.c], geometry.vertices), index % 29 === 7 ? PALETTE.sand : PALETTE.paperDeep, 0.2));
    }
  }
  for (const edge of edges.values()) {
    const boundary = edge.faces.length === 1;
    body.push(line(
      geometry.vertices[edge.a].x,
      geometry.vertices[edge.a].y,
      geometry.vertices[edge.b].x,
      geometry.vertices[edge.b].y,
      boundary ? PALETTE.ink : PALETTE.inkSoft,
      boundary ? 1.45 : 0.78,
      boundary ? 0.78 : 0.56,
    ));
  }
  const flippedAccent = flipped.slice(0, 4);
  for (const edge of flippedAccent) {
    body.push(line(geometry.vertices[edge.a].x, geometry.vertices[edge.a].y, geometry.vertices[edge.b].x, geometry.vertices[edge.b].y, PALETTE.clay, 2.2, 0.65));
  }
  const secondRibbon = geometry.ribbons[1].rows;
  const centerline = secondRibbon.map((row) => geometry.vertices[row.center]);
  body.push(pathElement(centerline, PALETTE.clay, 2.1, 0.44, false));
  body.push(pathElement(centerline.slice(3, centerline.length - 3), PALETTE.red, 4.2, 0.88, false));
  for (const row of [geometry.ribbons[0].rows[4], geometry.ribbons[2].rows[8], geometry.ribbons[1].rows[10]]) {
    const point = geometry.vertices[row.center];
    body.push(circle(point.x, point.y, 5.2, PALETTE.red, 0.82, PALETTE.paper, 1.1));
  }

  return svgDocument(
    'relaxed-ribbon-archipelago',
    'Relaxed ribbon archipelago',
    'Separated triangular ribbons relaxed by neighbor averaging and selectively edge-flipped before a restrained centerline accent.',
    seed,
    body.join(''),
  );
}

export const meshRelativeStudies = [
  {
    slug: 'triangulated-terrain-path',
    title: 'Triangulated Terrain Path',
    description: 'A continuous oblique terrain mesh with visible peaks, valleys, and one edge-following path.',
    source: SOURCE,
    generate: (seed = 0x51a7f01) => renderTriangulatedTerrain(seed),
  },
  {
    slug: 'constrained-void-field',
    title: 'Constrained Void Field',
    description: 'A triangulated field organized around three intentional negative-space constraints.',
    source: SOURCE,
    generate: (seed = 0x70d1f13) => renderVoidField(seed),
  },
  {
    slug: 'relaxed-ribbon-archipelago',
    title: 'Relaxed Ribbon Archipelago',
    description: 'Separated triangular ribbons smoothed by local averaging and selective diagonal flips.',
    source: SOURCE,
    generate: (seed = 0x7ab1e) => renderRibbonArchipelago(seed),
  },
];
