// Standalone, deterministic SVG studies for the editorial generative-art system.
//
// These are intentionally abstract. Each study starts with a field or a set of
// local rules, then lets repeated interactions build the image. The shared paper,
// ink, clay, sand, and restrained-red palette keeps the set related while the
// simulation and mark-making grammar changes from study to study.

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const ART_VERSION = 'contemporary-1.0.0';

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

function smoothstep(value) {
  const amount = clamp(value, 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function length(x, y) {
  return Math.hypot(x, y);
}

function distance(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function normalize(x, y) {
  const magnitude = Math.hypot(x, y) || 1;
  return [x / magnitude, y / magnitude];
}

function rotate(vector, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [vector[0] * cosine - vector[1] * sine, vector[0] * sine + vector[1] * cosine];
}

function pathD(points, close = false) {
  if (!points.length) return '';
  return `${points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point[0])} ${f(point[1])}`).join(' ')}${close ? ' Z' : ''}`;
}

function line(x1, y1, x2, y2, stroke, width = 1, opacity = 1, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" ${extra}/>`;
}

function circle(cx, cy, radius, fill, opacity = 1, stroke = 'none', strokeWidth = 0, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radius)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(strokeWidth)}" ${extra}/>`;
}

function ellipse(cx, cy, rx, ry, fill, opacity = 1, stroke = 'none', strokeWidth = 0, extra = '') {
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(strokeWidth)}" ${extra}/>`;
}

function polyline(points, stroke, width = 1, opacity = 1, extra = '') {
  return `<path d="${pathD(points)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round" opacity="${f(opacity)}" ${extra}/>`;
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

function noiseHash(x, y, seed) {
  let value = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(x - x0);
  const ty = smoothstep(y - y0);
  const top = lerp(noiseHash(x0, y0, seed), noiseHash(x0 + 1, y0, seed), tx);
  const bottom = lerp(noiseHash(x0, y0 + 1, seed), noiseHash(x0 + 1, y0 + 1, seed), tx);
  return lerp(top, bottom, ty) * 2 - 1;
}

function fbm(x, y, seed, octaves = 4) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let normalizer = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + octave * 1013) * amplitude;
    normalizer += amplitude;
    amplitude *= 0.5;
    frequency *= 2.02;
  }
  return value / normalizer;
}

function fieldVector(x, y, seed, variant = 0) {
  const scale = variant ? 0.0031 : 0.0037;
  const epsilon = 0.08;
  const dx = (fbm((x + epsilon) * scale, y * scale, seed, 3) - fbm((x - epsilon) * scale, y * scale, seed, 3)) / (2 * epsilon);
  const dy = (fbm(x * scale, (y + epsilon) * scale, seed, 3) - fbm(x * scale, (y - epsilon) * scale, seed, 3)) / (2 * epsilon);
  const centerX = 760 + fbm(0.17, 0.31, seed + 41, 2) * 210;
  const centerY = 480 + fbm(0.41, 0.13, seed + 73, 2) * 170;
  const radial = normalize(x - centerX, y - centerY);
  const tangent = [-radial[1], radial[0]];
  const drift = [
    0.24 + fbm(y * 0.0022, x * 0.0016, seed + 109, 2) * 0.18,
    fbm(x * 0.0025, y * 0.0025, seed + 157, 2) * 0.26,
  ];
  return normalize(
    dy * 2.1 + tangent[0] * (0.6 + variant * 0.1) + drift[0],
    -dx * 2.1 + tangent[1] * (0.6 + variant * 0.1) + drift[1],
  );
}

function collisionFieldVector(x, y, seed) {
  const base = fieldVector(x, y, seed, 1);
  const basin = normalize(1120 - x, 520 - y);
  const drift = [0.62, Math.sin(x * 0.004 + y * 0.002) * 0.16];
  return normalize(base[0] * 0.72 + basin[0] * 0.63 + drift[0], base[1] * 0.72 + basin[1] * 0.63 + drift[1]);
}

function gardenFieldVector(x, y, seed, phase = 0) {
  const base = fieldVector(x, y, seed, 1);
  const upward = [
    fbm(x * 0.002, y * 0.002, seed + 211, 2) * 0.24 + Math.sin(y * 0.004 + phase) * 0.19,
    -0.72 + fbm(y * 0.0017, x * 0.0023, seed + 233, 2) * 0.18,
  ];
  const crown = normalize(780 - x, 270 - y);
  return normalize(base[0] * 0.68 + upward[0] * 0.95 + crown[0] * 0.15, base[1] * 0.68 + upward[1] * 0.95 + crown[1] * 0.15);
}

function background() {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.paper}"/>`;
}

function svg(name, description, seed, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" data-generator="algorithmic" data-generator-version="${ART_VERSION}" data-seed="${seed >>> 0}" data-artwork="${name}">
  <title>${escapeText(name.replaceAll('-', ' '))}</title>
  <desc>${escapeText(description)}</desc>
  ${background()}
  ${body}
</svg>
`;
}

function occupancyDensity(occupancy, x, y, columns, rows, radius = 1) {
  const gx = Math.floor((x / WIDTH) * columns);
  const gy = Math.floor((y / HEIGHT) * rows);
  let value = 0;
  for (let oy = -radius; oy <= radius; oy += 1) {
    for (let ox = -radius; ox <= radius; ox += 1) {
      const nx = gx + ox;
      const ny = gy + oy;
      if (nx >= 0 && nx < columns && ny >= 0 && ny < rows) value += occupancy[ny * columns + nx];
    }
  }
  return value;
}

function markOccupancy(occupancy, x, y, columns, rows) {
  const gx = Math.floor((x / WIDTH) * columns);
  const gy = Math.floor((y / HEIGHT) * rows);
  if (gx >= 0 && gx < columns && gy >= 0 && gy < rows) occupancy[gy * columns + gx] += 1;
}

function collisionFlow(seed = 0x2c0ffee) {
  const random = rng(deriveSeed(seed, 'streams'));
  const columns = 80;
  const rows = 50;
  const occupancy = new Float32Array(columns * rows);
  const traces = [];

  for (let index = 0; index < 86; index += 1) {
    const entry = index < 64
      ? [-35 + random() * 110, 90 + random() * 820]
      : [180 + random() * 1140, index % 2 ? -38 : HEIGHT + 38];
    let x = entry[0];
    let y = entry[1];
    let previousVector = [1, 0];
    let impact = 0;
    const points = [[x, y]];

    for (let step = 0; step < 90; step += 1) {
      const base = collisionFieldVector(x, y, deriveSeed(seed, 'flow-field'));
      const options = [base, rotate(base, 0.33), rotate(base, -0.33), rotate(base, 0.67), rotate(base, -0.67)];
      let best = options[0];
      let bestScore = Infinity;
      for (const option of options) {
        const nextX = x + option[0] * 13.5;
        const nextY = y + option[1] * 13.5;
        const density = occupancyDensity(occupancy, nextX, nextY, columns, rows, 1);
        const alignment = 1 - (previousVector[0] * option[0] + previousVector[1] * option[1]);
        const borderPenalty = nextX < -70 || nextX > WIDTH + 70 || nextY < -70 || nextY > HEIGHT + 70 ? 7 : 0;
        const score = density * 1.85 + alignment * 1.6 + borderPenalty;
        if (score < bestScore) {
          best = option;
          bestScore = score;
        }
      }
      if (bestScore > 7.5) impact += 1;
      x += best[0] * 13.5;
      y += best[1] * 13.5;
      previousVector = best;
      points.push([x, y]);
      markOccupancy(occupancy, x, y, columns, rows);
      if ((x < -100 || x > WIDTH + 100 || y < -100 || y > HEIGHT + 100) || (step > 47 && bestScore > 10 && random() < 0.2)) break;
    }
    if (points.length > 16) traces.push({ points, impact, index, length: points.length });
  }

  const parts = ['<g fill="none" stroke-linecap="round" stroke-linejoin="round">'];
  const major = traces.filter((trace) => trace.length > 62).filter((_, index) => index % 6 === 0);
  for (const trace of major) {
    const tone = trace.index % 3 === 0 ? COLOR.clay : COLOR.ink;
    parts.push(polyline(trace.points, tone, 8 + (trace.index % 3) * 1.4, 0.045));
  }
  for (const trace of traces) {
    const tone = trace.index % 4 === 0 ? COLOR.clay : COLOR.ink;
    const hot = trace.impact > 3 && trace.index % 19 === 1;
    parts.push(polyline(trace.points, hot ? COLOR.redDark : tone, hot ? 2.8 : 1 + (trace.index % 3) * 0.22, hot ? 0.53 : 0.18 + (trace.index % 3) * 0.035));
    if (hot) {
      const start = Math.floor(trace.points.length * 0.52);
      const event = trace.points.slice(start, Math.min(trace.points.length, start + 15));
      parts.push(polyline(event, COLOR.red, 3.4, 0.76));
      const point = event[Math.floor(event.length / 2)];
      parts.push(circle(point[0], point[1], 3.5, COLOR.red, 0.82, COLOR.paper, 1.2));
    }
  }
  parts.push('</g>');

  // A quiet paper aperture makes the density field legible without turning it
  // into a literal target or icon.
  parts.push(ellipse(1175, 185, 290, 118, COLOR.paper, 0.2));
  return svg(
    'collision-flow',
    'A deterministic collision-aware field study in which streams negotiate density, deflect, and leave layered traces.',
    seed,
    parts.join(''),
  );
}

function agentSwarm(seed = 0x5eed123) {
  const random = rng(deriveSeed(seed, 'agents'));
  const anchors = [
    [295, 242], [495, 660], [725, 305], [975, 700], [1235, 365],
  ];
  const agents = [];
  for (let group = 0; group < anchors.length; group += 1) {
    for (let index = 0; index < 18; index += 1) {
      const anchor = anchors[group];
      const angle = random() * TAU;
      const radius = 25 + random() * 112;
      agents.push({
        x: anchor[0] + Math.cos(angle) * radius,
        y: anchor[1] + Math.sin(angle) * radius * 0.7,
        vx: Math.cos(angle + Math.PI / 2) * 0.9,
        vy: Math.sin(angle + Math.PI / 2) * 0.9,
        group,
        mass: 0.8 + random() * 2.5,
        trail: [],
      });
    }
  }

  for (const agent of agents) agent.trail.push([agent.x, agent.y]);
  for (let iteration = 0; iteration < 86; iteration += 1) {
    const deltas = agents.map(() => [0, 0]);
    for (let index = 0; index < agents.length; index += 1) {
      const agent = agents[index];
      const anchor = anchors[agent.group];
      const field = fieldVector(agent.x, agent.y, deriveSeed(seed, 'swarm-field'), 1);
      let fx = field[0] * 0.38 + (anchor[0] - agent.x) * 0.0015;
      let fy = field[1] * 0.38 + (anchor[1] - agent.y) * 0.0015;
      for (let otherIndex = 0; otherIndex < agents.length; otherIndex += 1) {
        if (otherIndex === index) continue;
        const other = agents[otherIndex];
        const dx = agent.x - other.x;
        const dy = agent.y - other.y;
        const separation = Math.hypot(dx, dy);
        if (separation < 88 && separation > 0.001) {
          const force = (88 - separation) / 88 * (other.group === agent.group ? 0.17 : 0.08);
          fx += dx / separation * force;
          fy += dy / separation * force;
        }
      }
      if (agent.x < 90) fx += 0.18;
      if (agent.x > WIDTH - 90) fx -= 0.18;
      if (agent.y < 80) fy += 0.18;
      if (agent.y > HEIGHT - 80) fy -= 0.18;
      deltas[index][0] = fx;
      deltas[index][1] = fy;
    }

    for (let index = 0; index < agents.length; index += 1) {
      const agent = agents[index];
      agent.vx = (agent.vx + deltas[index][0]) * 0.91;
      agent.vy = (agent.vy + deltas[index][1]) * 0.91;
      const speed = length(agent.vx, agent.vy);
      if (speed > 5.8) {
        agent.vx = agent.vx / speed * 5.8;
        agent.vy = agent.vy / speed * 5.8;
      }
      agent.x = clamp(agent.x + agent.vx, 48, WIDTH - 48);
      agent.y = clamp(agent.y + agent.vy, 48, HEIGHT - 48);
      if (iteration % 2 === 0) agent.trail.push([agent.x, agent.y]);
    }
  }

  const edges = [];
  const degree = new Array(agents.length).fill(0);
  for (let index = 0; index < agents.length; index += 1) {
    const nearest = agents
      .map((candidate, candidateIndex) => ({ candidate, candidateIndex, distance: candidateIndex === index ? Infinity : distance([agents[index].x, agents[index].y], [candidate.x, candidate.y]) }))
      .filter((item) => item.distance < 168)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
    for (const item of nearest) {
      const key = index < item.candidateIndex ? `${index}:${item.candidateIndex}` : `${item.candidateIndex}:${index}`;
      if (edges.some((edge) => edge.key === key)) continue;
      edges.push({ key, from: index, to: item.candidateIndex, distance: item.distance });
      degree[index] += 1;
      degree[item.candidateIndex] += 1;
    }
  }

  const ranked = agents.map((agent, index) => ({ index, score: degree[index] * 2.5 + agent.mass + length(agent.vx, agent.vy) })).sort((a, b) => b.score - a.score);
  const redAgents = new Set(ranked.slice(0, 5).map((item) => item.index));
  const parts = [];

  for (let group = 0; group < anchors.length; group += 1) {
    const [x, y] = anchors[group];
    parts.push(ellipse(x, y, 176 + group * 5, 110 + group * 3, group % 2 ? COLOR.paperDeep : COLOR.sand, 0.045));
  }
  parts.push('<g fill="none" stroke-linecap="round" stroke-linejoin="round">');
  for (const edge of edges) {
    const from = agents[edge.from];
    const to = agents[edge.to];
    const midpoint = [(from.x + to.x) / 2, (from.y + to.y) / 2];
    const bend = (edge.from % 2 ? 1 : -1) * (12 + (edge.to % 5) * 4);
    const control = [midpoint[0] - (to.y - from.y) * 0.16, midpoint[1] + (to.x - from.x) * 0.16 + bend];
    const path = `M ${f(from.x)} ${f(from.y)} Q ${f(control[0])} ${f(control[1])} ${f(to.x)} ${f(to.y)}`;
    const active = redAgents.has(edge.from) || redAgents.has(edge.to);
    parts.push(`<path d="${path}" fill="none" stroke="${active ? COLOR.redDark : (edge.from % 3 === 0 ? COLOR.clay : COLOR.ink)}" stroke-width="${f(active ? 1.55 : 0.62 + (edge.from % 4) * 0.13)}" opacity="${f(active ? 0.3 : 0.075 + (edge.distance / 168) * 0.07)}"/>`);
  }
  parts.push('</g>');

  for (let index = 0; index < agents.length; index += 1) {
    const agent = agents[index];
    const tone = redAgents.has(index) ? COLOR.redDark : (agent.group % 3 === 1 ? COLOR.clay : COLOR.ink);
    const broad = index % 17 === 0;
    parts.push(polyline(agent.trail, tone, broad ? 10 : 2.6 + agent.mass * 0.3, broad ? 0.04 : 0.14 + agent.mass * 0.025));
  }
  for (let index = 0; index < agents.length; index += 1) {
    const agent = agents[index];
    const high = degree[index] >= 5;
    const tone = redAgents.has(index) ? COLOR.red : (agent.group % 3 === 1 ? COLOR.clay : COLOR.ink);
    const radius = 2.1 + agent.mass * 1.5 + degree[index] * 0.22;
    parts.push(circle(agent.x, agent.y, radius + (high ? 4 : 0), 'none', high ? 0.28 : 0, tone, high ? 0.8 : 0));
    parts.push(circle(agent.x, agent.y, radius, redAgents.has(index) ? COLOR.red : COLOR.paper, redAgents.has(index) ? 0.82 : 0.72, tone, high ? 1.35 : 0.72));
    if (redAgents.has(index)) parts.push(circle(agent.x, agent.y, radius + 8, 'none', 0.16, COLOR.red, 1));
  }

  return svg(
    'accumulated-agent-swarm',
    'A deterministic swarm study where local separation, attraction, and accumulated trails form an adaptive mesh.',
    seed,
    parts.join(''),
  );
}

function subdivide(region, depth, lineage, random, result) {
  const { x, y, width, height } = region;
  if (depth <= 0 || width < 125 || height < 105 || random() < 0.13 + (6 - depth) * 0.025) {
    result.push({ ...region, depth, lineage });
    return;
  }
  const vertical = width / height > 1.22 ? true : height / width > 1.22 ? false : random() > 0.48;
  if (random() < 0.12 && width > 230 && height > 200) {
    const splitX = width * (0.34 + random() * 0.32);
    const splitY = height * (0.34 + random() * 0.32);
    subdivide({ x, y, width: splitX, height: splitY }, depth - 1, `${lineage}a`, random, result);
    subdivide({ x: x + splitX, y, width: width - splitX, height: splitY }, depth - 1, `${lineage}b`, random, result);
    subdivide({ x, y: y + splitY, width: splitX, height: height - splitY }, depth - 1, `${lineage}c`, random, result);
    subdivide({ x: x + splitX, y: y + splitY, width: width - splitX, height: height - splitY }, depth - 1, `${lineage}d`, random, result);
    return;
  }
  const ratio = 0.29 + random() * 0.42;
  if (vertical) {
    subdivide({ x, y, width: width * ratio, height }, depth - 1, `${lineage}0`, random, result);
    subdivide({ x: x + width * ratio, y, width: width * (1 - ratio), height }, depth - 1, `${lineage}1`, random, result);
  } else {
    subdivide({ x, y, width, height: height * ratio }, depth - 1, `${lineage}0`, random, result);
    subdivide({ x, y: y + height * ratio, width, height: height * (1 - ratio) }, depth - 1, `${lineage}1`, random, result);
  }
}

function irregularRect(region, seed, inset = 4) {
  const random = rng(seed);
  const x = region.x + inset;
  const y = region.y + inset;
  const width = Math.max(8, region.width - inset * 2);
  const height = Math.max(8, region.height - inset * 2);
  const points = [];
  const topCount = Math.max(2, Math.round(width / 110));
  const sideCount = Math.max(2, Math.round(height / 100));
  for (let index = 0; index <= topCount; index += 1) {
    const t = index / topCount;
    points.push([x + t * width, y + (random() - 0.5) * 7]);
  }
  for (let index = 1; index <= sideCount; index += 1) {
    const t = index / sideCount;
    points.push([x + width + (random() - 0.5) * 7, y + t * height]);
  }
  for (let index = 1; index <= topCount; index += 1) {
    const t = index / topCount;
    points.push([x + width * (1 - t), y + height + (random() - 0.5) * 7]);
  }
  for (let index = 1; index < sideCount; index += 1) {
    const t = index / sideCount;
    points.push([x + (random() - 0.5) * 7, y + height * (1 - t)]);
  }
  return points;
}

function contour(cx, cy, rx, ry, count, seed, wobble = 0.12) {
  const random = rng(seed);
  const points = [];
  for (let index = 0; index < count; index += 1) {
    const angle = index * TAU / count;
    const radial = 1 + (random() - 0.5) * wobble + Math.sin(angle * 3 + seed * 0.00001) * wobble * 0.4;
    points.push([cx + Math.cos(angle) * rx * radial, cy + Math.sin(angle) * ry * radial]);
  }
  return points;
}

function subdivisionSediment(seed = 0x10ccafe) {
  const random = rng(deriveSeed(seed, 'regions'));
  const regions = [];
  subdivide({ x: 90, y: 82, width: 1420, height: 836 }, 7, 'r', random, regions);
  const parts = [];

  // A few huge, quiet contours establish the macro composition before the
  // recursive cells and their small marks arrive.
  parts.push(polygon(contour(800, 500, 680, 390, 22, deriveSeed(seed, 'macro-a'), 0.08), COLOR.paperDeep, 'none', 0, 0.2));
  parts.push(polyline(contour(850, 485, 560, 300, 26, deriveSeed(seed, 'macro-b'), 0.11), COLOR.clay, 12, 0.04));
  parts.push(polyline(contour(860, 500, 420, 228, 28, deriveSeed(seed, 'macro-c'), 0.14), COLOR.ink, 2.4, 0.11));

  for (const [index, region] of regions.entries()) {
    const regionSeed = deriveSeed(seed, region.lineage);
    const randomRegion = rng(regionSeed);
    const area = region.width * region.height;
    const red = index % 47 === 9 || (region.depth < 3 && index % 31 === 4);
    const clay = !red && index % 7 === 2;
    const fill = red ? COLOR.red : clay ? COLOR.clay : (index + region.depth) % 3 === 0 ? COLOR.paperDeep : COLOR.paper;
    const fillOpacity = red ? 0.11 : clay ? 0.08 : 0.045 + (region.depth % 3) * 0.014;
    const polygonPoints = irregularRect(region, regionSeed, Math.min(11, 3 + region.depth));
    parts.push(polygon(polygonPoints, fill, 'none', 0, fillOpacity));

    if (area > 11000) {
      const cx = region.x + region.width / 2;
      const cy = region.y + region.height / 2;
      const levels = 1 + (region.lineage.length % 3);
      for (let level = 0; level < levels; level += 1) {
        const inset = 13 + level * 12;
        const rx = Math.max(8, region.width / 2 - inset);
        const ry = Math.max(8, region.height / 2 - inset * 0.72);
        const ring = contour(cx + (randomRegion() - 0.5) * 7, cy + (randomRegion() - 0.5) * 7, rx, ry, 12 + (region.lineage.length % 5), regionSeed + level * 97, 0.1);
        parts.push(polyline(ring.concat([ring[0]]), red && level === levels - 1 ? COLOR.redDark : COLOR.inkSoft, red && level === levels - 1 ? 2.2 : 0.9 + (level % 2) * 0.3, red && level === levels - 1 ? 0.52 : 0.15 + level * 0.025));
      }
    }
  }

  // A sparse diagonal seam prevents the recursion from becoming a visible UI
  // grid and gives the material a direction of travel.
  const seam = [];
  for (let index = 0; index <= 26; index += 1) {
    const t = index / 26;
    seam.push([40 + t * 1510, 760 - t * 430 + Math.sin(t * 8) * 34]);
  }
  parts.push(polyline(seam, COLOR.redDark, 2.7, 0.32));
  for (let index = 4; index < seam.length - 1; index += 7) {
    const point = seam[index];
    parts.push(circle(point[0], point[1], 3 + (index % 3), COLOR.red, 0.47, COLOR.paper, 1.2));
  }

  return svg(
    'subdivision-sediment',
    'A recursive material study in which irregular cells, nested contours, hatching, and deposits accumulate into a quiet sediment.',
    seed,
    parts.join(''),
  );
}

function growNodeGarden(seed) {
  const random = rng(deriveSeed(seed, 'growth'));
  const nodes = [];
  const edges = [];
  const tips = [];
  const addNode = (x, y, depth, mass, parent = null) => {
    const id = nodes.length;
    nodes.push({ id, x, y, depth, mass });
    if (parent !== null) edges.push({ from: parent, to: id, depth });
    return id;
  };

  for (let root = 0; root < 5; root += 1) {
    const x = 220 + root * 290 + (random() - 0.5) * 52;
    const y = 818 + (random() - 0.5) * 96;
    const phase = random() * TAU;
    const id = addNode(x, y, 0, 2.5 + random() * 2.2);
    tips.push({ nodeId: id, x, y, phase, angle: -Math.PI / 2 + (random() - 0.5) * 0.7, depth: 0, life: 52 + Math.floor(random() * 38) });
  }

  for (let step = 0; step < 560 && tips.length; step += 1) {
    const tipIndex = Math.floor(random() * tips.length);
    const tip = tips[tipIndex];
    const field = gardenFieldVector(tip.x, tip.y, deriveSeed(seed, 'garden-field'), tip.phase);
    const targetAngle = Math.atan2(field[1], field[0]);
    const blend = 0.55 + random() * 0.28;
    const angle = tip.angle * (1 - blend) + targetAngle * blend + (random() - 0.5) * 0.5;
    let candidate = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const testAngle = angle + (attempt - 2.5) * 0.16;
      const stepLength = 15 + random() * 13;
      const x = tip.x + Math.cos(testAngle) * stepLength;
      const y = tip.y + Math.sin(testAngle) * stepLength;
      if (x < 44 || x > WIDTH - 44 || y < 42 || y > HEIGHT - 42) continue;
      let nearest = Infinity;
      for (const node of nodes) nearest = Math.min(nearest, Math.hypot(x - node.x, y - node.y));
      if (nearest > 13) {
        candidate = { x, y, angle: testAngle };
        break;
      }
    }
    if (!candidate || tip.life <= 0) {
      tips.splice(tipIndex, 1);
      continue;
    }

    const id = addNode(candidate.x, candidate.y, tip.depth + 1, 0.8 + random() * 2.8, tip.nodeId);
    tip.nodeId = id;
    tip.x = candidate.x;
    tip.y = candidate.y;
    tip.angle = candidate.angle;
    tip.life -= 1;

    if (tip.life < 5 || random() < 0.04 + tip.depth * 0.008) {
      tips.splice(tipIndex, 1);
    }
    if (random() < 0.13 && tip.depth < 6 && tips.length < 90) {
      tips.push({
        nodeId: id,
        x: candidate.x,
        y: candidate.y,
        phase: tip.phase + (random() - 0.5) * 1.5,
        angle: candidate.angle + (random() > 0.5 ? 1 : -1) * (0.42 + random() * 0.42),
        depth: tip.depth + 1,
        life: 24 + Math.floor(random() * 42),
      });
    }
  }

  const edgeKeys = new Set(edges.map((edge) => `${Math.min(edge.from, edge.to)}:${Math.max(edge.from, edge.to)}`));
  for (let index = 0; index < nodes.length; index += 1) {
    const nearest = nodes
      .filter((_, candidateIndex) => candidateIndex !== index)
      .map((node) => ({ node, distance: Math.hypot(node.x - nodes[index].x, node.y - nodes[index].y) }))
      .filter((item) => item.distance > 42 && item.distance < 135)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 1);
    if (!nearest.length || random() > 0.1) continue;
    const target = nearest[0].node;
    const key = `${Math.min(index, target.id)}:${Math.max(index, target.id)}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      edges.push({ from: index, to: target.id, depth: Math.max(nodes[index].depth, target.depth) });
    }
  }

  const degree = new Array(nodes.length).fill(0);
  for (const edge of edges) {
    degree[edge.from] += 1;
    degree[edge.to] += 1;
  }
  const redNodes = new Set(nodes
    .map((node, index) => ({ index, score: degree[index] * 3 + node.mass + (5 - Math.min(5, node.depth)) * 0.2 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.index));

  const parts = [];

  parts.push('<g fill="none" stroke-linecap="round" stroke-linejoin="round">');
  for (const edge of edges) {
    const from = nodes[edge.from];
    const to = nodes[edge.to];
    const tangent = normalize(to.x - from.x, to.y - from.y);
    const normal = [-tangent[1], tangent[0]];
    const bend = (edge.from % 3 - 1) * (8 + edge.to % 9);
    const midpoint = [(from.x + to.x) / 2 + normal[0] * bend, (from.y + to.y) / 2 + normal[1] * bend];
    const path = `M ${f(from.x)} ${f(from.y)} Q ${f(midpoint[0])} ${f(midpoint[1])} ${f(to.x)} ${f(to.y)}`;
    const red = redNodes.has(edge.from) || redNodes.has(edge.to);
    const tone = red ? COLOR.redDark : edge.depth % 4 === 0 ? COLOR.clay : COLOR.ink;
    parts.push(`<path d="${path}" fill="none" stroke="${tone}" stroke-width="${f(red ? 2.1 : 0.85 + (edge.depth % 4) * 0.2)}" opacity="${f(red ? 0.5 : 0.16 + (5 - Math.min(5, edge.depth)) * 0.022)}"/>`);
  }
  parts.push('</g>');

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const red = redNodes.has(index);
    const tone = red ? COLOR.red : node.depth % 4 === 0 ? COLOR.clay : COLOR.ink;
    const radius = 2 + node.mass * 1.15 + Math.min(4, degree[index]) * 0.55;
    if (degree[index] >= 3) parts.push(circle(node.x, node.y, radius + 7 + degree[index], 'none', red ? 0.22 : 0.14, tone, 0.75));
    parts.push(circle(node.x, node.y, radius, red ? COLOR.red : COLOR.paper, red ? 0.86 : 0.7, tone, degree[index] >= 3 ? 1.55 : 0.8));
    if (red) {
      parts.push(circle(node.x, node.y, radius + 12, 'none', 0.16, COLOR.red, 1));
    }
  }

  return svg(
    'substrate-node-garden',
    'A deterministic node garden grown from seeded tips, local field direction, crowding, and occasional cross-links.',
    seed,
    parts.join(''),
  );
}

export const contemporaryStudies = [
  {
    slug: 'collision-flow',
    title: 'Collision Field',
    description: 'Spaced streams negotiating one coherent vector field through collision and deflection.',
    generate: (seed = 0x2c0ffee) => collisionFlow(seed),
  },
  {
    slug: 'accumulated-agent-swarm',
    title: 'Accumulated Agent Swarm',
    description: 'Local separation and attraction forming a mutable mesh of trails and nodes.',
    generate: (seed = 0x5eed123) => agentSwarm(seed),
  },
  {
    slug: 'subdivision-sediment',
    title: 'Subdivision Sediment',
    description: 'Recursive cells and nested contours forming a quiet, precisely structured composition.',
    generate: (seed = 0x10ccafe) => subdivisionSediment(seed),
  },
  {
    slug: 'substrate-node-garden',
    title: 'Substrate Node Garden',
    description: 'Branching tips and sparse cross-links growing a deterministic field of nodes.',
    generate: (seed = 0x77a11ce) => growNodeGarden(seed),
  },
];
