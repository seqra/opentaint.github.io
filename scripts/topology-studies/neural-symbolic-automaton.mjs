/**
 * A deterministic, label-free topology study about compression and
 * enumeration. Distributed activation bands on the left contract into a
 * compact square-symbol handoff, then expand into an orthogonal state lattice.
 *
 * The geometry carries the reading: repeated cells, shared edges, and one
 * restrained red path are the only semantic marks. There are no arrows,
 * labels, textures, or incidental random marks.
 */

export const CANVAS = Object.freeze({ width: 1600, height: 1000 });

const PALETTE = Object.freeze({
  paper: '#f7f7f5',
  paperDeep: '#ececea',
  ink: '#1b1b1d',
  soft: '#66666a',
  clay: '#8d8582',
  // Uppercase is deliberate: the shared runner's lowercase red substitution
  // must not turn this study's light and dark red into two different colors.
  red: '#CA2121',
});

const SOURCE = 'https://en.wikipedia.org/wiki/Finite-state_machine; https://en.wikipedia.org/wiki/Cellular_automaton';
const VERSION = 'neural-symbolic-automaton-1.1.0';
const TAU = Math.PI * 2;

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value === undefined || value === null ? 'neural-symbolic-automaton' : value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
}

function deriveSeed(seed, label) {
  return hashSeed(`${seed}:${label}`);
}

function rng(seed) {
  let state = hashSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function f(value) {
  return String(Math.round(value * 100) / 100);
}

function pathD(points, close = false) {
  if (!points.length) return '';
  const commands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point.x)} ${f(point.y)}`);
  return `${commands.join(' ')}${close ? ' Z' : ''}`;
}

function smoothPathD(points, close = false) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${f(points[0].x)} ${f(points[0].y)}`;
  let output = `M ${f(points[0].x)} ${f(points[0].y)}`;
  const segmentCount = close ? points.length : points.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const previous = close ? points[(index - 1 + points.length) % points.length] : (points[index - 1] || points[index]);
    const first = points[index];
    const second = points[(index + 1) % points.length];
    const next = close ? points[(index + 2) % points.length] : (points[index + 2] || second);
    const controlOne = {
      x: first.x + (second.x - previous.x) / 6,
      y: first.y + (second.y - previous.y) / 6,
    };
    const controlTwo = {
      x: second.x - (next.x - first.x) / 6,
      y: second.y - (next.y - first.y) / 6,
    };
    output += ` C ${f(controlOne.x)} ${f(controlOne.y)} ${f(controlTwo.x)} ${f(controlTwo.y)} ${f(second.x)} ${f(second.y)}`;
  }
  return `${output}${close ? ' Z' : ''}`;
}

function ellipsePath(cx, cy, radiusX, radiusY, rotation, wobble = 0) {
  const points = [];
  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * TAU;
    const localRadius = 1 + wobble * Math.sin(angle * 3 + rotation * 2.2);
    const localX = Math.cos(angle) * radiusX * localRadius;
    const localY = Math.sin(angle) * radiusY * (1 + wobble * 0.45 * Math.cos(angle * 2 - rotation));
    points.push({
      x: cx + localX * Math.cos(rotation) - localY * Math.sin(rotation),
      y: cy + localX * Math.sin(rotation) + localY * Math.cos(rotation),
    });
  }
  return points;
}

function classes(strokeClass, fillClass = '') {
  return [strokeClass && `nsa-stroke-${strokeClass}`, fillClass && `nsa-fill-${fillClass}`]
    .filter(Boolean)
    .join(' ');
}

function pathElement(points, strokeClass, width = 1, opacity = 1, close = false, fillClass = '', smooth = false, extra = '') {
  if (points.length < 2) return '';
  const d = smooth ? smoothPathD(points, close) : pathD(points, close);
  const className = classes(strokeClass, fillClass);
  return `<path class="${className}" d="${d}" fill="none" stroke="none" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function dot(point, radius, fillClass, strokeClass = '', strokeWidth = 0, opacity = 1) {
  const className = classes(strokeClass, fillClass);
  return `<circle class="${className}" cx="${f(point.x)}" cy="${f(point.y)}" r="${f(radius)}" fill="none" stroke="none" stroke-width="${f(strokeWidth)}" opacity="${f(opacity)}"/>`;
}

function svgStyle() {
  return `<style>
    svg[data-study="neural-symbolic-automaton"] .nsa-stroke-ink {
      stroke: rgb(27, 27, 29) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-stroke-soft {
      stroke: rgb(102, 102, 106) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-stroke-clay {
      stroke: rgb(141, 133, 130) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-stroke-red {
      stroke: #CA2121 !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-fill-deep {
      fill: rgb(236, 236, 234) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-fill-ink {
      fill: rgb(27, 27, 29) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-fill-soft {
      fill: rgb(102, 102, 106) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-fill-clay {
      fill: rgb(141, 133, 130) !important;
    }
    svg[data-study="neural-symbolic-automaton"] .nsa-fill-red {
      fill: #CA2121 !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-stroke-ink {
      stroke: rgb(249, 236, 236) !important;
      stroke-width: 1.85px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-stroke-soft {
      stroke: rgb(198, 173, 173) !important;
      stroke-width: 1.45px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-stroke-clay {
      stroke: rgb(211, 132, 124) !important;
      stroke-width: 1.3px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-stroke-red {
      stroke: #CA2121 !important;
      stroke-width: 4.45px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-fill-deep {
      fill: rgb(46, 28, 29) !important;
      opacity: 0.32 !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-fill-ink {
      fill: rgb(249, 236, 236) !important;
      stroke: rgb(249, 236, 236) !important;
      stroke-width: 1.8px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-fill-soft {
      fill: rgb(198, 173, 173) !important;
      stroke: rgb(198, 173, 173) !important;
      stroke-width: 1.55px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-fill-clay {
      fill: rgb(211, 132, 124) !important;
      stroke: rgb(211, 132, 124) !important;
      stroke-width: 1.55px !important;
    }
    svg[data-study="neural-symbolic-automaton"][data-theme="dark"] .nsa-fill-red {
      fill: #CA2121 !important;
      stroke: #CA2121 !important;
      stroke-width: 1.8px !important;
    }
  </style>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgDocument(seed, body) {
  const slug = 'neural-symbolic-automaton';
  const title = 'Neural symbolic automaton';
  const description = 'Distributed activation bands contract into a compact square-symbol handoff and expand into an orthogonal exhaustive program-state lattice.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${slug}-title ${slug}-description" data-generator="opentaint-neural-symbolic-automaton" data-generator-version="${VERSION}" data-seed="${hashSeed(seed)}" data-study="${slug}" data-source="${escapeXml(SOURCE)}">
  <title id="${slug}-title">${escapeXml(title)}</title>
  <desc id="${slug}-description">${escapeXml(description)}</desc>
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="${PALETTE.paper}"/>
  ${body}
</svg>
`;
}

function activationLayer(spec, phase, layerIndex) {
  const points = [];
  for (let index = 0; index < spec.count; index += 1) {
    const t = (index + 1) / (spec.count + 1);
    const y = spec.cy - spec.ry + t * spec.ry * 2;
    const wave = Math.sin(t * TAU * (1.18 + layerIndex * 0.12) + phase + layerIndex * 0.8);
    const secondary = Math.cos(t * TAU * 2.1 - phase * 0.7) * 0.28;
    points.push({
      x: spec.cx + (wave + secondary) * spec.rx * 0.48,
      y,
    });
  }
  return points;
}

function drawActivationBands(random, phase) {
  const specs = [
    { cx: 158, cy: 500, rx: 92, ry: 318, count: 17, tilt: -0.08 },
    { cx: 306, cy: 500, rx: 84, ry: 255, count: 14, tilt: 0.05 },
    { cx: 438, cy: 500, rx: 66, ry: 185, count: 11, tilt: -0.11 },
  ];
  const layers = specs.map((spec, index) => activationLayer(spec, phase, index));
  let body = '';

  specs.forEach((spec, index) => {
    const wobble = 0.035 + index * 0.012;
    body += pathElement(ellipsePath(spec.cx, spec.cy, spec.rx + 16, spec.ry + 20, spec.tilt, wobble), 'soft', 1.25, 0.52, true, '', true);
    body += pathElement(ellipsePath(spec.cx, spec.cy, spec.rx - 6, spec.ry - 10, spec.tilt + 0.03, wobble * 0.8), 'clay', 0.92, 0.48, true, '', true);
    body += pathElement(ellipsePath(spec.cx, spec.cy, spec.rx * 0.64, spec.ry * 0.72, spec.tilt - 0.02, wobble), 'ink', 0.82, 0.25, true, '', true);
    const points = layers[index];
    body += pathElement(points, index === 1 ? 'ink' : 'soft', 1.05, 0.54, false, '', true);
    for (let pointIndex = 1; pointIndex < points.length - 1; pointIndex += 2) {
      const point = points[pointIndex];
      const local = {
        x: point.x + Math.sin(pointIndex * 1.7 + phase) * 12,
        y: point.y,
      };
      body += pathElement([point, local], index === 1 ? 'clay' : 'soft', 0.76, 0.38, false, '', true);
    }
    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      const point = points[pointIndex];
      const fill = (pointIndex + index) % 5 === 0 ? 'ink' : (pointIndex + index) % 2 === 0 ? 'clay' : 'deep';
      body += dot(point, 3.8 + (pointIndex % 3) * 0.65, fill, fill === 'deep' ? 'soft' : '', 0, 0.78);
    }
  });

  // Ordered bundles between bands narrow toward the symbolic knot. The
  // destinations are monotone in y so they read as compression, not noise.
  for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex += 1) {
    const from = layers[layerIndex];
    const to = layers[layerIndex + 1];
    const bundleCount = 7 - layerIndex * 2;
    for (let bundle = 0; bundle < bundleCount; bundle += 1) {
      const fromIndex = Math.round((bundle + 1) * (from.length - 1) / (bundleCount + 1));
      const toIndex = Math.round((bundle + 1) * (to.length - 1) / (bundleCount + 1));
      const first = from[fromIndex];
      const second = to[toIndex];
      const bend = (second.y - 500) * 0.08;
      body += pathElement([
        first,
        { x: first.x + (second.x - first.x) * 0.42, y: first.y + bend },
        { x: second.x - (second.x - first.x) * 0.34, y: second.y - bend },
        second,
      ], bundle % 3 === 0 ? 'clay' : 'soft', 0.82 + layerIndex * 0.12, 0.34 + layerIndex * 0.04, false, '', true);
    }
  }

  // A few stable short crossbars make the left field read as layers rather
  // than a collection of isolated filaments.
  for (let index = 0; index < 6; index += 1) {
    const y = 252 + index * 98 + Math.sin(phase + index) * 5;
    const x = 92 + (index % 3) * 112;
    body += pathElement([
      { x, y },
      { x: x + 56, y: y + Math.sin(index * 1.4 + phase) * 8 },
    ], random() > 0.45 ? 'clay' : 'soft', 0.72, 0.28, false, '', true);
  }
  return body;
}

function squarePoints(cx, cy, size) {
  const half = size / 2;
  return [
    { x: cx - half, y: cy - half },
    { x: cx + half, y: cy - half },
    { x: cx + half, y: cy + half },
    { x: cx - half, y: cy + half },
  ];
}

function diamondPoints(cx, cy, radius) {
  return [
    { x: cx, y: cy - radius },
    { x: cx + radius, y: cy },
    { x: cx, y: cy + radius },
    { x: cx - radius, y: cy },
  ];
}

function drawAutomaton(phase) {
  // One rotated square is the agentic enactment boundary: the invariant
  // passes through unchanged, while the representation around it changes
  // from distributed activations to an explicit exhaustive state space.
  const agent = { x: 690, y: 500, radius: 48 };
  let body = '';

  body += pathElement(
    diamondPoints(agent.x, agent.y, agent.radius),
    'red',
    1.46,
    0.82,
    true,
    'red',
    false,
  );
  // The invariant is deliberately straight through the enactment boundary.
  // Its only mark here is the red center point.
  const finalSpec = { cx: 438, cy: 500, rx: 66, ry: 185, count: 11 };
  const finalLayer = activationLayer(finalSpec, phase, 2);
  const source = finalLayer[Math.round((finalLayer.length - 1) / 2)];
  body += pathElement([source, { x: 824, y: 500 }], 'red', 3.2, 0.96, false, '', false);
  body += dot(agent, 5.2, 'red', '', 0, 0.98);
  return body;
}

function buildStateLattice(seed, phase) {
  const random = rng(deriveSeed(seed, 'state-lattice'));
  const columns = 8;
  const rows = 7;
  const originX = 962;
  const originY = 272;
  const step = 76;
  const cellSize = 44;
  const nodes = Array.from({ length: rows }, (_, row) => (
    Array.from({ length: columns }, (_, column) => ({
      x: originX + column * step,
      y: originY + row * step,
    }))
  ));
  const frame = [
    { x: 916, y: 214 },
    { x: 1540, y: 214 },
    { x: 1540, y: 786 },
    { x: 916, y: 786 },
  ];
  const innerFrame = [
    { x: 930, y: 232 },
    { x: 1526, y: 232 },
    { x: 1526, y: 768 },
    { x: 930, y: 768 },
  ];
  let body = '';

  // The right-hand field is deliberately orthogonal: a rectangular enclosure
  // and a complete, equally spaced square grid make exhaustive enumeration
  // read at a glance, even in a small thumbnail.
  body += pathElement(frame, 'ink', 1.38, 0.56, true, '', false);
  body += pathElement(innerFrame, 'soft', 0.92, 0.36, true, '', false);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const current = nodes[row][column];
      if (column < columns - 1) {
        body += pathElement(
          [current, nodes[row][column + 1]],
          (row + column) % 4 === 0 ? 'ink' : 'soft',
          0.98,
          0.56,
          false,
          '',
          false,
        );
      }
      if (row < rows - 1) {
        body += pathElement(
          [current, nodes[row + 1][column]],
          (row + column) % 3 === 0 ? 'clay' : 'soft',
          0.92,
          0.52,
          false,
          '',
          false,
        );
      }
    }
  }

  const accentOffset = Math.floor(random() * 4) + Math.round((Math.sin(phase) + 1) * 1.5);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const node = nodes[row][column];
      const accent = (row * 5 + column * 3 + accentOffset) % 19 === 0;
      const secondary = (row * 3 + column * 2 + accentOffset) % 23 === 0;
      const cellFill = accent ? 'deep' : secondary ? 'clay' : '';
      const cellStroke = (row + column) % 4 === 0 ? 'ink' : 'soft';
      body += pathElement(
        squarePoints(node.x, node.y, cellSize),
        cellStroke,
        1.16,
        0.74,
        true,
        cellFill,
        false,
      );
      if ((row * 2 + column + accentOffset) % 7 === 0) {
        body += pathElement(
          squarePoints(node.x, node.y, 13),
          'clay',
          0.72,
          0.5,
          true,
          '',
          false,
        );
      }
      body += dot(node, 3.6, (row + column) % 3 === 0 ? 'ink' : 'clay', '', 0, 0.84);
    }
  }

  // Three orthogonal channels expand from the symbolic handoff into distinct
  // lattice rows. The middle channel is overlaid by the single red route.
  const automatonExit = { x: 824, y: 500 };
  const entranceRows = [1, 3, 5];
  for (const [index, row] of entranceRows.entries()) {
    const entrance = nodes[row][0];
    const elbowX = 850 + index * 28;
    body += pathElement([
      automatonExit,
      { x: elbowX, y: 500 },
      { x: elbowX, y: entrance.y },
      { x: entrance.x - 30, y: entrance.y },
      entrance,
    ], index === 1 ? 'ink' : 'soft', 1.02, 0.46, false, '', false);
  }

  const centralEntrance = nodes[3][0];
  body += pathElement([
    automatonExit,
    { x: 878, y: 500 },
    { x: centralEntrance.x - 30, y: centralEntrance.y },
    centralEntrance,
  ], 'red', 3.2, 0.96, false, '', false);

  // Every consecutive pair below is a real horizontal or vertical grid edge;
  // the route turns repeatedly while staying inside the exhaustive lattice.
  const route = [
    centralEntrance,
    nodes[2][0], nodes[2][1], nodes[2][2],
    nodes[3][2], nodes[3][3], nodes[3][4],
    nodes[4][4], nodes[4][5], nodes[4][6],
    nodes[3][6], nodes[2][6], nodes[2][7],
    nodes[1][7], nodes[1][6], nodes[0][6], nodes[0][7],
  ];
  body += pathElement(route, 'red', 3.2, 0.96, false, '', false);
  for (const node of [route[0], route[7], route.at(-1)]) body += dot(node, 5.15, 'red', '', 0, 0.98);
  return body;
}

function generateNeuralSymbolicAutomaton(seed = 0x4e534133) {
  const phase = rng(deriveSeed(seed, 'composition-phase'))() * TAU;
  let body = svgStyle();
  body += drawActivationBands(rng(deriveSeed(seed, 'activation-emphasis')), phase);
  body += drawAutomaton(phase);
  body += buildStateLattice(seed, phase);
  return svgDocument(seed, body);
}

export const neuralSymbolicAutomatonStudies = Object.freeze([
  {
    slug: 'neural-symbolic-automaton',
    title: 'Neural symbolic automaton',
    description: 'Distributed activation bands contract into a compact square-symbol handoff and expand into an orthogonal exhaustive program-state lattice.',
    source: SOURCE,
    generate: generateNeuralSymbolicAutomaton,
  },
]);

export { generateNeuralSymbolicAutomaton };
