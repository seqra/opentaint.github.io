/**
 * Original SVG studies based on the material-oriented algorithms described by
 * Anders Hoff in "On Generative Algorithms".  The implementations below use
 * the mechanics as a starting point, but all seeds, compositions, parameters,
 * and palette decisions are original to OpenTaint.
 *
 * The four studies are intentionally self-contained and deterministic.  They
 * do not use image textures, paper grain, or runtime dependencies.
 */

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const VERSION = '1.0.0';

const PALETTE = Object.freeze({
  paper: '#f6f0e7',
  ink: '#191719',
  clay: '#a65442',
  red: '#ca2121',
});

const SOURCES = Object.freeze({
  fractures: 'https://inconvergent.net/generative/fractures/',
  sandSpline: 'https://inconvergent.net/generative/sand-spline/',
  sandCreatures: 'https://inconvergent.net/generative/sand-creatures/',
  sandGlyphs: 'https://inconvergent.net/generative/sand-glyphs/',
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
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" ${extra}/>`;
}

function pathFrom(points) {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point[0])} ${f(point[1])}`).join(' ');
}

function path(points, stroke, width = 1, opacity = 1, extra = '') {
  if (points.length < 2) return '';
  return `<path d="${pathFrom(points)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function polyline(points, stroke, width = 1, opacity = 1) {
  if (points.length < 2) return '';
  return `<path d="${pathFrom(points)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="square" stroke-linejoin="miter"/>`;
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

function documentSvg({ slug, title, description, source, seed, body }) {
  const id = `material-${hashSeed(slug).toString(16)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="title-${id} desc-${id}" data-generator="inconvergent-material-study" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${escapeXml(slug)}" data-source="${escapeXml(source)}">
  <title id="title-${id}">${escapeXml(title)}</title>
  <desc id="desc-${id}">${escapeXml(description)}</desc>
  ${background()}
  ${body}
</svg>
`;
}

function normalize(x, y) {
  const length = Math.hypot(x, y);
  if (length < 1e-9) return [1, 0];
  return [x / length, y / length];
}

function distanceSquared(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function randomDisk(random, cx, cy, rx, ry) {
  const angle = random() * TAU;
  const radius = Math.sqrt(random());
  return [
    cx + Math.cos(angle) * radius * rx,
    cy + Math.sin(angle) * radius * ry,
  ];
}

function shuffled(points, random) {
  const result = points.map((point) => point.slice());
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function spatiallyOrdered(points) {
  if (points.length < 2) return points.map((point) => point.slice());
  const remaining = points.map((point, index) => ({ point: point.slice(), index }));
  const ordered = [];
  let current = remaining.reduce((best, candidate) => (
    candidate.point[0] < best.point[0] ? candidate : best
  ));
  remaining.splice(remaining.indexOf(current), 1);
  ordered.push(current.point);

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = distanceSquared(ordered[ordered.length - 1], remaining[0].point);
    for (let index = 1; index < remaining.length; index += 1) {
      const distance = distanceSquared(ordered[ordered.length - 1], remaining[index].point);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    }
    ordered.push(remaining[nearestIndex].point);
    remaining.splice(nearestIndex, 1);
  }
  return ordered;
}

/** A compact cubic interpolator used as a deterministic B-spline analogue. */
function splinePoints(control, sampleCount, closed = false) {
  if (control.length < 2) return control.map((point) => point.slice());
  const samples = Math.max(2, sampleCount);
  const segmentCount = closed ? control.length : control.length - 1;
  const pointAt = (index) => {
    if (closed) return control[(index + control.length) % control.length];
    return control[clamp(index, 0, control.length - 1)];
  };
  const result = [];

  for (let sample = 0; sample < samples; sample += 1) {
    const position = (sample / (samples - 1)) * segmentCount;
    const segment = Math.min(segmentCount - 1, Math.floor(position));
    const t = position - segment;
    const t2 = t * t;
    const t3 = t2 * t;
    const p0 = pointAt(segment - 1);
    const p1 = pointAt(segment);
    const p2 = pointAt(segment + 1);
    const p3 = pointAt(segment + 2);
    result.push([
      0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t
        + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
        + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t
        + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
        + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
    ]);
  }
  return result;
}

function bsplinePoints(control, sampleCount, closed = true) {
  if (control.length < 4) return splinePoints(control, sampleCount, closed);
  const samples = Math.max(2, sampleCount);
  const segmentCount = closed ? control.length : control.length - 3;
  const pointAt = (index) => {
    if (closed) return control[(index + control.length) % control.length];
    return control[clamp(index, 0, control.length - 1)];
  };
  const result = [];

  for (let sample = 0; sample < samples; sample += 1) {
    const position = (sample / (samples - 1)) * segmentCount;
    const segment = Math.min(segmentCount - 1, Math.floor(position));
    const t = position - segment;
    const t2 = t * t;
    const t3 = t2 * t;
    const b0 = (1 - 3 * t + 3 * t2 - t3) / 6;
    const b1 = (4 - 6 * t2 + 3 * t3) / 6;
    const b2 = (1 + 3 * t + 3 * t2 - 3 * t3) / 6;
    const b3 = t3 / 6;
    const p0 = pointAt(segment - 1);
    const p1 = pointAt(segment);
    const p2 = pointAt(segment + 1);
    const p3 = pointAt(segment + 2);
    result.push([
      p0[0] * b0 + p1[0] * b1 + p2[0] * b2 + p3[0] * b3,
      p0[1] * b0 + p1[1] * b1 + p2[1] * b2 + p3[1] * b3,
    ]);
  }
  return result;
}

function appendOffset(points, random, amount) {
  return points.map((point) => {
    const angle = random() * TAU;
    const radius = (random() - 0.5) * amount;
    return [
      point[0] + Math.cos(angle) * radius,
      point[1] + Math.sin(angle) * radius,
    ];
  });
}

function fractureField(seed) {
  const random = rng(seed);
  const sources = [];
  const sourceCount = 2600;
  const occupied = new Map();
  const states = [];
  const records = [];
  const cellSize = 20;
  const keyFor = (x, y) => `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;

  for (let index = 0; index < sourceCount; index += 1) {
    sources.push([70 + random() * 1460, 70 + random() * 860]);
  }

  function addOccupied(point, pathId) {
    const key = keyFor(point[0], point[1]);
    const bucket = occupied.get(key) || [];
    bucket.push({ point, pathId });
    occupied.set(key, bucket);
  }

  function collides(point, pathId, radius, parentId = -1) {
    const gx = Math.floor(point[0] / cellSize);
    const gy = Math.floor(point[1] / cellSize);
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const bucket = occupied.get(`${gx + offsetX}:${gy + offsetY}`) || [];
        for (const entry of bucket) {
          if (entry.pathId !== pathId && entry.pathId !== parentId && distanceSquared(point, entry.point) < radius ** 2) return true;
        }
      }
    }
    return false;
  }

  function spawn(position, direction, speed, depth, parentId = -1, stepScale = 1) {
    const pathId = records.length;
    const points = [position.slice()];
    const record = { id: pathId, points, depth, parentId };
    records.push(record);
    addOccupied(points[0], pathId);
    states.push({
      position: position.slice(),
      direction,
      speed,
      pathId,
      points,
      depth,
      age: 0,
      alive: true,
      branchCount: 0,
      maxAge: depth === 0 ? 235 : depth === 1 ? 64 : 40,
      stepScale,
      nextBranchAge: depth === 0
        ? 13 + Math.floor(random() * 18)
        : depth === 1 ? 8 + Math.floor(random() * 15) : Infinity,
    });
  }

  // Unlike a radial impact study, these primary cracks enter from offset
  // sites. This removes a shared hub while preserving a clear hierarchy as
  // each active front emits shorter perpendicular descendants.
  const seeds = [
    [[48, 118], [1, 0.24]],
    [[48, 382], [1, 0.11]],
    [[48, 758], [1, -0.18]],
    [[1552, 176], [-1, 0.38]],
    [[1552, 526], [-1, 0.02]],
    [[1552, 846], [-1, -0.24]],
    [[276, 952], [0.24, -1]],
    [[846, 952], [-0.06, -1]],
    [[1284, 952], [-0.34, -1]],
    [[604, 48], [0.16, 1]],
  ];
  for (const [position, direction] of seeds) {
    spawn(
      position,
      normalize(direction[0] + (random() - 0.5) * 0.16, direction[1] + (random() - 0.5) * 0.16),
      0.88 + random() * 0.18,
      0,
      -1,
      0.84 + random() * 0.34,
    );
  }

  const usedSources = new Set();
  const maxSteps = 760;
  for (let step = 0; step < maxSteps; step += 1) {
    const active = states.filter((state) => state.alive);
    if (active.length === 0) break;

    for (const state of active) {
      if (state.age >= state.maxAge) {
        state.alive = false;
        continue;
      }
      const fov = state.depth === 0 ? 148 + state.speed * 22 : state.depth === 1 ? 124 + state.speed * 18 : 96 + state.speed * 14;
      const fovSquared = fov * fov;
      const minimumFacing = state.depth === 0 ? 0.2 : state.depth === 1 ? 0.02 : -0.08;
      const directionWeight = state.depth === 0 ? 4.2 : state.depth === 1 ? 2.8 : 2.1;
      let sumX = state.direction[0] * directionWeight;
      let sumY = state.direction[1] * directionWeight;
      let candidates = 0;

      for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
        const source = sources[sourceIndex];
        const dx = source[0] - state.position[0];
        const dy = source[1] - state.position[1];
        const distance = Math.hypot(dx, dy);
        if (distance < 1 || distance * distance > fovSquared) continue;
        const direction = [dx / distance, dy / distance];
        const facing = direction[0] * state.direction[0] + direction[1] * state.direction[1];
        if (facing < minimumFacing) continue;
        const weight = (0.28 + facing * 0.38) * (1 - distance / fov);
        sumX += direction[0] * weight;
        sumY += direction[1] * weight;
        candidates += 1;
      }

      const fieldDirection = normalize(sumX, sumY);
      const wander = (random() - 0.5) * (state.depth === 0 ? 0.18 : state.depth === 1 ? 0.3 : 0.4);
      const nextDirection = normalize(
        fieldDirection[0] * Math.cos(wander) - fieldDirection[1] * Math.sin(wander),
        fieldDirection[0] * Math.sin(wander) + fieldDirection[1] * Math.cos(wander),
      );
      const depthStep = state.depth === 0 ? 8.2 : state.depth === 1 ? 5.4 : 3.9;
      const stepSize = depthStep * state.stepScale * (0.86 + random() * 0.28);
      const nextPosition = [
        state.position[0] + nextDirection[0] * stepSize,
        state.position[1] + nextDirection[1] * stepSize,
      ];
      const inside = nextPosition[0] > 35 && nextPosition[0] < WIDTH - 35
        && nextPosition[1] > 35 && nextPosition[1] < HEIGHT - 35;
      const collisionRadius = state.depth === 0 ? 9 : state.depth === 1 ? 7.5 : 5.8;
      const collisionAge = state.depth === 0 ? 8 : 4;
      if (!inside || (state.age > collisionAge && collides(nextPosition, state.pathId, collisionRadius))) {
        state.alive = false;
        continue;
      }

      state.position = nextPosition;
      const persistence = state.depth === 0 ? 0.76 : state.depth === 1 ? 0.67 : 0.58;
      state.direction = normalize(
        state.direction[0] * persistence + nextDirection[0] * (1 - persistence),
        state.direction[1] * persistence + nextDirection[1] * (1 - persistence),
      );
      state.speed *= state.depth === 0 ? 0.9975 : 0.994;
      state.age += 1;
      state.points.push(nextPosition);
      addOccupied(nextPosition, state.pathId);

      let closest = -1;
      let closestDistance = 13;
      for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
        if (usedSources.has(sourceIndex)) continue;
        const distance = Math.sqrt(distanceSquared(nextPosition, sources[sourceIndex]));
        if (distance < closestDistance) {
          closest = sourceIndex;
          closestDistance = distance;
        }
      }
      if (closest >= 0) usedSources.add(closest);
    }

    // The inherited speed controls when a front is likely to split. The age
    // schedule keeps primary branches legible while still leaving a seeded
    // chance for secondary and tertiary cracks to appear.
    if (states.length < 240) {
      for (const state of active) {
        const branchLimit = state.depth === 0 ? 7 : state.depth === 1 ? 4 : 0;
        if (!state.alive || state.depth >= 2 || state.branchCount >= branchLimit || state.age < state.nextBranchAge) continue;
        const spawnChance = state.depth === 0 ? 0.98 : 0.92;
        if (random() > spawnChance) {
          state.nextBranchAge += 5 + Math.floor(random() * 10);
          continue;
        }
        const sign = random() < 0.5 ? -1 : 1;
        const branchAngle = sign * (0.92 + random() * 0.36);
        const childDirection = normalize(
          state.direction[0] * Math.cos(branchAngle) - state.direction[1] * Math.sin(branchAngle),
          state.direction[0] * Math.sin(branchAngle) + state.direction[1] * Math.cos(branchAngle),
        );
        spawn(
          state.position,
          childDirection,
          state.speed * (state.depth === 0 ? 0.7 : 0.58),
          state.depth + 1,
          state.pathId,
          state.stepScale * (0.68 + random() * 0.5),
        );
        state.branchCount += 1;
        state.nextBranchAge = state.age + (state.depth === 0 ? 15 : 11) + Math.floor(random() * (state.depth === 0 ? 15 : 12));
        if (states.length >= 240) break;
      }
    }
  }

  const viablePaths = records
    .filter((record) => record.points.length > 3)
    .sort((a, b) => a.depth - b.depth || b.points.length - a.points.length);
  const body = [];
  for (const entry of viablePaths) {
    const strokeWidth = entry.depth === 0 ? 2.08 : entry.depth === 1 ? 1.28 : 0.82;
    const opacity = entry.depth === 0 ? 0.74 : entry.depth === 1 ? 0.6 : 0.43;
    body.push(polyline(
      entry.points,
      PALETTE.ink,
      strokeWidth,
      opacity,
    ));
  }

  const accentCandidates = viablePaths.filter((entry) => entry.depth === 1);
  if (accentCandidates.length > 0) {
    const accentPath = accentCandidates[Math.floor(random() * accentCandidates.length)].points;
    const segment = Math.max(1, Math.floor(accentPath.length * 0.42));
    const end = Math.min(accentPath.length - 1, segment + 6);
    for (let index = segment; index <= end; index += 1) {
      body.push(line(
        accentPath[index - 1][0],
        accentPath[index - 1][1],
        accentPath[index][0],
        accentPath[index][1],
        PALETTE.red,
        3.4,
        0.96,
      ));
    }
  }

  return documentSvg({
    slug: 'seeded-fracture-field',
    title: 'Seeded fracture field',
    description: 'A seeded impact front follows local source mass, terminates at collisions, and passes diminishing speed into a hierarchy of perpendicular cracks.',
    source: SOURCES.fractures,
    seed,
    body: body.join(''),
  });
}

function accumulatingSpline(seed) {
  const random = rng(seed);
  const body = [];
  const splineCount = 9;
  const passes = 42;

  for (let splineIndex = 0; splineIndex < splineCount; splineIndex += 1) {
    const controlCount = 21 + Math.floor(random() * 7);
    const phase = random() * TAU;
    const center = [
      800 + Math.cos(phase) * (70 + random() * 145),
      500 + Math.sin(phase) * (55 + random() * 105),
    ];
    const radiusX = 165 + random() * 185;
    const radiusY = 108 + random() * 150;
    const control = [];
    for (let index = 0; index < controlCount; index += 1) {
      const angle = phase + (index / controlCount) * TAU;
      const wave = 1
        + Math.sin(angle * 2 + phase) * 0.11
        + Math.cos(angle * 3 - phase) * 0.07
        + (random() - 0.5) * 0.045;
      control.push([
        center[0] + Math.cos(angle) * radiusX * wave,
        center[1] + Math.sin(angle) * radiusY * wave,
      ]);
    }

    const drift = control.map(() => [0, 0]);
    const motion = control.map(() => ({
      phase: random() * TAU,
      rate: 0.72 + random() * 0.56,
      amplitudeX: 8 + random() * 18,
      amplitudeY: 8 + random() * 18,
    }));
    for (let pass = 0; pass < passes; pass += 1) {
      const impulses = control.map(() => {
        const angle = random() * TAU;
        return [Math.cos(angle), Math.sin(angle)];
      });
      for (let index = 0; index < controlCount; index += 1) {
        const previous = impulses[(index - 1 + controlCount) % controlCount];
        const current = impulses[index];
        const next = impulses[(index + 1) % controlCount];
        const outward = 0.35 + (index / (controlCount - 1)) * 1.85;
        const smoothX = (previous[0] + current[0] * 2 + next[0]) * 0.25;
        const smoothY = (previous[1] + current[1] * 2 + next[1]) * 0.25;
        drift[index][0] += smoothX * outward;
        drift[index][1] += smoothY * outward;
      }

      const time = pass / (passes - 1);
      const current = control.map((point, index) => [
        point[0] + drift[index][0]
          + Math.sin(time * TAU * motion[index].rate + motion[index].phase) * motion[index].amplitudeX * time,
        point[1] + drift[index][1]
          + Math.cos(time * TAU * motion[index].rate * 0.86 + motion[index].phase) * motion[index].amplitudeY * time,
      ]);
      const curve = bsplinePoints(current, 230, true);
      const isRedMoment = splineIndex === 4 && pass === 29;
      const isClay = splineIndex === 2 || splineIndex === 8;
      const layerOpacity = 0.025 + time * 0.015;
      body.push(path(
        curve,
        isRedMoment ? PALETTE.red : isClay ? PALETTE.clay : PALETTE.ink,
        isRedMoment ? 2.2 : 0.94,
        isRedMoment ? 0.86 : isClay ? layerOpacity * 1.35 : layerOpacity,
      ));
    }
  }

  return documentSvg({
    slug: 'accumulating-spline-drift',
    title: 'Accumulating spline drift',
    description: 'Closed control-point splines accumulate seeded radial drift, with equal sample counts preserving the density logic of a sand-painted trace.',
    source: SOURCES.sandSpline,
    seed,
    body: body.join(''),
  });
}

function creatureControlPoints(random, centerX, centerY, radiusX, radiusY, count) {
  const points = [];
  for (let index = 0; index < count; index += 1) {
    points.push(randomDisk(random, centerX, centerY, radiusX, radiusY));
  }
  return shuffled(points, random);
}

function offsetConnectorStudy(seed) {
  const random = rng(seed);
  const body = [];
  const layouts = [
    [300, 270, 180, 106],
    [790, 245, 218, 122],
    [1260, 275, 170, 112],
    [440, 690, 218, 116],
    [970, 700, 250, 124],
    [1370, 700, 125, 94],
  ];

  layouts.forEach(([centerX, centerY, radiusX, radiusY], creatureIndex) => {
    const controlCount = 8 + Math.floor(random() * 6);
    const control = creatureControlPoints(random, centerX, centerY, radiusX, radiusY, controlCount);
    const offset = appendOffset(control, random, 26 + random() * 22);
    const baseCurve = splinePoints(control, 106, false);
    const offsetCurve = splinePoints(offset, 106, false);
    const tone = creatureIndex === 1 || creatureIndex === 4 ? PALETTE.clay : PALETTE.ink;

    body.push(path(baseCurve, tone, 1.25, 0.34));
    body.push(path(offsetCurve, tone, 1, 0.28));

    const connectorCount = 23;
    for (let connector = 0; connector < connectorCount; connector += 1) {
      const sample = Math.round((connector / (connectorCount - 1)) * (baseCurve.length - 1));
      const accent = creatureIndex === 3 && connector === 13;
      const secondary = creatureIndex === 1 && connector % 7 === 2;
      body.push(line(
        baseCurve[sample][0],
        baseCurve[sample][1],
        offsetCurve[sample][0],
        offsetCurve[sample][1],
        accent ? PALETTE.red : secondary ? PALETTE.clay : PALETTE.ink,
        accent ? 3.1 : 1.35,
        accent ? 0.96 : secondary ? 0.84 : 0.68,
      ));
    }
  });

  return documentSvg({
    slug: 'offset-spline-creatures',
    title: 'Offset spline creatures',
    description: 'Arbitrarily ordered control points form smooth bodies; a cloned, displaced spline is joined to the first by straight, equally spaced connectors.',
    source: SOURCES.sandCreatures,
    seed,
    body: body.join(''),
  });
}

function cursiveRibbon(points, random, stroke, opacity, width, redConnector = -1) {
  const centerline = splinePoints(points, Math.max(86, points.length * 9), false);
  const firstRail = [];
  const secondRail = [];
  let drift = 0;
  for (let index = 0; index < centerline.length; index += 1) {
    const previous = centerline[Math.max(0, index - 1)];
    const next = centerline[Math.min(centerline.length - 1, index + 1)];
    const tangent = normalize(next[0] - previous[0], next[1] - previous[1]);
    const normal = [-tangent[1], tangent[0]];
    drift += (random() - 0.5) * 0.035;
    const offset = 4.5 + Math.sin(index * 0.23 + drift) * 1.7;
    firstRail.push([centerline[index][0] + normal[0] * offset, centerline[index][1] + normal[1] * offset]);
    secondRail.push([centerline[index][0] - normal[0] * offset, centerline[index][1] - normal[1] * offset]);
  }

  const body = [
    path(firstRail, stroke, width, opacity * 0.74),
    path(secondRail, stroke, width, opacity * 0.74),
  ];
  for (let index = 4; index < centerline.length - 2; index += 7) {
    const connector = Math.floor(index / 7);
    const accent = connector === redConnector;
    body.push(line(
      firstRail[index][0],
      firstRail[index][1],
      secondRail[index][0],
      secondRail[index][1],
      accent ? PALETTE.red : stroke,
      accent ? 2.8 : width * 0.9,
      accent ? 0.96 : opacity,
    ));
  }
  return body.join('');
}

function asemicSplineScript(seed) {
  const random = rng(seed);
  const body = [];
  const rowY = [230, 500, 770];
  let redConnectorUsed = false;

  rowY.forEach((baseline, row) => {
    let cursor = 125;
    let wordIndex = 0;
    while (cursor < 1450) {
      const glyphCount = 2 + Math.floor(random() * 3);
      const word = [];
      for (let glyph = 0; glyph < glyphCount; glyph += 1) {
        const glyphWidth = 48 + random() * 27;
        const glyphHeight = 78 + random() * 28;
        const glyphCenterY = baseline + (random() - 0.5) * 34;
        const glyphPoints = creatureControlPoints(
          random,
          cursor + glyphWidth * 0.5,
          glyphCenterY,
          glyphWidth * 0.48,
          glyphHeight * 0.5,
          5 + Math.floor(random() * 4),
        );
        let orderedGlyph = spatiallyOrdered(glyphPoints);
        if (random() < 0.2) {
          const shift = (random() < 0.5 ? -1 : 1) * glyphHeight * 0.18;
          orderedGlyph = orderedGlyph.map((point) => [point[0], point[1] + shift]);
        }
        if (random() < 0.5) {
          orderedGlyph.push(orderedGlyph[Math.floor(random() * orderedGlyph.length)].slice());
        }
        word.push(...orderedGlyph);
        cursor += glyphWidth + 10 + random() * 13;
      }

      const isClay = (row + wordIndex) % 5 === 2;
      const allowRed = !redConnectorUsed && row === 1 && wordIndex === 2;
      const redConnector = allowRed ? 9 : -1;
      if (allowRed) redConnectorUsed = true;
      body.push(cursiveRibbon(
        word,
        random,
        isClay ? PALETTE.clay : PALETTE.ink,
        isClay ? 0.52 : 0.48,
        isClay ? 1.22 : 1.12,
        redConnector,
      ));

      cursor += 48 + random() * 38;
      wordIndex += 1;
    }
  });

  return documentSvg({
    slug: 'asemic-spline-script',
    title: 'Asemic spline script',
    description: 'Randomly ordered spline glyphs concatenate into wrapped words, then a seeded cursive offset turns each word into a paired rail with measured cross-strokes.',
    source: SOURCES.sandGlyphs,
    seed,
    body: body.join(''),
  });
}

export const materialStudies = [
  {
    slug: 'seeded-fracture-field',
    title: 'Seeded fracture field',
    description: 'Fractures study: distributed sources pull seeded paths toward their local mass, while collision and inherited speed govern branching.',
    source: SOURCES.fractures,
    generate: fractureField,
  },
  {
    slug: 'accumulating-spline-drift',
    title: 'Accumulating spline drift',
    description: 'Sand Spline study: equal-sampled closed splines accumulate outward-weighted radial drift into a layered trace.',
    source: SOURCES.sandSpline,
    generate: accumulatingSpline,
  },
  {
    slug: 'offset-spline-creatures',
    title: 'Offset spline creatures',
    description: 'Sand Creatures study: arbitrary control-point order and a displaced clone become bodies made from straight connectors.',
    source: SOURCES.sandCreatures,
    generate: offsetConnectorStudy,
  },
  {
    slug: 'asemic-spline-script',
    title: 'Asemic spline script',
    description: 'Sand Glyphs study: generated glyph groups concatenate into wrapped words and receive a controlled cursive offset.',
    source: SOURCES.sandGlyphs,
    generate: asemicSplineScript,
  },
];
