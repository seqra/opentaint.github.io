/*
 * Deterministic SVG studies derived from the mechanisms described in
 * Anders Hoff's Inconvergent pages:
 *
 *   Hyphae   - connected non-overlapping circles with wobbling direction,
 *              shrinking radii, and perpendicular side branches.
 *   Trees    - tip-only branch growth; width shrinks while angular wobble
 *              increases with age. The reference implementation intentionally
 *              does not perform collision checks.
 *   Linetrace - repeatedly trace the nearby edge direction of the previous
 *              polyline, offset by a normal step and a small freehand jitter.
 *
 * This module is an original, compact JavaScript implementation of those
 * mechanics. It does not copy source code or depend on the original Python
 * projects. All output is a static, accessible SVG at 1600 x 1000.
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
const HALF_PI = Math.PI * 0.5;

function hashSeed(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return (value >>> 0) || 1;
  }
  const text = String(value === undefined || value === null ? 'growth' : value);
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

function fmt(value) {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function point(x, y) {
  return { x, y };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
    '" data-generator="inconvergent-growth-v1" data-seed="' +
    hashSeed(seed) +
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

function spatialKey(x, y, cellSize) {
  return Math.floor(x / cellSize) + ':' + Math.floor(y / cellSize);
}

function addToSpatial(spatial, index, node, cellSize) {
  const key = spatialKey(node.x, node.y, cellSize);
  if (!spatial.has(key)) spatial.set(key, []);
  spatial.get(key).push(index);
}

function canPlaceNode(candidate, nodes, spatial, cellSize, parentIndex) {
  const column = Math.floor(candidate.x / cellSize);
  const row = Math.floor(candidate.y / cellSize);
  for (let rowOffset = -2; rowOffset <= 2; rowOffset += 1) {
    for (let columnOffset = -2; columnOffset <= 2; columnOffset += 1) {
      const key = column + columnOffset + ':' + (row + rowOffset);
      const nearby = spatial.get(key) || [];
      for (let index = 0; index < nearby.length; index += 1) {
        const nodeIndex = nearby[index];
        if (nodeIndex === parentIndex) continue;
        const node = nodes[nodeIndex];
        const minimum = Math.max(2.5, (candidate.r + node.r) * 0.62);
        if (distance(candidate, node) < minimum) return false;
      }
    }
  }
  return true;
}

function lineage(nodes, leafIndex) {
  const result = [];
  let index = leafIndex;
  while (index >= 0) {
    result.unshift(index);
    index = nodes[index].parent;
  }
  return result;
}

function generateHyphae(seed) {
  const random = rngFrom(String(seed) + ':hyphae');
  const bounds = { left: 96, top: 82, right: 1504, bottom: 918 };
  const cellSize = 42;
  const nodes = [];
  const spatial = new Map();
  const active = [];
  const seedCount = 1;

  for (let index = 0; index < seedCount; index += 1) {
    // One offset mother tip keeps every later circle attached to a single
    // organism. The colony fills the frame by branching sideways, not by
    // placing disconnected radial seed islands.
    const x = 178 + random() * 18;
    const y = 520 + (random() - 0.5) * 34;
    const direction = -0.02 + (random() - 0.5) * 0.12;
    const node = {
      x,
      y,
      r: 34 + random() * 5,
      a: direction,
      parent: -1,
      depth: 0,
      attempts: 0,
      children: 0,
    };
    nodes.push(node);
    active.push(index);
    addToSpatial(spatial, index, node, cellSize);
  }

  let steps = 0;
  while (active.length > 0 && nodes.length < 2600 && steps < 40000) {
    steps += 1;
    let activePosition = Math.floor(random() * active.length);
    if (random() < 0.74) {
      for (let candidate = 1; candidate < active.length; candidate += 1) {
        if (nodes[active[candidate]].r > nodes[active[activePosition]].r) {
          activePosition = candidate;
        }
      }
    }
    const tipIndex = active[activePosition];
    const tip = nodes[tipIndex];
    tip.attempts += 1;

    if (tip.r < 2.15 || tip.attempts > 16) {
      active.splice(activePosition, 1);
      continue;
    }

    const flexibility = clamp(24 / tip.r, 0.35, 2.7);
    const fieldCurl =
      Math.sin(tip.x * 0.0052 + tip.y * 0.0037) * 0.08 +
      Math.cos(tip.x * 0.0028 - tip.y * 0.0061) * 0.055;
    const wobble =
      (0.018 + flexibility * 0.105) *
      (random() - 0.5) *
      2;
    const childRadius = tip.r * (0.968 + random() * 0.006);
    const forwardBias = clamp((tip.r - 8) / 30, 0, 1);
    const childAngle =
      tip.a +
      fieldCurl * 0.7 +
      wobble +
      (0.02 - tip.a) * 0.045 * forwardBias;
    const child = {
      x: tip.x + Math.cos(childAngle) * (tip.r + childRadius) * 0.84,
      y: tip.y + Math.sin(childAngle) * (tip.r + childRadius) * 0.84,
      r: childRadius,
      a: childAngle,
      parent: tipIndex,
      depth: tip.depth + 1,
      attempts: 0,
      children: 0,
    };

    if (
      child.x < bounds.left ||
      child.x > bounds.right ||
      child.y < bounds.top ||
      child.y > bounds.bottom ||
      !canPlaceNode(child, nodes, spatial, cellSize, tipIndex)
    ) {
      continue;
    }

    const childIndex = nodes.length;
    nodes.push(child);
    tip.children += 1;
    addToSpatial(spatial, childIndex, child, cellSize);
    active.splice(activePosition, 1);
    active.push(childIndex);

    const branchChance =
      0.2 + clamp(tip.depth / 24, 0, 0.22) + (tip.r < 9 ? 0.08 : 0);
    if (random() < branchChance && nodes.length < 2598) {
      const side = random() < 0.5 ? -1 : 1;
      const sideAngle =
        tip.a +
        side * (0.72 + random() * 0.42) +
        fieldCurl * 0.35 +
        wobble * 0.55;
      const sideRadius = tip.r * (0.58 + random() * 0.08);
      const sideNode = {
        x: tip.x + Math.cos(sideAngle) * (tip.r + sideRadius) * 0.9,
        y: tip.y + Math.sin(sideAngle) * (tip.r + sideRadius) * 0.9,
        r: sideRadius,
        a: sideAngle,
        parent: tipIndex,
        depth: tip.depth + 1,
        attempts: 0,
        children: 0,
      };
      if (
        sideNode.x >= bounds.left &&
        sideNode.x <= bounds.right &&
        sideNode.y >= bounds.top &&
        sideNode.y <= bounds.bottom &&
        canPlaceNode(sideNode, nodes, spatial, cellSize, tipIndex)
      ) {
        const sideIndex = nodes.length;
        nodes.push(sideNode);
        tip.children += 1;
        addToSpatial(spatial, sideIndex, sideNode, cellSize);
        active.push(sideIndex);
      }
    }
  }

  let broad = '';
  let medium = '';
  let fine = '';
  const leaves = [];
  for (let index = seedCount; index < nodes.length; index += 1) {
    const node = nodes[index];
    const parent = nodes[node.parent];
    const segment =
      'M ' +
      fmt(parent.x) +
      ' ' +
      fmt(parent.y) +
      ' L ' +
      fmt(node.x) +
      ' ' +
      fmt(node.y);
    const width = clamp(node.r * 0.18, 0.6, 4.55);
    if (width > 3.1) broad += segment;
    else if (width > 1.45) medium += segment;
    else fine += segment;
    if (node.children === 0) leaves.push(index);
  }

  let red = '';
  if (leaves.length > 0) {
    const leaf = leaves[Math.floor(random() * leaves.length)];
    const path = lineage(nodes, leaf);
    const start = Math.max(1, path.length - 6);
    for (let index = start; index < path.length; index += 1) {
      const from = nodes[path[index - 1]];
      const to = nodes[path[index]];
      red +=
        'M ' +
        fmt(from.x) +
        ' ' +
        fmt(from.y) +
        ' L ' +
        fmt(to.x) +
        ' ' +
        fmt(to.y);
    }
  }

  const body =
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="' +
    broad +
    '" stroke="' +
    PALETTE.ink +
    '" stroke-width="3.7" opacity=".86"/>' +
    '<path d="' +
    medium +
    '" stroke="' +
    PALETTE.inkSoft +
    '" stroke-width="1.65" opacity=".8"/>' +
    '<path d="' +
    fine +
    '" stroke="' +
    PALETTE.clay +
    '" stroke-width=".86" opacity=".7"/>' +
    '<path d="' +
    red +
    '" stroke="' +
    PALETTE.red +
    '" stroke-width="2.05" opacity=".86"/>' +
    '</g>';

  return svgDocument(
    'hyphae-growth',
    'Hyphae growth study',
    'Connected non-overlapping circles grow with shrinking radius, wobbling direction, and perpendicular side branches.',
    seed,
    body,
  );
}

function generateTrees(seed) {
  const random = rngFrom(String(seed) + ':trees');
  const segments = [];
  const branches = [];
  let nextId = 1;
  const stepSize = 9;
  const maxDepth = 7;
  // A full depth-seven binary crown needs 255 branches. Capping it at 150
  // exhausted the budget while recursing through the left half of the tree.
  const maxBranches = 300;

  function guideFor(side, angle) {
    if (side < 0) return clamp(angle, -2.68, -1.64);
    if (side > 0) return clamp(angle, -1.5, -0.5);
    return clamp(angle, -1.8, -1.34);
  }

  function spawnChildren(branch, x, y, angle, radius) {
    if (branch.depth >= maxDepth || nextId + 1 >= maxBranches) return [];
    const spread =
      (branch.side === 0 ? 0.46 : 0.2 + branch.depth * 0.018) +
      random() * (branch.side === 0 ? 0.12 : 0.1);
    const childCount = 2;
    const children = [];
    for (let childIndex = 0; childIndex < childCount; childIndex += 1) {
      let side;
      let sign;
      if (branch.side === 0) {
        side = childIndex === 0 ? -1 : 1;
        sign = side;
      } else {
        side = branch.side;
        sign = childIndex === 0 ? branch.side : -branch.side;
      }
      const childAngle = guideFor(
        side,
        angle + sign * spread + (random() - 0.5) * 0.08,
      );
      children.push({
        x,
        y,
        r: radius * (0.84 + random() * 0.06),
        a: childAngle,
        guide: childAngle + (random() - 0.5) * 0.1,
        side,
        depth: branch.depth + 1,
        id: nextId,
      });
      nextId += 1;
    }
    return children;
  }

  function growBranch(branch) {
    let x = branch.x;
    let y = branch.y;
    let angle = guideFor(branch.side, branch.a);
    const branchSegments = [];
    const steps = Math.max(
      9,
      Math.round((branch.depth === 0 ? 50 : 24 - branch.depth * 2) * (0.9 + random() * 0.16)),
    );
    const splitAt = branch.depth === 0 ? 0.48 : 0.44 + random() * 0.12;
    const splitChance = clamp(0.995 - branch.depth * 0.018, 0.88, 0.995);
    let spawned = false;

    for (let step = 0; step < steps; step += 1) {
      const progress = step / Math.max(1, steps - 1);
      const old = point(x, y);
      const taper = 1 - progress * 0.48;
      const radius = branch.r * taper;
      const guide = guideFor(
        branch.side,
        branch.guide +
          Math.sin((step + branch.id * 1.7) * 0.11) * 0.045,
      );
      angle +=
        (guide - angle) * 0.035 +
        (random() - 0.5) * (0.026 + branch.depth * 0.004);
      angle = guideFor(branch.side, angle);
      x += Math.cos(angle) * stepSize;
      y += Math.sin(angle) * stepSize;

      if (x < 82 || x > 1518 || y < 54 || y > 930) break;

      const current = point(x, y);
      const segment = {
        from: old,
        to: current,
        radius,
        angle,
        depth: branch.depth,
        id: branch.id,
      };
      segments.push(segment);
      branchSegments.push(segment);

      if (
        !spawned &&
        branch.depth < maxDepth &&
        progress >= splitAt &&
        random() <= splitChance
      ) {
        spawned = true;
        const children = spawnChildren(branch, x, y, angle, radius);
        for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
          growBranch(children[childIndex]);
        }
      }
    }

    if (branchSegments.length < 6) return;

    branches.push({ id: branch.id, depth: branch.depth, segments: branchSegments });
  }

  const root = {
    x: 800 + (random() - 0.5) * 64,
    y: 916,
    r: 44,
    a: -HALF_PI + (random() - 0.5) * 0.035,
    guide: -HALF_PI + (random() - 0.5) * 0.035,
    side: 0,
    depth: 0,
    id: 0,
  };
  growBranch(root);

  let trunk = '';
  let middle = '';
  let twig = '';
  let shadows = '';
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const width = clamp(segment.radius * 0.2, 0.72, 8.2);
    const line =
      'M ' +
      fmt(segment.from.x) +
      ' ' +
      fmt(segment.from.y) +
      ' L ' +
      fmt(segment.to.x) +
      ' ' +
      fmt(segment.to.y);
    if (width > 4.8) trunk += line;
    else if (width > 2.15) middle += line;
    else twig += line;

    if (segment.depth < 3) {
      const offsetX = Math.sin(segment.angle) * 1.8;
      const offsetY = -Math.cos(segment.angle) * 1.8;
      shadows +=
        'M ' +
        fmt(segment.from.x + offsetX) +
        ' ' +
        fmt(segment.from.y + offsetY) +
        ' L ' +
        fmt(segment.to.x + offsetX) +
        ' ' +
        fmt(segment.to.y + offsetY);
    }
  }

  const redCandidates = branches.filter(
    (branch) => branch.depth >= 2 && branch.depth <= 5 && branch.segments.length > 12,
  );
  let red = '';
  if (redCandidates.length > 0) {
    const chosen = redCandidates[Math.floor(random() * redCandidates.length)].segments;
    for (let index = Math.max(0, chosen.length - 5); index < chosen.length; index += 1) {
      const segment = chosen[index];
      red +=
        'M ' +
        fmt(segment.from.x) +
        ' ' +
        fmt(segment.from.y) +
        ' L ' +
        fmt(segment.to.x) +
        ' ' +
        fmt(segment.to.y);
    }
  }

  const body =
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="' +
    shadows +
    '" stroke="' +
    PALETTE.clay +
    '" stroke-width="7.8" opacity=".16"/>' +
    '<path d="' +
    trunk +
    '" stroke="' +
    PALETTE.ink +
    '" stroke-width="6.8" opacity=".9"/>' +
    '<path d="' +
    middle +
    '" stroke="' +
    PALETTE.inkSoft +
    '" stroke-width="3.05" opacity=".82"/>' +
    '<path d="' +
    twig +
    '" stroke="' +
    PALETTE.inkSoft +
    '" stroke-width="1.8" opacity=".82"/>' +
    '<path d="' +
    red +
    '" stroke="' +
    PALETTE.red +
    '" stroke-width="2.45" opacity=".88"/>' +
    '</g>';

  return svgDocument(
    'tip-growth-trees',
    'Tip-growth tree study',
    'Tip-only branch growth with shrinking width, increasing angular wobble, and a restrained depth shadow.',
    seed,
    body,
  );
}

function nearbyIndices(points, origin, radius) {
  const result = [];
  const squaredRadius = radius * radius;
  for (let index = 0; index < points.length; index += 1) {
    const dx = points[index].x - origin.x;
    const dy = points[index].y - origin.y;
    if (dx * dx + dy * dy <= squaredRadius) result.push(index);
  }
  return result;
}

function interpolateCatmullRom(points, samplesPerSegment) {
  if (points.length < 3) return points.slice();
  const result = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    for (let sample = 0; sample < samplesPerSegment; sample += 1) {
      const t = sample / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      result.push(
        point(
          0.5 *
            (2 * p1.x +
              (-p0.x + p2.x) * t +
              (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
              (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          0.5 *
            (2 * p1.y +
              (-p0.y + p2.y) * t +
              (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
              (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        ),
      );
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

function limitPointCount(points, maximum) {
  if (points.length <= maximum) return points;
  const result = [];
  const stride = (points.length - 1) / (maximum - 1);
  for (let index = 0; index < maximum; index += 1) {
    result.push(points[Math.round(index * stride)]);
  }
  return result;
}

function tracePreviousPath(points, radius, random) {
  const circles = [];
  let nearLast = [];
  for (let index = 0; index < points.length; index += 1) {
    const nearby = nearbyIndices(points, points[index], radius);
    const priorSet = new Set(nearLast);
    let intersection = 0;
    for (let nearbyIndex = 0; nearbyIndex < nearby.length; nearbyIndex += 1) {
      if (priorSet.has(nearby[nearbyIndex])) intersection += 1;
    }
    if (intersection < 5) {
      nearLast = nearby;
      circles.push({ index, nearby });
    }
  }
  if (
    circles.length === 0 ||
    circles[circles.length - 1].index < points.length - 1
  ) {
    circles.push({
      index: points.length - 1,
      nearby: nearbyIndices(points, points[points.length - 1], radius),
    });
  }

  const traced = [];
  for (let index = 0; index < circles.length; index += 1) {
    const circle = circles[index];
    const nearby = circle.nearby.length > 0 ? circle.nearby : [circle.index];
    const first = points[nearby[0]];
    const last = points[nearby[nearby.length - 1]];
    const direction =
      Math.atan2(last.y - first.y, last.x - first.x) -
      HALF_PI;
    const jitterAngle = (random() * 2 - 1) * Math.PI;
    const jitter = radius * 0.13;
    const anchor = points[circle.index];
    traced.push(
      point(
        anchor.x +
          Math.cos(direction) * radius +
          Math.cos(jitterAngle) * jitter,
        anchor.y +
          Math.sin(direction) * radius +
          Math.sin(jitterAngle) * jitter,
      ),
    );
  }
  return traced;
}

function generateLinetrace(seed) {
  const random = rngFrom(String(seed) + ':linetrace');
  const initial = [];
  const pointCount = 230;
  const startX = 170;
  const startY = 120;
  const stopY = 880;
  for (let index = 0; index < pointCount; index += 1) {
    initial.push(
      point(
        startX + (random() - 0.5) * 0.7,
        startY + (index / (pointCount - 1)) * (stopY - startY),
      ),
    );
  }

  let current = initial;
  const linesInk = [];
  const linesClay = [];
  let finalLine = '';
  const maxIterations = 100;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const radius = 5 + Math.sqrt(iteration + 1) * 1.15;
    const traced = tracePreviousPath(current, radius, random);
    if (traced.length < 4) break;
    const interpolated = interpolateCatmullRom(
      traced,
      clamp(Math.round(radius / 4), 3, 8),
    );
    const next = limitPointCount(interpolated, 300);
    const visible = next.filter(
      (item) =>
        item.x >= 50 &&
        item.x <= 1550 &&
        item.y >= 40 &&
        item.y <= 960,
    );
    if (visible.length < 4) break;
    current = visible;
    const clean = simplify(visible, 1.4);
    const line = pointPath(clean, false);
    if (iteration === maxIterations - 1 || current[current.length - 1].x > 1460) {
      finalLine = line;
      break;
    }
    if (iteration % 4 === 0) linesClay.push(line);
    else linesInk.push(line);
    if (current[current.length - 1].x > 1500) break;
  }

  const body =
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<g stroke="' +
    PALETTE.clay +
    '" stroke-width=".92" opacity=".42">' +
    linesClay.map((line) => '<path d="' + line + '"/>').join('') +
    '</g>' +
    '<g stroke="' +
    PALETTE.ink +
    '" stroke-width="1.22" opacity=".72">' +
    linesInk.map((line) => '<path d="' + line + '"/>').join('') +
    '</g>' +
    '<path d="' +
    finalLine +
    '" stroke="' +
    PALETTE.red +
    '" stroke-width="1.75" opacity=".88"/>' +
    '</g>';

  return svgDocument(
    'linetrace-spline',
    'Linetrace spline study',
    'Successive paths trace nearby edges of the preceding path, turn by a normal step, and inherit restrained freehand jitter.',
    seed,
    body,
  );
}

export const growthStudies = Object.freeze([
  {
    slug: 'hyphae-growth',
    title: 'Hyphae growth study',
    description: 'Non-overlapping connected circles with shrinking radii, wobble, and perpendicular side branches.',
    source:
      'https://inconvergent.net/generative/hyphae/; https://github.com/inconvergent/hyphae',
    generate: generateHyphae,
  },
  {
    slug: 'tip-growth-trees',
    title: 'Tip-growth tree study',
    description: 'A tip-only branch queue whose widths shrink while angular wobble grows with age.',
    source:
      'https://inconvergent.net/generative/trees/; https://github.com/inconvergent/tree',
    generate: generateTrees,
  },
  {
    slug: 'linetrace-spline',
    title: 'Linetrace spline study',
    description: 'Iterated edge tracing with a normal offset and controlled freehand perturbation.',
    source:
      'https://inconvergent.net/generative/linetrace/; https://github.com/inconvergent/tracepath3; https://github.com/inconvergent/tracepath-spline',
    generate: generateLinetrace,
  },
]);

export {
  generateHyphae,
  generateTrees,
  generateLinetrace,
};
