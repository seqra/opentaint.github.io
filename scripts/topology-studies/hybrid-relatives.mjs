/**
 * Three deterministic topology studies that sit close to differential mesh
 * and lattice work while taking a different structural route. The geometry is
 * deliberately sparse and legible: every visible mark is an edge, cell, node,
 * or one controlled red route.
 */

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const VERSION = 'topology-hybrids-1.0.0';

const COLOR = Object.freeze({
  paper: '#f6f0e7',
  paperDeep: '#eee1d2',
  ink: '#191719',
  inkSoft: '#53484a',
  clay: '#a65442',
  red: '#ca2121',
});

const SOURCE = Object.freeze({
  mesh: 'https://inconvergent.net/generative/differential-mesh/',
  lattice: 'https://inconvergent.net/generative/differential-lattice/',
});

const FLOW_OBSTACLES = Object.freeze([
  Object.freeze({ cx: 624, cy: 376, rx: 128, ry: 92 }),
  Object.freeze({ cx: 1018, cy: 686, rx: 148, ry: 108 }),
  Object.freeze({ cx: 1216, cy: 286, rx: 96, ry: 74 }),
]);

function rng(seed) {
  let state = (seed >>> 0) || 0x6d2b79f5;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
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

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return [x / length, y / length];
}

function pathD(points, close = false) {
  if (points.length === 0) return '';
  const commands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point[0])} ${f(point[1])}`);
  return `${commands.join(' ')}${close ? ' Z' : ''}`;
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" ${extra}/>`;
}

function path(points, stroke, width = 1, opacity = 1, close = false, fill = 'none', extra = '') {
  if (points.length < 2) return '';
  return `<path d="${pathD(points, close)}" fill="${fill}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function circle(cx, cy, radius, fill, opacity = 1, stroke = 'none', strokeWidth = 0) {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(strokeWidth)}"/>`;
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgDocument({ slug, title, description, source, seed, body }) {
  const id = `topology-${hashSeed(slug).toString(16)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="title-${id} desc-${id}" data-generator="opentaint-topology-hybrid" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${escapeText(slug)}" data-source="${escapeText(source)}">
  <title id="title-${id}">${escapeText(title)}</title>
  <desc id="desc-${id}">${escapeText(description)}</desc>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.paper}"/>
  ${body}
</svg>
`;
}

function jitteredGrid(seed, columns, rows, marginX, marginY, jitterX, jitterY) {
  const random = rng(seed);
  const points = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = marginX + (column / (columns - 1)) * (WIDTH - marginX * 2);
      const y = marginY + (row / (rows - 1)) * (HEIGHT - marginY * 2);
      const edgeDamping = Math.min(
        1,
        Math.min(column, columns - 1 - column) / 1.6,
        Math.min(row, rows - 1 - row) / 1.6,
      );
      points.push([
        clamp(x + (random() - 0.5) * jitterX * edgeDamping, 38, WIDTH - 38),
        clamp(y + (random() - 0.5) * jitterY * edgeDamping, 38, HEIGHT - 38),
      ]);
    }
  }
  return points;
}

function unevenBands(random, count) {
  const values = [0];
  let total = 0;
  for (let index = 1; index < count - 1; index += 1) {
    total += 0.62 + random() * 1.55;
    values.push(total);
  }
  values.push(total + 0.62 + random() * 1.55);
  const maximum = values[values.length - 1];
  return values.map((value) => value / maximum);
}

function organicSites(seed, columns, rows, marginX, marginY, jitterX, jitterY, warpX, warpY) {
  const random = rng(seed);
  const xBands = unevenBands(random, columns);
  const yBands = unevenBands(random, rows);
  const phase = random() * TAU;
  const points = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u = xBands[column];
      const v = yBands[row];
      const bendX = Math.sin(v * TAU * 1.08 + phase) * warpX
        + Math.cos((u * 1.8 + v) * TAU - phase) * warpX * 0.28;
      const bendY = Math.sin(u * TAU * 0.88 - phase) * warpY
        + Math.cos((v * 1.7 - u) * TAU + phase) * warpY * 0.24;
      const compressedU = u * 0.84 + Math.pow(u, 1.38) * 0.16;
      const compressedV = v * 0.9 + Math.pow(v, 1.22) * 0.1;
      points.push([
        clamp(
          marginX + compressedU * (WIDTH - marginX * 2) + bendX + (random() - 0.5) * jitterX,
          38,
          WIDTH - 38,
        ),
        clamp(
          marginY + compressedV * (HEIGHT - marginY * 2) + bendY + (random() - 0.5) * jitterY,
          38,
          HEIGHT - 38,
        ),
      ]);
    }
  }
  return points;
}

function circumcircle(points, a, b, c) {
  const ax = points[a][0];
  const ay = points[a][1];
  const bx = points[b][0];
  const by = points[b][1];
  const cx = points[c][0];
  const cy = points[c][1];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-8) return { cx: 0, cy: 0, radiusSquared: Infinity };
  const aa = ax * ax + ay * ay;
  const bb = bx * bx + by * by;
  const cc = cx * cx + cy * cy;
  const centerX = (aa * (by - cy) + bb * (cy - ay) + cc * (ay - by)) / d;
  const centerY = (aa * (cx - bx) + bb * (ax - cx) + cc * (bx - ax)) / d;
  const dx = centerX - ax;
  const dy = centerY - ay;
  return { cx: centerX, cy: centerY, radiusSquared: dx * dx + dy * dy };
}

function triangle(points, a, b, c) {
  const circleData = circumcircle(points, a, b, c);
  return { a, b, c, ...circleData };
}

/** Bowyer-Watson triangulation, adequate for the intentionally modest fields. */
function delaunay(points) {
  const working = points.concat([
    [-12000, -10000],
    [WIDTH + 12000, -10000],
    [WIDTH * 0.5, HEIGHT + 12000],
  ]);
  const superStart = points.length;
  let triangles = [triangle(working, superStart, superStart + 1, superStart + 2)];

  for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
    const point = working[pointIndex];
    const bad = triangles.filter((candidate) => {
      const dx = point[0] - candidate.cx;
      const dy = point[1] - candidate.cy;
      return dx * dx + dy * dy <= candidate.radiusSquared + 1e-5;
    });
    const badSet = new Set(bad);
    const boundary = new Map();
    for (const candidate of bad) {
      for (const [a, b] of [[candidate.a, candidate.b], [candidate.b, candidate.c], [candidate.c, candidate.a]]) {
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        const current = boundary.get(key);
        if (current) current.count += 1;
        else boundary.set(key, { a, b, count: 1 });
      }
    }
    triangles = triangles.filter((candidate) => !badSet.has(candidate));
    for (const edge of boundary.values()) {
      if (edge.count === 1) triangles.push(triangle(working, edge.a, edge.b, pointIndex));
    }
  }

  return triangles.filter((candidate) => (
    candidate.a < superStart && candidate.b < superStart && candidate.c < superStart
  ));
}

function uniqueEdges(triangles) {
  const edges = new Map();
  for (const candidate of triangles) {
    for (const [a, b] of [[candidate.a, candidate.b], [candidate.b, candidate.c], [candidate.c, candidate.a]]) {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (!edges.has(key)) edges.set(key, { a: Math.min(a, b), b: Math.max(a, b) });
    }
  }
  return [...edges.values()];
}

function clipHalfPlane(polygon, a, b, c) {
  if (polygon.length === 0) return [];
  const result = [];
  const inside = (point) => a * point[0] + b * point[1] <= c + 1e-6;
  const intersect = (start, end) => {
    const startValue = a * start[0] + b * start[1] - c;
    const endValue = a * end[0] + b * end[1] - c;
    const denominator = startValue - endValue;
    if (Math.abs(denominator) < 1e-9) return end.slice();
    const amount = startValue / denominator;
    return [
      start[0] + (end[0] - start[0]) * amount,
      start[1] + (end[1] - start[1]) * amount,
    ];
  };

  let previous = polygon[polygon.length - 1];
  let previousInside = inside(previous);
  for (const current of polygon) {
    const currentInside = inside(current);
    if (currentInside !== previousInside) result.push(intersect(previous, current));
    if (currentInside) result.push(current.slice());
    previous = current;
    previousInside = currentInside;
  }
  return result;
}

function voronoiCells(points, margin = 30) {
  const bounds = [
    [margin, margin],
    [WIDTH - margin, margin],
    [WIDTH - margin, HEIGHT - margin],
    [margin, HEIGHT - margin],
  ];
  return points.map((site, siteIndex) => {
    let polygon = bounds.map((point) => point.slice());
    for (let otherIndex = 0; otherIndex < points.length && polygon.length > 2; otherIndex += 1) {
      if (otherIndex === siteIndex) continue;
      const other = points[otherIndex];
      const a = 2 * (other[0] - site[0]);
      const b = 2 * (other[1] - site[1]);
      const c = other[0] * other[0] + other[1] * other[1]
        - site[0] * site[0] - site[1] * site[1];
      polygon = clipHalfPlane(polygon, a, b, c);
    }
    return polygon;
  });
}

function distanceSquared(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function nearestPoint(points, target) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < points.length; index += 1) {
    const currentDistance = distanceSquared(points[index], target);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function graph(points, edges) {
  const adjacency = points.map(() => []);
  for (const edge of edges) {
    const length = Math.sqrt(distanceSquared(points[edge.a], points[edge.b]));
    adjacency[edge.a].push({ index: edge.b, length, edge });
    adjacency[edge.b].push({ index: edge.a, length, edge });
  }
  return adjacency;
}

function shortestPath(points, edges, start, target, cost) {
  const adjacency = graph(points, edges);
  const distances = points.map(() => Infinity);
  const previous = points.map(() => null);
  const visited = new Set();
  distances[start] = 0;

  while (visited.size < points.length) {
    let current = -1;
    let bestDistance = Infinity;
    for (let index = 0; index < points.length; index += 1) {
      if (!visited.has(index) && distances[index] < bestDistance) {
        current = index;
        bestDistance = distances[index];
      }
    }
    if (current < 0 || current === target) break;
    visited.add(current);
    for (const neighbor of adjacency[current]) {
      if (visited.has(neighbor.index)) continue;
      const candidate = bestDistance + cost(current, neighbor.index, neighbor.length);
      if (candidate < distances[neighbor.index]) {
        distances[neighbor.index] = candidate;
        previous[neighbor.index] = current;
      }
    }
  }

  const result = [];
  let current = target;
  while (current !== null && current >= 0) {
    result.unshift(current);
    current = previous[current];
  }
  return result.length > 1 && result[0] === start ? result : [start, target];
}

function stitchedRoute(points, edges, targets, cost) {
  const route = [];
  for (let index = 1; index < targets.length; index += 1) {
    const start = nearestPoint(points, targets[index - 1]);
    const target = nearestPoint(points, targets[index]);
    const section = shortestPath(points, edges, start, target, cost);
    if (route.length === 0) route.push(...section);
    else route.push(...section.slice(1));
  }
  return route;
}

function nearestUnusedPoint(points, target, used) {
  let bestIndex = -1;
  let bestDistance = Infinity;
  for (let index = 0; index < points.length; index += 1) {
    if (used.has(index)) continue;
    const currentDistance = distanceSquared(points[index], target);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function simpleStitchedRoute(points, edges, targets, cost) {
  const route = [];
  const used = new Set();
  let current = nearestPoint(points, targets[0]);
  route.push(current);
  used.add(current);

  for (let index = 1; index < targets.length; index += 1) {
    const target = nearestUnusedPoint(points, targets[index], used);
    if (target < 0) break;
    const allowedEdges = edges.filter((edge) => (
      (edge.a === current || !used.has(edge.a))
      && (edge.b === current || !used.has(edge.b))
    ));
    let section = shortestPath(points, allowedEdges, current, target, cost);
    const hasOnlyGraphEdges = section.every((point, pointIndex) => {
      if (pointIndex === 0) return point === current;
      const previous = section[pointIndex - 1];
      return allowedEdges.some((edge) => (
        (edge.a === previous && edge.b === point) || (edge.a === point && edge.b === previous)
      ));
    });
    if (!hasOnlyGraphEdges) section = shortestPath(points, edges, current, target, cost);
    route.push(...section.slice(1));
    for (const point of section) used.add(point);
    current = target;
  }
  return route;
}

function flowAt(x, y) {
  const angle = 0.1
    + Math.sin(y * 0.0045) * 0.34
    + Math.cos(x * 0.0031) * 0.28
    + Math.sin((x - y) * 0.0022) * 0.24;
  let vectorX = Math.cos(angle) * 1.08;
  let vectorY = Math.sin(angle) * 1.08;
  const attractors = [
    [344, 764, 0.9, 640],
    [786, 214, 0.72, 520],
    [1258, 694, 0.82, 590],
  ];
  for (const [cx, cy, strength, radius] of attractors) {
    const dx = cx - x;
    const dy = cy - y;
    const length = Math.hypot(dx, dy) || 1;
    const pull = Math.max(0, 1 - length / radius) * strength;
    vectorX += dx / length * pull;
    vectorY += dy / length * pull;
  }
  for (const obstacle of FLOW_OBSTACLES) {
    const dx = x - obstacle.cx;
    const dy = y - obstacle.cy;
    const normalizedDistance = Math.hypot(dx / obstacle.rx, dy / obstacle.ry) || 1;
    const push = Math.max(0, 1.35 - normalizedDistance) * 0.95;
    vectorX += dx / obstacle.rx / normalizedDistance * push;
    vectorY += dy / obstacle.ry / normalizedDistance * push;
  }
  // A split near the lower-middle basin keeps two directional branches alive
  // before the attractors recombine them farther to the right.
  const branchWeight = Math.exp(-distanceSquared([x, y], [760, 532]) / 155000);
  vectorY += (y < 532 ? -1 : 1) * branchWeight * 0.46;
  return normalize(vectorX, vectorY);
}

function ellipsePoints(obstacle, segmentCount = 32) {
  const points = [];
  for (let index = 0; index < segmentCount; index += 1) {
    const angle = index / segmentCount * TAU;
    points.push([
      obstacle.cx + Math.cos(angle) * obstacle.rx,
      obstacle.cy + Math.sin(angle) * obstacle.ry,
    ]);
  }
  return points;
}

function edgeIntersectsObstacle(points, edge, obstacle) {
  const from = points[edge.a];
  const to = points[edge.b];
  for (let step = 0; step <= 8; step += 1) {
    const amount = step / 8;
    const x = from[0] + (to[0] - from[0]) * amount;
    const y = from[1] + (to[1] - from[1]) * amount;
    const dx = (x - obstacle.cx) / obstacle.rx;
    const dy = (y - obstacle.cy) / obstacle.ry;
    if (dx * dx + dy * dy < 1) return true;
  }
  return false;
}

function edgeAlignment(points, edge, vectorAt = flowAt) {
  const a = points[edge.a];
  const b = points[edge.b];
  const direction = normalize(b[0] - a[0], b[1] - a[1]);
  const midpointX = (a[0] + b[0]) * 0.5;
  const midpointY = (a[1] + b[1]) * 0.5;
  const vector = vectorAt(midpointX, midpointY);
  return direction[0] * vector[0] + direction[1] * vector[1];
}

function routeSegments(points, route, stroke, width, opacity) {
  const body = [];
  for (let index = 1; index < route.length; index += 1) {
    const from = points[route[index - 1]];
    const to = points[route[index]];
    body.push(line(from[0], from[1], to[0], to[1], stroke, width, opacity));
  }
  return body.join('');
}

function voronoiDelaunayStudy(seed = 0x4f544f31) {
  const points = organicSites(deriveSeed(seed, 'dual-field'), 12, 8, 62, 54, 46, 42, 112, 88);
  const triangles = delaunay(points);
  const edges = uniqueEdges(triangles);
  const cells = voronoiCells(points, 34);
  const routeTargets = [
    [100, 824],
    [304, 694],
    [452, 342],
    [704, 566],
    [882, 184],
    [1088, 444],
    [1288, 144],
    [1504, 246],
  ];
  const route = simpleStitchedRoute(
    points,
    edges,
    routeTargets,
    (from, to, length) => {
      const alignment = edgeAlignment(points, { a: from, b: to }, (x, y) => {
        const angle = 0.12
          + Math.sin(y * 0.0064) * 0.72
          - Math.cos(x * 0.0046) * 0.5
          + Math.sin((x - y) * 0.0031) * 0.35;
        return [Math.cos(angle), Math.sin(angle)];
      });
      const midpoint = [
        (points[from][0] + points[to][0]) * 0.5,
        (points[from][1] + points[to][1]) * 0.5,
      ];
      const basin = Math.exp(-distanceSquared(midpoint, [792, 478]) / 180000);
      return length * (1.35 - alignment * 0.52 + basin * 0.16);
    },
  );
  const body = [];

  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index].length > 2) {
      const fill = index % 11 === 0 ? COLOR.paperDeep : 'none';
      const opacity = fill === 'none' ? 0.48 : 0.22;
      body.push(path(cells[index], COLOR.clay, 0.72, opacity, true, fill));
    }
  }
  for (const edge of edges) {
    const from = points[edge.a];
    const to = points[edge.b];
    body.push(line(from[0], from[1], to[0], to[1], COLOR.ink, 0.82, 0.66));
  }
  for (const point of points) body.push(circle(point[0], point[1], 2.1, COLOR.ink, 0.8));
  body.push(routeSegments(points, route, COLOR.red, 3.25, 0.93));
  const routeStart = points[route[0]];
  const routeEnd = points[route[route.length - 1]];
  body.push(circle(routeStart[0], routeStart[1], 4.8, COLOR.paper, 0.95, COLOR.red, 1.35));
  body.push(circle(routeEnd[0], routeEnd[1], 4.8, COLOR.paper, 0.95, COLOR.red, 1.35));

  return svgDocument({
    slug: 'voronoi-delaunay-dual',
    title: 'Voronoi–Delaunay dual',
    description: 'A jittered field exposes its two complementary readings at once: clipped Voronoi cells and the Delaunay graph that joins their generating sites.',
    source: `${SOURCE.mesh}; ${SOURCE.lattice}`,
    seed,
    body: body.join(''),
  });
}

function triangulatedFlowNetwork(seed = 0x4f544f32) {
  const points = organicSites(deriveSeed(seed, 'flow-field'), 14, 9, 54, 52, 44, 38, 96, 72);
  const triangles = delaunay(points);
  const edges = uniqueEdges(triangles);
  const routeTargets = [
    [90, 826],
    [282, 712],
    [472, 352],
    [658, 218],
    [838, 600],
    [1036, 820],
    [1214, 392],
    [1450, 154],
    [1512, 264],
  ];
  const route = stitchedRoute(
    points,
    edges,
    routeTargets,
    (from, to, length) => {
      const edge = { a: from, b: to };
      const alignment = edgeAlignment(points, edge);
      const blocked = FLOW_OBSTACLES.some((obstacle) => edgeIntersectsObstacle(points, edge, obstacle));
      const fromPoint = points[from];
      const toPoint = points[to];
      const midpoint = [(fromPoint[0] + toPoint[0]) * 0.5, (fromPoint[1] + toPoint[1]) * 0.5];
      const basin = Math.exp(-distanceSquared(midpoint, [760, 532]) / 135000);
      return length * (1.3 - alignment * 0.72 + basin * 0.12 + (blocked ? 5.8 : 0));
    },
  );
  const body = [];

  for (const candidate of triangles) {
    const centroid = [
      (points[candidate.a][0] + points[candidate.b][0] + points[candidate.c][0]) / 3,
      (points[candidate.a][1] + points[candidate.b][1] + points[candidate.c][1]) / 3,
    ];
    const flow = flowAt(centroid[0], centroid[1]);
    const averageAlignment = [candidate.a, candidate.b, candidate.c].reduce((sum, index, indexInTriangle, vertices) => {
      const next = vertices[(indexInTriangle + 1) % vertices.length];
      const from = points[index];
      const to = points[next];
      const direction = normalize(to[0] - from[0], to[1] - from[1]);
      return sum + direction[0] * flow[0] + direction[1] * flow[1];
    }, 0) / 3;
    const fill = averageAlignment > 0.42 ? COLOR.paperDeep : 'none';
    if (fill !== 'none') {
      body.push(path(
        [points[candidate.a], points[candidate.b], points[candidate.c]],
        COLOR.paperDeep,
        0,
        0.16,
        true,
        fill,
      ));
    }
  }

  for (const edge of edges) {
    const alignment = edgeAlignment(points, edge);
    const blocked = FLOW_OBSTACLES.some((obstacle) => edgeIntersectsObstacle(points, edge, obstacle));
    const stroke = alignment > 0.14 ? COLOR.ink : COLOR.clay;
    const opacity = blocked ? 0.07 : 0.25 + Math.abs(alignment) * 0.34;
    const width = blocked ? 0.42 : 0.62 + Math.max(0, alignment) * 0.48;
    const from = points[edge.a];
    const to = points[edge.b];
    body.push(line(from[0], from[1], to[0], to[1], stroke, width, opacity));
  }
  for (const point of points) body.push(circle(point[0], point[1], 2.25, COLOR.ink, 0.68));
  for (const obstacle of FLOW_OBSTACLES) {
    body.push(path(ellipsePoints(obstacle), COLOR.clay, 1.05, 0.45, true));
  }
  body.push(routeSegments(points, route, COLOR.red, 3.6, 0.96));

  return svgDocument({
    slug: 'triangulated-flow-network',
    title: 'Triangulated flow network',
    description: 'A triangulated field is weighted by a slow directional current; a single shortest route through that field is held in red.',
    source: `${SOURCE.mesh}; ${SOURCE.lattice}`,
    seed,
    body: body.join(''),
  });
}

function convexHull(points) {
  const sorted = points
    .map((point, index) => ({ point, index }))
    .sort((left, right) => left.point[0] - right.point[0] || left.point[1] - right.point[1]);
  const turn = (a, b, c) => (
    (b.point[0] - a.point[0]) * (c.point[1] - a.point[1])
      - (b.point[1] - a.point[1]) * (c.point[0] - a.point[0])
  );
  const lower = [];
  for (const point of sorted) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper = [];
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index];
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1)).map((entry) => entry.point);
}

function boundaryNode(cluster, targetCenter) {
  const direction = normalize(
    targetCenter[0] - cluster.center[0],
    targetCenter[1] - cluster.center[1],
  );
  let bestIndex = 0;
  let bestScore = -Infinity;
  for (let index = 0; index < cluster.points.length; index += 1) {
    const point = cluster.points[index];
    const radial = normalize(point[0] - cluster.center[0], point[1] - cluster.center[1]);
    const projection = radial[0] * direction[0] + radial[1] * direction[1];
    const radius = Math.hypot(point[0] - cluster.center[0], point[1] - cluster.center[1]);
    const score = projection * 100 + radius;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function bridgePolyline(first, second, routeIndex) {
  const firstIndex = boundaryNode(first, second.center);
  const secondIndex = boundaryNode(second, first.center);
  const from = first.points[firstIndex];
  const to = second.points[secondIndex];
  const deltaX = to[0] - from[0];
  const deltaY = to[1] - from[1];
  const length = Math.hypot(deltaX, deltaY) || 1;
  const normal = [-deltaY / length, deltaX / length];
  const bend = (routeIndex % 2 === 0 ? 1 : -1) * clamp(length * 0.055, 18, 34);
  const waypoint = (amount, scale) => [
    from[0] + deltaX * amount + normal[0] * bend * scale,
    from[1] + deltaY * amount + normal[1] * bend * scale,
  ];
  const points = length > 425
    ? [from, waypoint(0.3, 1), waypoint(0.68, 0.78), to]
    : [from, waypoint(0.5, 1), to];
  return { firstIndex, secondIndex, points };
}

function clusteredPolygonalTopology(seed = 0x4f544f33) {
  const random = rng(deriveSeed(seed, 'cluster-field'));
  const centers = [
    [188, 224],
    [510, 154],
    [866, 304],
    [1318, 210],
    [342, 722],
    [786, 770],
    [1268, 724],
  ];
  const clusters = [];
  const body = [];
  // The shared runner remaps literal light-palette hex values for every
  // study. These study-scoped classes keep the light geometry/colors unchanged
  // while giving this dark asset a deliberate, high-contrast treatment. RGB
  // functions are intentional: they survive the runner's global hex pass.
  body.push(`<style>
    svg[data-study="clustered-polygonal-topology"] .clustered-ink {
      stroke: rgb(25, 23, 25) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-ink-soft {
      stroke: rgb(83, 72, 74) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-clay {
      stroke: rgb(166, 84, 66) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-paper-deep {
      fill: rgb(236, 236, 234) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-ink-dot {
      fill: rgb(25, 23, 25) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-ink-soft-dot {
      fill: rgb(83, 72, 74) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-clay-dot {
      fill: rgb(166, 84, 66) !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-red {
      stroke: #CA2121 !important;
    }
    svg[data-study="clustered-polygonal-topology"] .clustered-red-dot {
      fill: #CA2121 !important;
      stroke: #CA2121 !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-ink {
      stroke: rgb(249, 236, 236) !important;
      stroke-width: 1.66px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-ink-soft {
      stroke: rgb(220, 194, 194) !important;
      stroke-width: 1.52px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-clay {
      stroke: rgb(214, 128, 120) !important;
      stroke-width: 1.28px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-paper-deep {
      fill: rgb(43, 27, 28) !important;
      opacity: 0.25 !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-ink-dot {
      fill: rgb(249, 236, 236) !important;
      stroke: rgb(249, 236, 236) !important;
      stroke-width: 1.8px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-ink-soft-dot {
      fill: rgb(220, 194, 194) !important;
      stroke: rgb(220, 194, 194) !important;
      stroke-width: 1.6px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-clay-dot {
      fill: rgb(214, 128, 120) !important;
      stroke: rgb(214, 128, 120) !important;
      stroke-width: 1.8px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-red {
      stroke: #CA2121 !important;
      stroke-width: 4.45px !important;
    }
    svg[data-study="clustered-polygonal-topology"][data-theme="dark"] .clustered-red-dot {
      fill: #CA2121 !important;
      stroke: #CA2121 !important;
      stroke-width: 1.8px !important;
    }
  </style>`);
  const clusterCircle = (cx, cy, radius, className, opacity = 0.82) => (
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="none" opacity="${f(opacity)}" stroke="none" stroke-width="0" class="${className}"/>`
  );

  for (let clusterIndex = 0; clusterIndex < centers.length; clusterIndex += 1) {
    const center = centers[clusterIndex];
    const count = 12 + Math.floor(random() * 5);
    const local = [];
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * TAU + (random() - 0.5) * 0.22;
      const radius = Math.sqrt(random());
      const radiusX = 122 + random() * 46;
      const radiusY = 88 + random() * 34;
      local.push([
        center[0] + Math.cos(angle) * radius * radiusX,
        center[1] + Math.sin(angle) * radius * radiusY,
      ]);
    }
    const weights = local.map(() => 0.65 + random() * 1.15);
    clusters.push({ center, points: local, weights, triangles: delaunay(local) });
  }

  for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex += 1) {
    const cluster = clusters[clusterIndex];
    const hull = convexHull(cluster.points);
    body.push(path(hull, 'none', 1.22, 0.72, true, 'none', 'class="clustered-ink"'));
    for (const candidate of cluster.triangles) {
      const trianglePoints = [
        cluster.points[candidate.a],
        cluster.points[candidate.b],
        cluster.points[candidate.c],
      ];
      if ((candidate.a + candidate.b + candidate.c + clusterIndex) % 5 === 0) {
        body.push(path(trianglePoints, 'none', 0, 0.2, true, 'none', 'class="clustered-paper-deep"'));
      }
      const localEdges = [[candidate.a, candidate.b], [candidate.b, candidate.c], [candidate.c, candidate.a]];
      for (const [fromIndex, toIndex] of localEdges) {
        if (fromIndex > toIndex) continue;
        const from = cluster.points[fromIndex];
        const to = cluster.points[toIndex];
        const weight = (cluster.weights[fromIndex] + cluster.weights[toIndex]) * 0.5;
        const edgeClass = weight > 1.23 ? 'clustered-ink' : 'clustered-clay';
        body.push(line(from[0], from[1], to[0], to[1], 'none', 0.66 + weight * 0.2, 0.48 + weight * 0.12, `class="${edgeClass}"`));
      }
    }
    for (let index = 0; index < cluster.points.length; index += 1) {
      const point = cluster.points[index];
      const weight = cluster.weights[index];
      const dotClass = weight > 1.28 ? 'clustered-ink-dot' : 'clustered-clay-dot';
      body.push(clusterCircle(point[0], point[1], 1.5 + weight * 1.6, dotClass));
    }
  }

  // This is a deliberate tree rather than a perimeter tour: two clean chains
  // meet at the left island, leaving the open centre quiet and avoiding a
  // dangling vertical connector between the upper and lower fields.
  const clusterRoute = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6]];
  const bridgePairs = [];
  for (const [firstIndex, secondIndex] of clusterRoute) {
    const first = clusters[firstIndex];
    const second = clusters[secondIndex];
    const routeIndex = bridgePairs.length;
    const bridge = bridgePolyline(first, second, routeIndex);
    bridgePairs.push({ first, second, bridge, routeIndex });
    body.push(path(bridge.points, 'none', 1.05, 0.68, false, 'none', 'class="clustered-ink-soft"'));
    for (let pointIndex = 1; pointIndex < bridge.points.length - 1; pointIndex += 1) {
      const point = bridge.points[pointIndex];
      body.push(clusterCircle(point[0], point[1], 3.1, 'clustered-ink-soft-dot'));
    }
  }

  // The upper chain is one coherent route across four islands. Keeping the
  // lower branch in ink makes the red reading selective without breaking its
  // continuity at each visible junction.
  for (const bridge of bridgePairs.slice(0, 3)) {
    body.push(path(bridge.bridge.points, 'none', 3.1, 0.92, false, 'none', 'class="clustered-red"'));
    for (let pointIndex = 1; pointIndex < bridge.bridge.points.length - 1; pointIndex += 1) {
      const point = bridge.bridge.points[pointIndex];
      body.push(clusterCircle(point[0], point[1], 2.65, 'clustered-red-dot', 0.94));
    }
  }

  return svgDocument({
    slug: 'clustered-polygonal-topology',
    title: 'Clustered polygonal topology',
    description: 'Weighted node islands form local polygonal meshes, then a sparse sequence of bridges turns separate density fields into one connected topology.',
    source: `${SOURCE.mesh}; ${SOURCE.lattice}`,
    seed,
    body: body.join(''),
  });
}

export const hybridRelativeStudies = [
  {
    slug: 'voronoi-delaunay-dual',
    title: 'Voronoi–Delaunay dual',
    description: 'Clipped cells and their generating graph share one jittered field, with a single red chain crossing the dual reading.',
    source: `${SOURCE.mesh}; ${SOURCE.lattice}`,
    generate: voronoiDelaunayStudy,
  },
  {
    slug: 'triangulated-flow-network',
    title: 'Triangulated flow network',
    description: 'A directional field changes the weight of each triangle edge while one red geodesic finds its way through the lattice.',
    source: `${SOURCE.mesh}; ${SOURCE.lattice}`,
    generate: triangulatedFlowNetwork,
  },
  {
    slug: 'clustered-polygonal-topology',
    title: 'Clustered polygonal topology',
    description: 'Weighted local meshes become connected islands through deliberately chosen bridges and one restrained red connection.',
    source: `${SOURCE.mesh}; ${SOURCE.lattice}`,
    generate: clusteredPolygonalTopology,
  },
];
