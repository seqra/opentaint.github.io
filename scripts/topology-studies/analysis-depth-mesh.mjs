/**
 * A deterministic Differential Mesh adaptation for comparing analysis depth.
 *
 * The image has one evolving triangular program space. Three local activation
 * fronts resolve progressively larger connected patches of that same mesh:
 * the shallow front is neutral, the farther front is clay, and the deepest
 * frontier is vermilion. No marks are added outside the mesh itself.
 */

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const VERSION = 'analysis-depth-mesh-1.1.0';
const SOURCE = 'https://inconvergent.net/generative/differential-mesh/';

const COLOR = Object.freeze({
  paper: '#f7f7f5',
  // Keep these authored role colors in the topology runner's palette map.
  // That gives the same mesh a crisp, high-contrast dark variant instead of
  // leaving the light-mode gray values against the red-phosphor background.
  paperDeep: '#ececea',
  ink: '#191719',
  inkSoft: '#53484a',
  clay: '#a65442',
  red: '#ca2121',
});

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

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

function dot(ax, ay, bx, by) {
  return ax * bx + ay * by;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, className = '') {
  const classAttribute = className ? ` class="${className}"` : '';
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round"${classAttribute}/>`;
}

function polygon(points, fill, opacity = 1, className = '') {
  if (points.length < 3) return '';
  const commands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point[0])} ${f(point[1])}`);
  const classAttribute = className ? ` class="${className}"` : '';
  return `<path d="${commands.join(' ')} Z" fill="${fill}" opacity="${f(opacity)}"${classAttribute}/>`;
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgDocument({ slug, title, description, seed, body }) {
  const id = `analysis-depth-${hashSeed(slug).toString(16)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="title-${id} desc-${id}" data-generator="opentaint-analysis-depth" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${escapeText(slug)}" data-source="${SOURCE}">
  <title id="title-${id}">${escapeText(title)}</title>
  <desc id="desc-${id}">${escapeText(description)}</desc>
  <style>
    /* Dark cards need more physical line weight, not only brighter colors. */
    [data-theme="dark"] .analysis-depth-boundary { stroke-width: 1.82px !important; }
    [data-theme="dark"] .analysis-depth-interior { stroke-width: 0.98px !important; }
    [data-theme="dark"] .analysis-depth-front-neutral { stroke-width: 2.05px !important; }
    [data-theme="dark"] .analysis-depth-front-clay { stroke-width: 2.42px !important; }
    [data-theme="dark"] .analysis-depth-front-red { stroke-width: 3.12px !important; }
    [data-theme="dark"] .analysis-depth-fill-neutral { opacity: 0.16 !important; }
    [data-theme="dark"] .analysis-depth-fill-clay { opacity: 0.17 !important; }
    [data-theme="dark"] .analysis-depth-fill-red { opacity: 0.21 !important; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.paper}"/>
  ${body}
</svg>
`;
}

function edgeKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function faceEdges(face) {
  return [[face.a, face.b], [face.b, face.c], [face.c, face.a]];
}

function createSeedMesh(seed) {
  const random = rng(deriveSeed(seed, 'mesh-seed'));
  const center = { x: 800, y: 500 };
  const ringCount = 7;
  const nodes = [center];
  for (let index = 0; index < ringCount; index += 1) {
    const angle = index * TAU / ringCount - Math.PI / 2;
    const radius = 82 + (random() - 0.5) * 10;
    nodes.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      generation: 0,
    });
  }
  const faces = [];
  for (let index = 0; index < ringCount; index += 1) {
    const next = (index + 1) % ringCount;
    faces.push({ a: 0, b: 1 + index, c: 1 + next, generation: 0 });
  }
  return { nodes, faces };
}

function meshEdgeMap(faces) {
  const map = new Map();
  for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
    for (const [a, b] of faceEdges(faces[faceIndex])) {
      const key = edgeKey(a, b);
      if (!map.has(key)) map.set(key, { a, b, faces: [] });
      map.get(key).faces.push(faceIndex);
    }
  }
  return map;
}

function meshFrontier(faces) {
  const map = meshEdgeMap(faces);
  const frontier = [];
  for (const edge of map.values()) {
    if (edge.faces.length !== 1) continue;
    const faceIndex = edge.faces[0];
    const face = faces[faceIndex];
    const third = [face.a, face.b, face.c].find((index) => index !== edge.a && index !== edge.b);
    frontier.push({ a: edge.a, b: edge.b, face: faceIndex, third, generation: face.generation });
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

function candidateClear(candidate, a, b, nodes, faces, minimum) {
  for (let index = 0; index < nodes.length; index += 1) {
    if (index === a || index === b) continue;
    if (distance(candidate, nodes[index]) < minimum) return false;
  }
  const edges = meshEdgeMap(faces);
  for (const edge of edges.values()) {
    if (edge.a === a || edge.a === b || edge.b === a || edge.b === b) continue;
    const first = nodes[edge.a];
    const second = nodes[edge.b];
    if (segmentIntersects(candidate, nodes[a], first, second)
      || segmentIntersects(candidate, nodes[b], first, second)) return false;
  }
  return true;
}

function relaxMesh(mesh, near, far, passes = 2) {
  const { nodes, faces } = mesh;
  const adjacency = nodes.map(() => new Set());
  const incident = nodes.map(() => []);
  for (const face of faces) {
    for (const [a, b] of faceEdges(face)) {
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
        const midpointX = (nodes[opposite[0]].x + nodes[opposite[1]].x) * 0.5;
        const midpointY = (nodes[opposite[0]].y + nodes[opposite[1]].y) * 0.5;
        const dx = midpointX - node.x;
        const dy = midpointY - node.y;
        const length = Math.hypot(dx, dy) || 1;
        const triangleForce = (length - near * 0.866) * 0.009;
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

function splitLongEdges(mesh, limit) {
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

function growMesh(seed) {
  const random = rng(deriveSeed(seed, 'mesh'));
  const mesh = createSeedMesh(seed);
  const height = 54;
  const near = height * 1.06;
  const far = height * 3.7;

  for (let iteration = 0; iteration < 34; iteration += 1) {
    const frontier = meshFrontier(mesh.faces);
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
      const normal = [-tangent[1], tangent[0]];
      const midpoint = { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
      const interior = dot(third.x - midpoint.x, third.y - midpoint.y, normal[0], normal[1]);
      const outward = interior > 0 ? [-normal[0], -normal[1]] : normal;
      const offset = (random() - 0.5) * height * 0.38;
      const candidate = {
        x: midpoint.x + outward[0] * height + tangent[0] * offset,
        y: midpoint.y + outward[1] * height + tangent[1] * offset,
      };
      if (candidate.x < 60 || candidate.x > WIDTH - 60 || candidate.y < 60 || candidate.y > HEIGHT - 60) continue;
      if (!candidateClear(candidate, edge.a, edge.b, mesh.nodes, mesh.faces, height * 0.68)) continue;
      const preference = edge.generation + random() * 2.2 + (iteration % 5 === 0 ? random() : 0);
      candidates.push({ edge, candidate, preference });
    }

    candidates.sort((a, b) => b.preference - a.preference);
    const accepted = [];
    for (const item of candidates.slice(0, 9)) {
      if (mesh.nodes.length >= 360) break;
      if (!candidateClear(item.candidate, item.edge.a, item.edge.b, mesh.nodes, mesh.faces, height * 0.68)) continue;
      if (accepted.some((other) => distance(item.candidate, other.candidate) < height * 0.8)) continue;
      const id = mesh.nodes.length;
      mesh.nodes.push({ x: item.candidate.x, y: item.candidate.y, generation: iteration + 1 });
      const face = { a: item.edge.a, b: item.edge.b, c: id, generation: iteration + 1 };
      if (cross(mesh.nodes[face.b].x - mesh.nodes[face.a].x, mesh.nodes[face.b].y - mesh.nodes[face.a].y, mesh.nodes[face.c].x - mesh.nodes[face.a].x, mesh.nodes[face.c].y - mesh.nodes[face.a].y) < 0) {
        [face.a, face.b] = [face.b, face.a];
      }
      mesh.faces.push(face);
      accepted.push(item);
    }

    relaxMesh(mesh, near, far, 2);
    if (iteration % 7 === 6) splitLongEdges(mesh, height * 1.85);
  }
  return mesh;
}

function faceCentroid(mesh, faceIndex) {
  const face = mesh.faces[faceIndex];
  return {
    x: (mesh.nodes[face.a].x + mesh.nodes[face.b].x + mesh.nodes[face.c].x) / 3,
    y: (mesh.nodes[face.a].y + mesh.nodes[face.b].y + mesh.nodes[face.c].y) / 3,
  };
}

function faceAdjacency(mesh) {
  const adjacency = mesh.faces.map(() => new Set());
  for (const edge of meshEdgeMap(mesh.faces).values()) {
    for (let first = 0; first < edge.faces.length; first += 1) {
      for (let second = first + 1; second < edge.faces.length; second += 1) {
        adjacency[edge.faces[first]].add(edge.faces[second]);
        adjacency[edge.faces[second]].add(edge.faces[first]);
      }
    }
  }
  return adjacency;
}

function nearestFace(mesh, point, excluded = new Set()) {
  let selected = -1;
  let selectedDistance = Infinity;
  for (let index = 0; index < mesh.faces.length; index += 1) {
    if (excluded.has(index)) continue;
    const centroid = faceCentroid(mesh, index);
    const currentDistance = Math.hypot(centroid.x - point.x, centroid.y - point.y);
    if (currentDistance < selectedDistance) {
      selectedDistance = currentDistance;
      selected = index;
    }
  }
  return selected;
}

function connectedActivation(mesh, start, count, random) {
  const adjacency = faceAdjacency(mesh);
  const selected = new Set([start]);
  const frontier = new Set(adjacency[start]);
  const origin = faceCentroid(mesh, start);

  // Grow a small, connected prefix with a little generation-weighted drift.
  // It preserves the mesh's own topology: the colored marks are never drawn
  // as a separate route or curve over the artwork.
  while (frontier.size > 0 && selected.size < count) {
    let next = -1;
    let bestScore = -Infinity;
    for (const candidate of frontier) {
      const centroid = faceCentroid(mesh, candidate);
      const radialDistance = Math.hypot(centroid.x - origin.x, centroid.y - origin.y);
      const generation = mesh.faces[candidate].generation;
      const score = -radialDistance * 0.008 + generation * 0.14 + random() * 0.72;
      if (score > bestScore) {
        bestScore = score;
        next = candidate;
      }
    }
    if (next < 0) break;
    frontier.delete(next);
    selected.add(next);
    for (const neighbor of adjacency[next]) {
      if (!selected.has(neighbor)) frontier.add(neighbor);
    }
  }
  return selected;
}

function activationZones(mesh, seed) {
  const random = rng(deriveSeed(seed, 'activation-zones'));
  const targets = [
    { x: 520, y: 472 },
    { x: 806, y: 520 },
    { x: 1120, y: 236 },
  ];
  const sizes = [9, 16, 24];
  const zones = [];
  const used = new Set();
  for (let index = 0; index < targets.length; index += 1) {
    const start = nearestFace(mesh, targets[index], used);
    if (start < 0) {
      zones.push(new Set());
      continue;
    }
    const zone = connectedActivation(mesh, start, sizes[index], random);
    zones.push(zone);
    for (const faceIndex of zone) used.add(faceIndex);
  }
  return { shallow: zones[0], intermediate: zones[1], deep: zones[2] };
}

function facePoints(mesh, faceIndex) {
  const face = mesh.faces[faceIndex];
  return [face.a, face.b, face.c].map((nodeIndex) => [mesh.nodes[nodeIndex].x, mesh.nodes[nodeIndex].y]);
}

function frontierEdges(mesh, activeFaces) {
  const edges = [];
  for (const edge of meshEdgeMap(mesh.faces).values()) {
    const activeCount = edge.faces.filter((faceIndex) => activeFaces.has(faceIndex)).length;
    if (activeCount > 0 && activeCount < edge.faces.length) edges.push(edge);
  }
  return edges;
}

function frontierFaces(mesh, activeFaces) {
  const faces = new Set();
  for (const edge of frontierEdges(mesh, activeFaces)) {
    for (const faceIndex of edge.faces) {
      if (activeFaces.has(faceIndex)) faces.add(faceIndex);
    }
  }
  return faces;
}

function analysisDepthMesh(seed = 0x0e52026) {
  const mesh = growMesh(seed);
  const { shallow, intermediate, deep } = activationZones(mesh, seed);
  const body = [];

  // Keep the program space mostly open. Small connected face patches and their
  // frontiers carry the depth signal; the rest of the mesh remains paper so
  // the image retains its airy source language instead of becoming a block of
  // color.
  for (const faceIndex of shallow) body.push(polygon(facePoints(mesh, faceIndex), COLOR.inkSoft, 0.085, 'analysis-depth-fill-neutral'));
  for (const faceIndex of intermediate) body.push(polygon(facePoints(mesh, faceIndex), COLOR.clay, 0.085, 'analysis-depth-fill-clay'));
  for (const faceIndex of deep) body.push(polygon(facePoints(mesh, faceIndex), COLOR.red, 0.12, 'analysis-depth-fill-red'));

  const edges = meshEdgeMap(mesh.faces);
  for (const edge of edges.values()) {
    const first = mesh.nodes[edge.a];
    const second = mesh.nodes[edge.b];
    const boundary = edge.faces.length === 1;
    const stroke = boundary ? COLOR.ink : COLOR.inkSoft;
    const width = boundary ? 1.25 : 0.68;
    const opacity = boundary ? 0.62 : 0.32;
    body.push(line(
      first.x,
      first.y,
      second.x,
      second.y,
      stroke,
      width,
      opacity,
      boundary ? 'analysis-depth-boundary' : 'analysis-depth-interior',
    ));
  }

  // Each colored stroke is an actual boundary of a connected resolved patch
  // in the same mesh: gray stops first, clay reaches farther, and red reaches
  // the deepest local frontier. Keeping them separate avoids muddy precedence
  // mixing while retaining the source's loose island composition.
  for (const edge of frontierEdges(mesh, shallow)) {
    const first = mesh.nodes[edge.a];
    const second = mesh.nodes[edge.b];
    body.push(line(first.x, first.y, second.x, second.y, COLOR.inkSoft, 1.42, 0.62, 'analysis-depth-front-neutral'));
  }
  for (const edge of frontierEdges(mesh, intermediate)) {
    const first = mesh.nodes[edge.a];
    const second = mesh.nodes[edge.b];
    body.push(line(first.x, first.y, second.x, second.y, COLOR.clay, 1.68, 0.72, 'analysis-depth-front-clay'));
  }
  for (const edge of frontierEdges(mesh, deep)) {
    const first = mesh.nodes[edge.a];
    const second = mesh.nodes[edge.b];
    body.push(line(first.x, first.y, second.x, second.y, COLOR.red, 2.2, 0.86, 'analysis-depth-front-red'));
  }

  return svgDocument({
    slug: 'analysis-depth-mesh',
    title: 'Analysis depth mesh',
    description: 'One evolving differential mesh resolves through three local connected fronts: a shallow neutral region, a farther clay region, and a deepest red frontier.',
    seed,
    body: body.join(''),
  });
}

export const analysisDepthMeshStudies = [
  {
    slug: 'analysis-depth-mesh',
    title: 'Analysis depth mesh',
    description: 'A shared triangular program space is resolved by three local connected analysis fronts, with depth expressed through sparse mesh activation.',
    source: SOURCE,
    // This red is intentionally invariant between light and dark assets; the
    // topology runner preserves it while remapping the neutral/clay roles.
    darkPreserveColors: [COLOR.red],
    generate: analysisDepthMesh,
  },
];
