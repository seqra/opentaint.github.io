/*
 * Three deterministic relatives of Differential Lattice.
 *
 * The studies keep the useful part of a lattice—local connectivity that can
 * be read at a glance—while changing the construction rule in each panel:
 * a relative-neighborhood graph, a force-relaxed branching graph, and a
 * continuously deformed structural grid.
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
const SOURCE = 'https://inconvergent.net/generative/differential-lattice/';

function hashSeed(value) {
  const text = String(value === undefined || value === null ? 'lattice' : value);
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
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function fmt(value) {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function line(a, b, stroke, width, opacity) {
  return (
    '<line x1="' +
    fmt(a.x) +
    '" y1="' +
    fmt(a.y) +
    '" x2="' +
    fmt(b.x) +
    '" y2="' +
    fmt(b.y) +
    '" stroke="' +
    stroke +
    '" stroke-width="' +
    fmt(width) +
    '" opacity="' +
    fmt(opacity) +
    '" stroke-linecap="round"/>'
  );
}

function circle(node, radius, fill, stroke, width, opacity) {
  return (
    '<circle cx="' +
    fmt(node.x) +
    '" cy="' +
    fmt(node.y) +
    '" r="' +
    fmt(radius) +
    '" fill="' +
    fill +
    '" stroke="' +
    stroke +
    '" stroke-width="' +
    fmt(width) +
    '" opacity="' +
    fmt(opacity) +
    '"/>'
  );
}

function path(points, stroke, width, opacity, fill = 'none') {
  if (!points.length) return '';
  let d = 'M ' + fmt(points[0].x) + ' ' + fmt(points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    d += ' L ' + fmt(points[index].x) + ' ' + fmt(points[index].y);
  }
  return (
    '<path d="' +
    d +
    '" fill="' +
    fill +
    '" stroke="' +
    stroke +
    '" stroke-width="' +
    fmt(width) +
    '" opacity="' +
    fmt(opacity) +
    '" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}

function edgeKey(a, b) {
  return a < b ? a + ':' + b : b + ':' + a;
}

function svgDocument(slug, title, description, seed, body) {
  const titleId = slug + '-title';
  const descriptionId = slug + '-description';
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
    '" data-generator="topology-lattice-relatives-v1" data-seed="' +
    hashSeed(seed) +
    '"><title id="' +
    titleId +
    '">' +
    escapeXml(title) +
    '</title><desc id="' +
    descriptionId +
    '">' +
    escapeXml(description) +
    '</desc><rect width="1600" height="1000" fill="' +
    PALETTE.paper +
    '"/>' +
    body +
    '</svg>\n'
  );
}

function unionFind(size) {
  const parent = Array.from({ length: size }, (_, index) => index);
  function find(index) {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    while (parent[index] !== index) {
      const next = parent[index];
      parent[index] = root;
      index = next;
    }
    return root;
  }
  function join(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return false;
    parent[rootB] = rootA;
    return true;
  }
  return { find, join };
}

function nearestRoute(nodes, edges, start, target) {
  const adjacency = nodes.map(() => []);
  for (const edge of edges) {
    adjacency[edge.a].push({ to: edge.b, weight: edge.length });
    adjacency[edge.b].push({ to: edge.a, weight: edge.length });
  }
  const distances = nodes.map(() => Infinity);
  const previous = nodes.map(() => -1);
  const visited = nodes.map(() => false);
  distances[start] = 0;
  for (let iteration = 0; iteration < nodes.length; iteration += 1) {
    let current = -1;
    let best = Infinity;
    for (let index = 0; index < nodes.length; index += 1) {
      if (!visited[index] && distances[index] < best) {
        best = distances[index];
        current = index;
      }
    }
    if (current < 0) break;
    visited[current] = true;
    if (current === target) break;
    for (const neighbor of adjacency[current]) {
      const candidate = distances[current] + neighbor.weight;
      if (candidate < distances[neighbor.to]) {
        distances[neighbor.to] = candidate;
        previous[neighbor.to] = current;
      }
    }
  }
  if (previous[target] < 0 && start !== target) return [];
  const route = [];
  let current = target;
  while (current >= 0) {
    route.unshift(current);
    if (current === start) break;
    current = previous[current];
  }
  return route[0] === start ? route : [];
}

function stitchedRoute(nodes, edges, waypoints) {
  const route = [];
  for (let index = 1; index < waypoints.length; index += 1) {
    const segment = nearestRoute(nodes, edges, waypoints[index - 1], waypoints[index]);
    if (!segment.length) return [];
    if (!route.length) route.push(...segment);
    else route.push(...segment.slice(1));
  }
  return route;
}

function gridWalk(grid, waypoints) {
  const route = [grid[waypoints[0].row][waypoints[0].column]];
  let current = { ...waypoints[0] };
  for (let index = 1; index < waypoints.length; index += 1) {
    const target = waypoints[index];
    while (current.row !== target.row) {
      current.row += current.row < target.row ? 1 : -1;
      route.push(grid[current.row][current.column]);
    }
    while (current.column !== target.column) {
      current.column += current.column < target.column ? 1 : -1;
      route.push(grid[current.row][current.column]);
    }
  }
  return route;
}

// ---------------------------------------------------------------------------
// 1. Adaptive relative-neighborhood lattice
// ---------------------------------------------------------------------------

function generateAdaptiveProximity(seed = 'adaptive-proximity') {
  const random = rngFrom(String(seed) + ':adaptive-proximity');
  const columns = 12;
  const rows = 7;
  const nodes = [];
  for (let row = 0; row < rows; row += 1) {
    const v = row / (rows - 1);
    for (let column = 0; column < columns; column += 1) {
      const u = column / (columns - 1);
      const baseX = 150 + u * 1300;
      const baseY = 150 + v * 700;
      const phase = u * 4.3 + v * 2.1;
      nodes.push({
        x:
          baseX +
          Math.sin(phase + 0.7) * 38 +
          Math.cos(v * 8.1) * 20 +
          (random() - 0.5) * 14,
        y:
          baseY +
          Math.cos(phase * 1.17) * 34 +
          Math.sin(u * 7.4) * 18 +
          (random() - 0.5) * 14,
        row,
        column,
      });
    }
  }

  const candidates = [];
  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      const length = distance(nodes[a], nodes[b]);
      const midpoint = {
        x: (nodes[a].x + nodes[b].x) * 0.5,
        y: (nodes[a].y + nodes[b].y) * 0.5,
      };
      const adaptiveLimit =
        178 +
        32 * Math.sin(midpoint.x * 0.004 + midpoint.y * 0.002) +
        22 * Math.cos(midpoint.y * 0.006);
      if (length > adaptiveLimit) continue;
      candidates.push({ a, b, length });
    }
  }

  const edges = [];
  const edgeKeys = new Set();
  const addEdge = (edge) => {
    const key = edgeKey(edge.a, edge.b);
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push(edge);
  };

  // Relative-neighborhood filtering keeps the local structure legible: an
  // edge survives only when no third point lies in its lune.
  for (const edge of candidates) {
    let blocked = false;
    for (let index = 0; index < nodes.length; index += 1) {
      if (index === edge.a || index === edge.b) continue;
      const aDistance = distance(nodes[edge.a], nodes[index]);
      const bDistance = distance(nodes[edge.b], nodes[index]);
      if (Math.max(aDistance, bDistance) < edge.length * 0.97) {
        blocked = true;
        break;
      }
    }
    if (!blocked) addEdge(edge);
  }

  // Add the shortest incident edge for isolated points, then complete the
  // minimum spanning backbone so the visual lattice never falls apart.
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    let nearest = null;
    for (const edge of candidates) {
      if (edge.a !== nodeIndex && edge.b !== nodeIndex) continue;
      if (!nearest || edge.length < nearest.length) nearest = edge;
    }
    if (nearest) addEdge(nearest);
  }
  const disjoint = unionFind(nodes.length);
  for (const edge of edges) disjoint.join(edge.a, edge.b);
  for (const edge of candidates.slice().sort((a, b) => a.length - b.length)) {
    if (disjoint.join(edge.a, edge.b)) addEdge(edge);
  }

  const degrees = nodes.map(() => 0);
  for (const edge of edges) {
    degrees[edge.a] += 1;
    degrees[edge.b] += 1;
  }
  const waypoints = [
    { row: 5, column: 0 },
    { row: 2, column: 3 },
    { row: 5, column: 5 },
    { row: 1, column: 7 },
    { row: 4, column: 6 },
    { row: 2, column: 10 },
    { row: 6, column: 11 },
    { row: 3, column: 11 },
  ].map(({ row, column }) => row * columns + column);
  const fallbackStart = nodes.reduce(
    (best, node, index) => (node.x < nodes[best].x && degrees[index] >= 2 ? index : best),
    0,
  );
  const fallbackTarget = nodes.reduce(
    (best, node, index) => (node.x > nodes[best].x && degrees[index] >= 2 ? index : best),
    nodes.length - 1,
  );
  const stitched = stitchedRoute(nodes, edges, waypoints);
  const route = stitched.length
    ? stitched
    : nearestRoute(nodes, edges, fallbackStart, fallbackTarget);
  const routeKeys = new Set();
  for (let index = 1; index < route.length; index += 1) {
    routeKeys.add(edgeKey(route[index - 1], route[index]));
  }

  let body = '<g fill="none">';
  for (const edge of edges) {
    const key = edgeKey(edge.a, edge.b);
    if (routeKeys.has(key)) continue;
    const width = edge.length < 126 ? 2.05 : 1.15;
    const opacity = clamp(0.28 + (190 - edge.length) * 0.0038, 0.3, 0.68);
    body += line(nodes[edge.a], nodes[edge.b], edge.length < 126 ? PALETTE.inkSoft : PALETTE.clay, width, opacity);
  }
  for (let index = 1; index < route.length; index += 1) {
    body += line(nodes[route[index - 1]], nodes[route[index]], PALETTE.red, 4.2, 0.92);
  }
  body += '</g><g>';
  for (let index = 0; index < nodes.length; index += 1) {
    const onRoute = route.includes(index);
    const radius = 6.2 + Math.min(5.2, degrees[index] * 0.72);
    body += circle(
      nodes[index],
      radius,
      onRoute ? PALETTE.red : PALETTE.paper,
      onRoute ? PALETTE.redDark : PALETTE.inkSoft,
      onRoute ? 1.7 : 1.35,
      onRoute ? 0.96 : 0.9,
    );
  }
  body += '</g>';
  return svgDocument(
    'adaptive-proximity-lattice',
    'Adaptive proximity lattice',
    'A relative-neighborhood graph with an adaptive local radius, a connected backbone, and one coherent route.',
    seed,
    body,
  );
}

// ---------------------------------------------------------------------------
// 2. Force-relaxed branching graph
// ---------------------------------------------------------------------------

function generateRelaxedBranching(seed = 'relaxed-branching') {
  const random = rngFrom(String(seed) + ':relaxed-branching');
  const earlyLeavesByDepth = new Map([
    [4, new Set([2, 8, 13])],
    [5, new Set([1, 7, 16, 23, 29])],
  ]);
  // The older spring/repulsion pass could leave siblings at different radii
  // and make inner limbs cross.  This grammar keeps every generation on a
  // common radial step: each child is a fixed horizontal offset from its
  // parent, and the offsets decrease monotonically so neighboring sectors
  // never exchange order.
  const tree = buildGrammarTree(random, {
    rootX: 800,
    rootY: 900,
    maxDepth: 6,
    levelHeight: 122,
    leafSpacing: 22,
    // A sparse, fixed termination map makes the crown irregular without
    // making it look randomly pruned.  The route's alternating branch
    // indices (0, 1, 2, 5, 10, 21) are deliberately left alive through
    // generation six.
    shouldBranch: ({ depth, branchIndex }) => {
      if (depth >= 6) return false;
      if (depth < 4) return true;
      return !earlyLeavesByDepth.get(depth)?.has(branchIndex);
    },
  });
  const { nodes, edges } = tree;

  // Keep the tidy x-ordering that prevents crossings, but ease every
  // generation off a perfectly mechanical baseline.  A pair of slow waves
  // gives each branch a restrained, repeatable length difference without
  // introducing noisy point-by-point jitter or collapsing the crown.
  const lengthPhase = random() * TAU;
  for (const node of nodes) {
    if (node.parent < 0) continue;
    const amplitude = 5 + node.depth * 2.1;
    const broadWave = Math.sin(node.initialX * 0.012 + node.depth * 0.71 + lengthPhase);
    const fineWave = Math.sin(node.initialX * 0.026 - node.depth * 1.39 - lengthPhase * 0.7);
    node.y += (broadWave * 0.68 + fineWave * 0.32) * amplitude;
  }
  const redNodes = new Set([0]);
  const redKeys = new Set();
  // Alternating sides gives the route several unmistakable turns while
  // remaining one actual root-to-leaf walk in the tree.
  const routeSides = [-1, 1, -1, 1, -1, 1];
  let current = 0;
  for (const side of routeSides) {
    const next = nodes[current].children.find((index) => nodes[index].side === side);
    if (next === undefined) break;
    redKeys.add(edgeKey(current, next));
    redNodes.add(next);
    current = next;
  }

  const body = '<g fill="none">' + treeEdgeMarkup(tree, redKeys, redNodes) + '</g>';
  return svgDocument(
    'force-relaxed-branching',
    'Force-relaxed branching graph',
    'An ordered branching grammar with varied leaf depths and branch lengths, non-crossing limbs, and one winding root-to-leaf route.',
    seed,
    body,
  );
}

function buildForceTree(random, options = {}) {
  const rootX = options.rootX === undefined ? 800 : options.rootX;
  const rootY = options.rootY === undefined ? 884 : options.rootY;
  const maxDepth = options.maxDepth === undefined ? 5 : options.maxDepth;
  const baseLength = options.baseLength === undefined ? 192 : options.baseLength;
  const relaxationSteps = options.relaxationSteps === undefined ? 64 : options.relaxationSteps;
  const levelHeight = options.levelHeight === undefined ? 122 : options.levelHeight;
  const nodes = [];
  const edges = [];

  nodes.push({
    x: rootX,
    y: rootY,
    initialX: rootX,
    initialY: rootY,
    depth: 0,
    side: 0,
    parent: -1,
    children: [],
  });

  function append(parentIndex, depth, side, angle, length) {
    const parent = nodes[parentIndex];
    const actualAngle = angle + (random() - 0.5) * (0.1 + depth * 0.014);
    const child = {
      x: parent.x + Math.cos(actualAngle) * length,
      y: parent.y + Math.sin(actualAngle) * length,
      initialX: 0,
      initialY: 0,
      depth,
      side,
      parent: parentIndex,
      children: [],
    };
    child.initialX = child.x;
    child.initialY = child.y;
    const childIndex = nodes.length;
    nodes.push(child);
    parent.children.push(childIndex);
    edges.push({ a: parentIndex, b: childIndex, rest: length });
    if (depth >= maxDepth) return;

    const spread = depth === 1 ? 0.36 : 0.205 + depth * 0.018;
    const nextLength = length * (0.72 + random() * 0.1);
    const childCount = random() < 0.12 && depth > 2 ? 1 : 2;
    for (let slot = 0; slot < childCount; slot += 1) {
      const sign = slot === 0 ? -1 : 1;
      const childSide = side === 0 ? sign : side;
      const childAngle =
        actualAngle +
        sign * spread +
        (random() - 0.5) * 0.07;
      append(childIndex, depth + 1, childSide, childAngle, nextLength);
    }
  }

  append(0, 1, -1, -Math.PI * 0.5 - 0.42, baseLength * (0.96 + random() * 0.08));
  append(0, 1, 1, -Math.PI * 0.5 + 0.42, baseLength * (0.96 + random() * 0.08));

  for (let iteration = 0; iteration < relaxationSteps; iteration += 1) {
    const forces = nodes.map(() => ({ x: 0, y: 0 }));
    for (const edge of edges) {
      const a = nodes[edge.a];
      const b = nodes[edge.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy) || 1;
      const spring = (length - edge.rest) * 0.022;
      const fx = (dx / length) * spring;
      const fy = (dy / length) * spring;
      forces[edge.a].x += fx;
      forces[edge.a].y += fy;
      forces[edge.b].x -= fx;
      forces[edge.b].y -= fy;
    }
    for (let a = 0; a < nodes.length; a += 1) {
      for (let b = a + 1; b < nodes.length; b += 1) {
        const dx = nodes[a].x - nodes[b].x;
        const dy = nodes[a].y - nodes[b].y;
        const length = Math.hypot(dx, dy) || 1;
        if (length > 156) continue;
        const repel = ((156 - length) / 156) * 0.28;
        forces[a].x += (dx / length) * repel;
        forces[a].y += (dy / length) * repel;
        forces[b].x -= (dx / length) * repel;
        forces[b].y -= (dy / length) * repel;
      }
    }
    for (let index = 1; index < nodes.length; index += 1) {
      const node = nodes[index];
      const targetY = rootY - node.depth * levelHeight;
      forces[index].x += (node.initialX - node.x) * 0.015;
      forces[index].y += (targetY - node.y) * 0.016;
      if (node.x < 68) forces[index].x += (68 - node.x) * 0.08;
      if (node.x > 1532) forces[index].x -= (node.x - 1532) * 0.08;
      if (node.y < 56) forces[index].y += (56 - node.y) * 0.08;
    }
    for (let index = 1; index < nodes.length; index += 1) {
      nodes[index].x += clamp(forces[index].x, -4.8, 4.8);
      nodes[index].y += clamp(forces[index].y, -4.8, 4.8);
    }
    nodes[0].x = rootX;
    nodes[0].y = rootY;
  }

  return {
    nodes,
    edges,
    leaves: nodes
      .map((node, index) => (node.children.length === 0 ? index : -1))
      .filter((index) => index >= 0),
  };
}

function buildGrammarTree(random, options = {}) {
  const rootX = options.rootX === undefined ? 800 : options.rootX;
  const rootY = options.rootY === undefined ? 900 : options.rootY;
  const growthSign = options.growthSign === undefined ? -1 : options.growthSign;
  const maxDepth = options.maxDepth === undefined ? 6 : options.maxDepth;
  const levelHeight = options.levelHeight === undefined ? 122 : options.levelHeight;
  const leafSpacing = options.leafSpacing === undefined ? 22 : options.leafSpacing;
  const shouldBranch = options.shouldBranch || (() => true);
  const radialScale = 0.98 + random() * 0.04;
  const verticalScale = 0.98 + random() * 0.035;
  const generationLean = (random() - 0.5) * 9;
  const nodes = [];
  const edges = [];
  const leafCount = 2 ** maxDepth;
  const scaledLeafSpacing = leafSpacing * radialScale;
  const leafX = (index) => rootX + (index - (leafCount - 1) * 0.5) * scaledLeafSpacing;

  nodes.push({
    x: rootX,
    y: rootY,
    initialX: rootX,
    initialY: rootY,
    depth: 0,
    side: 0,
    parent: -1,
    children: [],
  });

  // A tidy-tree layout assigns evenly spaced leaf slots and places every
  // parent at the midpoint of its two child subtrees.  Endpoint order is
  // therefore preserved at every row, so the straight limbs cannot cross.
  function append(parentIndex, depth, branchIndex) {
    if (depth > maxDepth) return;
    const parent = nodes[parentIndex];
    const generationY = rootY + growthSign * depth * levelHeight * verticalScale;
    const generationX = generationLean * (depth / maxDepth);
    for (const side of [-1, 1]) {
      const childBranchIndex = branchIndex * 2 + (side > 0 ? 1 : 0);
      const childLeavesPerSubtree = 2 ** (maxDepth - depth);
      const childFirstLeaf = childBranchIndex * childLeavesPerSubtree;
      const childLastLeaf = childFirstLeaf + childLeavesPerSubtree - 1;
      const child = {
        x: (leafX(childFirstLeaf) + leafX(childLastLeaf)) * 0.5 + generationX,
        y: generationY,
        initialX: 0,
        initialY: 0,
        depth,
        side,
        parent: parentIndex,
        children: [],
      };
      child.initialX = child.x;
      child.initialY = child.y;
      const childIndex = nodes.length;
      nodes.push(child);
      parent.children.push(childIndex);
      edges.push({ a: parentIndex, b: childIndex, rest: distance(parent, child) });
      if (depth < maxDepth && shouldBranch({ depth, branchIndex: childBranchIndex, side, node: child })) {
        append(childIndex, depth + 1, childBranchIndex);
      }
    }
  }

  append(0, 1, 0);
  return {
    nodes,
    edges,
    leaves: nodes
      .map((node, index) => (node.children.length === 0 ? index : -1))
      .filter((index) => index >= 0),
  };
}

function treePath(tree, start, target) {
  const startAncestors = new Map();
  let current = start;
  let depth = 0;
  while (current >= 0) {
    startAncestors.set(current, depth);
    current = tree.nodes[current].parent;
    depth += 1;
  }
  const targetPath = [];
  current = target;
  while (current >= 0 && !startAncestors.has(current)) {
    targetPath.unshift(current);
    current = tree.nodes[current].parent;
  }
  if (current < 0) return [];
  const result = [start];
  let cursor = start;
  while (cursor !== current) {
    cursor = tree.nodes[cursor].parent;
    result.push(cursor);
  }
  result.push(...targetPath);
  return result;
}

function addTreePath(tree, start, target, edgeKeys, nodeKeys) {
  const route = treePath(tree, start, target);
  for (const index of route) nodeKeys.add(index);
  for (let index = 1; index < route.length; index += 1) {
    edgeKeys.add(edgeKey(route[index - 1], route[index]));
  }
  return route;
}

function treeEdgeMarkup(tree, redKeys, redNodes, bridgeOffset = 0) {
  let markup = '';
  for (const edge of tree.edges) {
    const a = tree.nodes[edge.a];
    const b = tree.nodes[edge.b];
    const key = edgeKey(edge.a + bridgeOffset, edge.b + bridgeOffset);
    if (redKeys.has(key)) {
      markup += line(a, b, PALETTE.red, 3.8, 0.9);
      continue;
    }
    const depth = a.depth;
    const width = clamp(4.8 - depth * 0.62, 1.05, 4.8);
    const stroke = depth < 2 ? PALETTE.ink : depth < 4 ? PALETTE.inkSoft : PALETTE.clay;
    markup += line(a, b, stroke, width, depth < 3 ? 0.76 : 0.62);
  }
  for (let index = 0; index < tree.nodes.length; index += 1) {
    const node = tree.nodes[index];
    const key = index + bridgeOffset;
    const highlighted = redNodes.has(key);
    const radius = clamp(13.5 - node.depth * 1.55 + node.children.length * 1.7, 4.2, 15.5);
    markup += circle(
      node,
      radius,
      highlighted ? PALETTE.red : PALETTE.paper,
      highlighted ? PALETTE.redDark : node.depth < 2 ? PALETTE.ink : PALETTE.inkSoft,
      highlighted ? 1.8 : 1.2,
      highlighted ? 0.95 : 0.86,
    );
  }
  return markup;
}

// ---------------------------------------------------------------------------
// 3. Deformed structural grid / stress lattice
// ---------------------------------------------------------------------------

function generateDeformedStressGrid(seed = 'deformed-stress-grid') {
  const random = rngFrom(String(seed) + ':deformed-stress-grid');
  const columns = 16;
  const rows = 9;
  const originX = 118;
  const originY = 122;
  const spacingX = 91;
  const spacingY = 94;
  const phase = random() * TAU;
  const nodes = [];
  const grid = [];
  for (let row = 0; row < rows; row += 1) {
    const line = [];
    for (let column = 0; column < columns; column += 1) {
      const baseX = originX + column * spacingX;
      const baseY = originY + row * spacingY;
      const waveA = Math.sin(baseY * 0.008 + phase) * 46;
      const waveB = Math.cos(baseX * 0.006 - phase * 0.8) * 38;
      const shear = (row / (rows - 1) - 0.5) * Math.sin(column * 0.52 + phase) * 58;
      const node = {
        x: baseX + waveA + shear,
        y:
          baseY +
          waveB +
          Math.sin((baseX + baseY) * 0.004 + phase) * 30 +
          (column / (columns - 1) - 0.5) * 22 * Math.sin(row * 0.6 + phase),
        baseX,
        baseY,
        row,
        column,
      };
      line.push(nodes.length);
      nodes.push(node);
    }
    grid.push(line);
  }

  const edges = [];
  const addGridEdge = (a, b, rest) => {
    const length = distance(nodes[a], nodes[b]);
    edges.push({ a, b, rest, length, stress: Math.abs(length - rest) / rest });
  };
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const current = grid[row][column];
      if (column < columns - 1) addGridEdge(current, grid[row][column + 1], spacingX);
      if (row < rows - 1) addGridEdge(current, grid[row + 1][column], spacingY);
      if (row < rows - 1 && column < columns - 1 && (row + column) % 3 === 0) {
        addGridEdge(current, grid[row + 1][column + 1], Math.hypot(spacingX, spacingY));
      }
      if (row < rows - 1 && column > 0 && (row * 2 + column) % 5 === 0) {
        addGridEdge(current, grid[row + 1][column - 1], Math.hypot(spacingX, spacingY));
      }
    }
  }

  const route = gridWalk(grid, [
    { row: 4, column: 2 },
    { row: 2, column: 5 },
    { row: 6, column: 8 },
    { row: 3, column: 11 },
    { row: 5, column: 9 },
    { row: 2, column: 14 },
    { row: 6, column: 15 },
  ]);
  const redKeys = new Set();
  const redNodes = new Set(route);
  for (let index = 1; index < route.length; index += 1) {
    redKeys.add(edgeKey(route[index - 1], route[index]));
  }

  let body = '<g fill="none">';
  for (const edge of edges) {
    const key = edgeKey(edge.a, edge.b);
    if (redKeys.has(key)) continue;
    const stroke = edge.stress > 0.34 ? PALETTE.ink : edge.stress > 0.2 ? PALETTE.inkSoft : PALETTE.clay;
    const width = edge.stress > 0.34 ? 2.5 : edge.stress > 0.2 ? 1.8 : 1.05;
    const opacity = edge.stress > 0.34 ? 0.78 : edge.stress > 0.2 ? 0.62 : 0.48;
    body += line(nodes[edge.a], nodes[edge.b], stroke, width, opacity);
  }
  for (const edge of edges) {
    if (redKeys.has(edgeKey(edge.a, edge.b))) {
      body += line(nodes[edge.a], nodes[edge.b], PALETTE.red, 3.8, 0.9);
    }
  }
  body += '</g><g>';
  for (const node of nodes) {
    const connectedToStress = redNodes.has(nodes.indexOf(node));
    const radius = connectedToStress ? 7.3 : 4.8 + Math.sin(node.column * 0.8 + node.row) * 0.6;
    body += circle(
      node,
      radius,
      connectedToStress ? PALETTE.red : PALETTE.paper,
      connectedToStress ? PALETTE.redDark : PALETTE.inkSoft,
      connectedToStress ? 1.7 : 1.05,
      connectedToStress ? 0.95 : 0.8,
    );
  }
  body += '</g>';
  return svgDocument(
    'deformed-stress-lattice',
    'Deformed stress lattice',
    'A connected structural grid deformed by smooth wave and shear fields, with line weight revealing local strain.',
    seed,
    body,
  );
}

// ---------------------------------------------------------------------------
// 4. Diagonal stress lattice
// ---------------------------------------------------------------------------

function generateDiagonalStressGrid(seed = 'diagonal-stress-grid') {
  const random = rngFrom(String(seed) + ':diagonal-stress-grid');
  const columns = 15;
  const rows = 9;
  const grid = [];
  const nodes = [];
  const phase = random() * TAU;
  for (let row = 0; row < rows; row += 1) {
    const line = [];
    for (let column = 0; column < columns; column += 1) {
      const baseX = 82 + column * 88 + row * 23;
      const baseY = 238 + row * 88 - column * 14;
      const diagonalWave = Math.sin((column - row) * 0.43 + phase) * 28;
      const crossWave = Math.cos((column + row) * 0.31 - phase) * 22;
      const node = {
        x: baseX + diagonalWave + Math.sin(baseY * 0.007 + phase) * 18,
        y: baseY + crossWave + Math.cos(baseX * 0.005 - phase) * 24,
        row,
        column,
      };
      line.push(nodes.length);
      nodes.push(node);
    }
    grid.push(line);
  }

  const edges = [];
  const addEdge = (a, b, rest, diagonal) => {
    const length = distance(nodes[a], nodes[b]);
    edges.push({ a, b, rest, length, diagonal, stress: Math.abs(length - rest) / rest });
  };
  const rowRest = Math.hypot(88, 14);
  const columnRest = Math.hypot(23, 88);
  const diagonalRest = Math.hypot(111, 74);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const current = grid[row][column];
      if (column < columns - 1) addEdge(current, grid[row][column + 1], rowRest, true);
      if (row < rows - 1) addEdge(current, grid[row + 1][column], columnRest, false);
      if (row < rows - 1 && column < columns - 1) {
        addEdge(current, grid[row + 1][column + 1], diagonalRest, true);
      }
      if (row < rows - 1 && column > 0 && (row + column) % 3 === 0) {
        addEdge(current, grid[row + 1][column - 1], diagonalRest, true);
      }
    }
  }

  const waypointIds = [
    { row: 7, column: 1 },
    { row: 4, column: 4 },
    { row: 6, column: 7 },
    { row: 2, column: 10 },
    { row: 5, column: 8 },
    { row: 1, column: 13 },
    { row: 4, column: 14 },
  ].map(({ row, column }) => grid[row][column]);
  const stitched = stitchedRoute(nodes, edges, waypointIds);
  const route = stitched.length ? stitched : waypointIds;
  const redKeys = new Set();
  const redNodes = new Set(route);
  for (let index = 1; index < route.length; index += 1) {
    redKeys.add(edgeKey(route[index - 1], route[index]));
  }

  let body = '<g fill="none">';
  for (const edge of edges) {
    if (redKeys.has(edgeKey(edge.a, edge.b))) continue;
    const stroke = edge.diagonal ? PALETTE.inkSoft : PALETTE.clay;
    const width = edge.diagonal ? 1.65 : 1.05;
    const opacity = edge.diagonal ? 0.62 : 0.46;
    body += line(nodes[edge.a], nodes[edge.b], stroke, width, opacity);
  }
  for (const edge of edges) {
    if (redKeys.has(edgeKey(edge.a, edge.b))) {
      body += line(nodes[edge.a], nodes[edge.b], PALETTE.red, 3.8, 0.9);
    }
  }
  body += '</g><g>';
  for (let index = 0; index < nodes.length; index += 1) {
    const highlighted = redNodes.has(index);
    body += circle(
      nodes[index],
      highlighted ? 7.1 : 4.7,
      highlighted ? PALETTE.red : PALETTE.paper,
      highlighted ? PALETTE.redDark : PALETTE.inkSoft,
      highlighted ? 1.7 : 1.05,
      highlighted ? 0.95 : 0.8,
    );
  }
  body += '</g>';
  return svgDocument(
    'diagonal-stress-lattice',
    'Diagonal stress lattice',
    'A sheared diagonal lattice where smooth deformation reveals strain along intersecting structural directions.',
    seed,
    body,
  );
}

// ---------------------------------------------------------------------------
// 5. Centered force-relaxed tree with one highlighted route
// ---------------------------------------------------------------------------

function generateTwoTreeLeafBridge(seed = 'two-tree-leaf-bridge') {
  const random = rngFrom(String(seed) + ':two-tree-leaf-bridge');
  // Preserve the liked force-relaxed geometry of the original left tree and
  // use it as the complete study instead of composing a second tree.
  const tree = buildForceTree(random, {
    rootX: 360,
    rootY: 900,
    maxDepth: 5,
    baseLength: 190,
    relaxationSteps: 68,
    levelHeight: 134,
  });

  // The force pass occasionally folds the far-left tips into a tight bundle.
  // Open only that local subtree with a small, anchored x-repulsion pass; the
  // original coordinates keep the correction organic and asymmetric.
  const leftCanopy = tree.nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.side < 0 && node.depth >= 2);
  const originalX = new Map(leftCanopy.map(({ node, index }) => [index, node.x]));
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const forces = new Map(leftCanopy.map(({ index }) => [index, 0]));
    for (let a = 0; a < leftCanopy.length; a += 1) {
      const first = leftCanopy[a];
      for (let b = a + 1; b < leftCanopy.length; b += 1) {
        const second = leftCanopy[b];
        const verticalDistance = Math.abs(first.node.y - second.node.y);
        if (verticalDistance > 86) continue;
        const horizontalDistance = Math.abs(first.node.x - second.node.x);
        const minimumGap = Math.max(19, 35 - Math.min(first.node.depth, second.node.depth) * 2.6);
        if (horizontalDistance >= minimumGap) continue;
        const direction = first.node.x <= second.node.x ? -1 : 1;
        const overlap = (minimumGap - horizontalDistance) / minimumGap;
        const proximity = 1 - verticalDistance / 86;
        const push = overlap * proximity * 1.1;
        forces.set(first.index, forces.get(first.index) + direction * push);
        forces.set(second.index, forces.get(second.index) - direction * push);
      }
    }
    for (const { node, index } of leftCanopy) {
      const anchor = (originalX.get(index) - node.x) * 0.035;
      node.x += clamp(forces.get(index) + anchor, -2.8, 2.8);
    }
  }

  // Finish the correction across the entire left terminal contour.  Keeping
  // every left leaf in one monotonic projection prevents a newly opened tip
  // from leaping past its neighbouring branch (which would make two limbs
  // cross), while the right half of the force-relaxed crown remains untouched.
  const leftTipLeaves = tree.leaves
    .filter((index) => tree.nodes[index].side < 0)
    .sort((a, b) => tree.nodes[a].x - tree.nodes[b].x);
  for (let index = 1; index < leftTipLeaves.length; index += 1) {
    const previous = tree.nodes[leftTipLeaves[index - 1]];
    const current = tree.nodes[leftTipLeaves[index]];
    const localGap = 25 + (Math.sin(previous.y * 0.013 + index * 2.17) * 0.5 + 0.5) * 4;
    if (current.x - previous.x < localGap) current.x = previous.x + localGap;
  }

  // Give the left crown a clear directional gesture.  The bias grows with
  // depth, so limbs leave the trunk gently and then open toward the left
  // rather than forming a vertical wall near the centre.  It is applied
  // uniformly within each generation, preserving the existing leaf order and
  // therefore the force tree's non-crossing topology.
  const rootX = tree.nodes[0].x;
  for (const node of tree.nodes) {
    if (node.side >= 0 || node.depth < 1) continue;
    const depthProgress = node.depth / 5;
    const distanceFromRoot = Math.max(0, rootX - node.x);
    node.x -= 12 + depthProgress * 60 + distanceFromRoot * 0.04;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of tree.nodes) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  }

  // Prefer a terminal node in the middle of the crown rather than an outer
  // edge tip, so the red walk has a visible interior destination.
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const interiorLeaves = tree.leaves.filter((index) => {
    const normalizedX = (tree.nodes[index].x - minX) / width;
    return normalizedX > 0.22 && normalizedX < 0.78;
  });
  const candidates = interiorLeaves.length ? interiorLeaves : tree.leaves;
  const targetLeaf = candidates.reduce((best, index) => {
    const node = tree.nodes[index];
    const score =
      Math.abs(node.x - (minX + width * 0.52)) / width +
      Math.abs(node.y - (minY + height * 0.48)) / height * 0.42;
    if (best < 0) return index;
    const bestNode = tree.nodes[best];
    const bestScore =
      Math.abs(bestNode.x - (minX + width * 0.52)) / width +
      Math.abs(bestNode.y - (minY + height * 0.48)) / height * 0.42;
    return score < bestScore ? index : best;
  }, -1);

  const redKeys = new Set();
  const redNodes = new Set();
  addTreePath(tree, 0, targetLeaf, redKeys, redNodes);

  // Frame the preserved geometry at a broad, balanced scale with generous
  // margins and a centered visual footprint.
  const frame = { minX: 190, maxX: 1410, minY: 110, maxY: 890 };
  const scaleX = (frame.maxX - frame.minX) / width;
  const scaleY = (frame.maxY - frame.minY) / height;
  for (const node of tree.nodes) {
    node.x = frame.minX + (node.x - minX) * scaleX;
    node.y = frame.minY + (node.y - minY) * scaleY;
  }

  const body = '<g fill="none">' + treeEdgeMarkup(tree, redKeys, redNodes, 0) + '</g>';
  return svgDocument(
    'two-tree-leaf-bridge',
    'Centered force-relaxed tree',
    'A single force-relaxed rooted tree is centered at broad scale, with one non-trivial red route following actual edges to an interior canopy leaf.',
    seed,
    body,
  );
}

// ---------------------------------------------------------------------------
// 6. Opposed trees joined through one selected leaf bridge
// ---------------------------------------------------------------------------

function generateOpposedTreeLeafBridge(seed = 'opposed-tree-leaf-bridge') {
  const random = rngFrom(String(seed) + ':opposed-tree-leaf-bridge');
  const bottom = buildGrammarTree(random, {
    rootX: 400,
    rootY: 918,
    growthSign: -1,
    maxDepth: 4,
    levelHeight: 134,
    leafSpacing: 36,
  });
  const top = buildGrammarTree(random, {
    rootX: 1200,
    rootY: 82,
    growthSign: 1,
    maxDepth: 4,
    levelHeight: 134,
    leafSpacing: 36,
  });
  const topOffset = bottom.nodes.length;

  const rotateClockwiseAroundGroupCenter = (tree) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const node of tree.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;
    for (const node of tree.nodes) {
      const offsetX = node.x - centerX;
      const offsetY = node.y - centerY;
      // Screen coordinates make (-offsetY, offsetX) a clockwise quarter turn.
      node.x = centerX - offsetY;
      node.y = centerY + offsetX;
    }
  };

  // Rotate each original vertical group around its own bounds before applying
  // the right group's requested horizontal reflection.
  rotateClockwiseAroundGroupCenter(bottom);
  rotateClockwiseAroundGroupCenter(top);

  const mirrorHorizontallyAroundGroupCenter = (tree) => {
    let minX = Infinity;
    let maxX = -Infinity;
    for (const node of tree.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
    }
    const centerX = (minX + maxX) * 0.5;
    for (const node of tree.nodes) node.x = centerX * 2 - node.x;
  };

  // Reflect only the right group after its rotation, preserving its own
  // visual center and reversing its horizontal growth direction.
  mirrorHorizontallyAroundGroupCenter(top);

  const rotateHalfTurnAroundGroupCenter = (tree) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const node of tree.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;
    for (const node of tree.nodes) {
      node.x = centerX * 2 - node.x;
      node.y = centerY * 2 - node.y;
    }
  };

  // Turn the already-reflected right tree another 180° around its own visual
  // bounds center before recomputing the sole inter-tree leaf connection.
  rotateHalfTurnAroundGroupCenter(top);

  // Keep the combined rotated composition vertically centered, including any
  // seed-dependent scale/lean introduced by the grammar layout.
  let minimumY = Infinity;
  let maximumY = -Infinity;
  for (const tree of [bottom, top]) {
    for (const node of tree.nodes) {
      minimumY = Math.min(minimumY, node.y);
      maximumY = Math.max(maximumY, node.y);
    }
  }
  const verticalTranslation = 500 - (minimumY + maximumY) * 0.5;
  for (const tree of [bottom, top]) {
    for (const node of tree.nodes) node.y += verticalTranslation;
  }

  // At the transformed frontier, select leaves in y-order. Use different
  // interior positions for the two trees: this keeps both root-to-leaf routes
  // away from the trivial outer contour and gives them visibly different turn
  // sequences before the single connecting bridge.
  const orderedFrontierLeaves = (tree) => {
    const ordered = tree.leaves
      .slice()
      .sort((a, b) => tree.nodes[a].y - tree.nodes[b].y);
    return ordered;
  };
  const bottomLeaves = orderedFrontierLeaves(bottom);
  const topLeaves = orderedFrontierLeaves(top);
  const bottomRouteLeaf = bottomLeaves[Math.round((bottomLeaves.length - 1) * 0.4)];
  const topRouteLeaf = topLeaves[Math.round((topLeaves.length - 1) * 0.67)];
  const bridges = bottomRouteLeaf !== undefined && topRouteLeaf !== undefined
    ? [{ bottom: bottomRouteLeaf, top: topRouteLeaf, red: true }]
    : [];

  const redKeys = new Set();
  const redNodes = new Set();
  const addOffsetPath = (tree, start, target, offset) => {
    const route = treePath(tree, start, target);
    for (const index of route) redNodes.add(index + offset);
    for (let index = 1; index < route.length; index += 1) {
      redKeys.add(edgeKey(route[index - 1] + offset, route[index] + offset));
    }
  };
  const selectedBridge = bridges[0];
  if (selectedBridge) {
    // The route follows actual edges in each rotated tree, crosses exactly one
    // selected leaf bridge, then finishes at the opposing root.
    addOffsetPath(bottom, 0, selectedBridge.bottom, 0);
    addOffsetPath(top, selectedBridge.top, 0, topOffset);
    redKeys.add(edgeKey(selectedBridge.bottom, selectedBridge.top + topOffset));
    redNodes.add(selectedBridge.bottom);
    redNodes.add(selectedBridge.top + topOffset);
  }

  let body = '<g fill="none">';
  body += treeEdgeMarkup(bottom, redKeys, redNodes, 0);
  body += treeEdgeMarkup(top, redKeys, redNodes, topOffset);
  for (const bridge of bridges) {
    const a = bottom.nodes[bridge.bottom];
    const b = top.nodes[bridge.top];
    body += line(
      a,
      b,
      bridge.red ? PALETTE.red : PALETTE.clay,
      bridge.red ? 3.8 : 1.5,
      bridge.red ? 0.9 : 0.68,
    );
  }
  body += '</g>';
  return svgDocument(
    'opposed-tree-leaf-bridge',
    'Opposed tree leaf bridge',
    'One rooted tree grows from the floor and another from the ceiling; selected facing leaves bridge the open middle while one red route joins the two roots.',
    seed,
    body,
  );
}

// ---------------------------------------------------------------------------
// 7. Connected forest
// ---------------------------------------------------------------------------

function generateConnectedTreeForest(seed = 'connected-tree-forest') {
  const random = rngFrom(String(seed) + ':connected-tree-forest');
  const rootPositions = [190, 585, 980, 1375];
  const trees = rootPositions.map((rootX) =>
    buildForceTree(random, {
      rootX,
      rootY: 900,
      maxDepth: 4,
      baseLength: 146,
      relaxationSteps: 58,
      levelHeight: 150,
    }),
  );
  const offsets = [];
  let offset = 0;
  for (const tree of trees) {
    offsets.push(offset);
    offset += tree.nodes.length;
  }

  const bridges = [];
  for (let index = 0; index < trees.length - 1; index += 1) {
    const left = trees[index];
    const right = trees[index + 1];
    const leftLeaf = left.leaves.reduce(
      (best, leaf) => (left.nodes[leaf].x > left.nodes[best].x ? leaf : best),
      left.leaves[0],
    );
    const rightLeaf = right.leaves.reduce(
      (best, leaf) => (right.nodes[leaf].x < right.nodes[best].x ? leaf : best),
      right.leaves[0],
    );
    bridges.push({ left: leftLeaf, right: rightLeaf, index });
  }

  const redKeys = new Set();
  const redNodes = new Set();
  const addOffsetPath = (tree, start, target, treeOffset) => {
    const route = treePath(tree, start, target);
    for (const nodeIndex of route) redNodes.add(nodeIndex + treeOffset);
    for (let index = 1; index < route.length; index += 1) {
      redKeys.add(edgeKey(route[index - 1] + treeOffset, route[index] + treeOffset));
    }
  };

  const firstBridge = bridges[0];
  addOffsetPath(trees[0], 0, firstBridge.left, offsets[0]);
  for (let index = 0; index < bridges.length; index += 1) {
    const bridge = bridges[index];
    const leftKey = bridge.left + offsets[index];
    const rightKey = bridge.right + offsets[index + 1];
    redKeys.add(edgeKey(leftKey, rightKey));
    redNodes.add(leftKey);
    redNodes.add(rightKey);
    if (index + 1 < bridges.length) {
      addOffsetPath(
        trees[index + 1],
        bridge.right,
        bridges[index + 1].left,
        offsets[index + 1],
      );
    } else {
      addOffsetPath(trees[index + 1], bridge.right, 0, offsets[index + 1]);
    }
  }

  let body = '<g fill="none">';
  for (let index = 0; index < trees.length; index += 1) {
    body += treeEdgeMarkup(trees[index], redKeys, redNodes, offsets[index]);
  }
  for (const bridge of bridges) {
    const a = trees[bridge.index].nodes[bridge.left];
    const b = trees[bridge.index + 1].nodes[bridge.right];
    body += line(a, b, PALETTE.red, 3.5, 0.88);
  }
  body += '</g>';
  return svgDocument(
    'connected-tree-forest',
    'Connected tree forest',
    'Several rooted force-relaxed trees remain legible as individual canopies while leaf bridges carry one sparse route across the forest.',
    seed,
    body,
  );
}

export const latticeRelativeStudies = Object.freeze([
  {
    slug: 'adaptive-proximity-lattice',
    title: 'Adaptive proximity lattice',
    description: 'Relative-neighborhood links adapt to local spacing and resolve into one coherent route.',
    source: SOURCE,
    generate: generateAdaptiveProximity,
  },
  {
    slug: 'force-relaxed-branching',
    title: 'Force-relaxed branching graph',
    description: 'A depth hierarchy settles under spring attraction and bounded repulsion, with a sparse connected red branch.',
    source: SOURCE,
    generate: generateRelaxedBranching,
  },
  {
    slug: 'two-tree-leaf-bridge',
    title: 'Centered force-relaxed tree',
    description: 'A single force-relaxed rooted tree is centered at broad scale, with one non-trivial red route to an interior canopy leaf.',
    source: SOURCE,
    generate: generateTwoTreeLeafBridge,
  },
  {
    slug: 'opposed-tree-leaf-bridge',
    title: 'Opposed tree leaf bridge',
    description: 'Opposed floor- and ceiling-rooted trees meet through selected facing leaves and one continuous red route.',
    source: SOURCE,
    generate: generateOpposedTreeLeafBridge,
  },
  {
    slug: 'connected-tree-forest',
    title: 'Connected tree forest',
    description: 'A sparse leaf-to-leaf route crosses several readable rooted trees without collapsing them into one canopy.',
    source: SOURCE,
    generate: generateConnectedTreeForest,
  },
  {
    slug: 'deformed-stress-lattice',
    title: 'Deformed stress lattice',
    description: 'A smooth deformation field turns a structural grid into a readable map of local strain.',
    source: SOURCE,
    generate: generateDeformedStressGrid,
  },
  {
    slug: 'diagonal-stress-lattice',
    title: 'Diagonal stress lattice',
    description: 'A sheared diagonal structural field exposes strain along intersecting lattice directions.',
    source: SOURCE,
    generate: generateDiagonalStressGrid,
  },
]);

export {
  generateAdaptiveProximity,
  generateRelaxedBranching,
  generateTwoTreeLeafBridge,
  generateOpposedTreeLeafBridge,
  generateConnectedTreeForest,
  generateDeformedStressGrid,
  generateDiagonalStressGrid,
};
