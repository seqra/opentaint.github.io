/**
 * A deterministic "riddled, then proven" lattice for "SAST Is Dead, Long Live SAST!"
 *
 * One irregular relative-neighborhood graph spans the canvas: the same program
 * everywhere. A soft curved boundary splits it. On the left the nodes are open
 * and some are red bugs: what an AI agent finds. On the right the same kind of
 * nodes are all filled blue (checked) and none is red: what a proof guarantees.
 */

const WIDTH = 1600;
const HEIGHT = 1000;
const VERSION = 'proof-of-absence-4.0.0';
const SOURCE = 'https://en.wikipedia.org/wiki/Relative_neighborhood_graph';

const COLOR = Object.freeze({
  paper: '#f7f7f5',
  // Keep these authored role colors in the topology runner's palette map so
  // the dark variant swaps them instead of leaving light-mode grays behind.
  ink: '#191719',
  inkSoft: '#53484a',
  red: '#ca2121',
  // Blue team: the proven side. Like brand red, it is kept in both themes.
  blue: '#2f62d6',
});

const BUG_RATE = 0.22;
// Bugs stay this far left of the boundary so none reads as leaking across it.
const BUG_MARGIN = 110;

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

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function line(a, b, stroke, width, opacity, className = '') {
  const classAttribute = className ? ` class="${className}"` : '';
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round"${classAttribute}/>`;
}

function circle(point, radius, fill, stroke, strokeWidth, opacity = 1) {
  return `<circle cx="${f(point.x)}" cy="${f(point.y)}" r="${f(radius)}" fill="${fill}" stroke="${stroke}" stroke-width="${f(strokeWidth)}" opacity="${f(opacity)}"/>`;
}

function svgDocument({ slug, title, description, seed, body }) {
  const id = `proof-of-absence-${hashSeed(slug).toString(16)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="title-${id} desc-${id}" data-generator="opentaint-proof-of-absence" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${escapeText(slug)}" data-source="${SOURCE}">
  <title id="title-${id}">${escapeText(title)}</title>
  <desc id="desc-${id}">${escapeText(description)}</desc>
  <style>
    /* Dark cards need more physical line weight, not only brighter colors. */
    [data-theme="dark"] .absence-edge { stroke-width: 2.8px !important; }
    /* Saturated blue sinks into the dark ground; lift the proven edges there. */
    [data-theme="dark"] .absence-proven { stroke: #6f97ff !important; opacity: 0.8 !important; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.paper}"/>
  ${body}
</svg>
`;
}

// The program field: one soft, wide ellipse centered on the canvas.
function fieldWeight(point) {
  const dx = (point.x - 800) / 700;
  const dy = (point.y - 500) / 380;
  return 1 - Math.hypot(dx, dy);
}

function samplePoints(seed) {
  const random = rng(deriveSeed(seed, 'points'));
  const points = [];
  for (let attempt = 0; attempt < 40000 && points.length < 220; attempt += 1) {
    const candidate = { x: 80 + random() * 1440, y: 100 + random() * 800 };
    const weight = fieldWeight(candidate);
    if (weight < 0) continue;
    // Thin the outer edge so the field dissolves rather than ending on a line.
    if (weight < 0.18 && random() > weight / 0.18) continue;
    if (points.some((other) => distance(candidate, other) < 84)) continue;
    points.push(candidate);
  }
  return points;
}

// A gentle curve, not a straight cut: the proof covers the code as it is.
function boundaryX(y) {
  return 830 + Math.sin((y - 120) / 150) * 46;
}

function relativeNeighborhoodEdges(nodes) {
  const edges = [];
  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      const length = distance(nodes[a], nodes[b]);
      if (length > 180) continue;
      let blocked = false;
      for (let c = 0; c < nodes.length && !blocked; c += 1) {
        if (c === a || c === b) continue;
        blocked = Math.max(distance(nodes[a], nodes[c]), distance(nodes[b], nodes[c])) < length;
      }
      if (!blocked) edges.push({ a, b, length });
    }
  }
  return edges;
}

function proofOfAbsence(seed = 0x5a57dead) {
  const nodes = samplePoints(seed);
  const edges = relativeNeighborhoodEdges(nodes);
  const proven = nodes.map((node) => node.x > boundaryX(node.y));
  const random = rng(deriveSeed(seed, 'bugs-17'));
  const bug = nodes.map((node, index) => {
    const roll = random();
    return !proven[index] && node.x < boundaryX(node.y) - BUG_MARGIN && roll < BUG_RATE;
  });
  const body = [];

  body.push('<g fill="none">');
  for (const edge of edges) {
    const bothProven = proven[edge.a] && proven[edge.b];
    body.push(line(nodes[edge.a], nodes[edge.b], bothProven ? COLOR.blue : COLOR.inkSoft, bothProven ? 2.8 : 2.2, bothProven ? 0.75 : 0.5, bothProven ? 'absence-edge absence-proven' : 'absence-edge'));
  }
  body.push('</g><g>');

  nodes.forEach((node, index) => {
    if (proven[index]) {
      body.push(circle(node, 10, COLOR.blue, COLOR.blue, 1, 0.95));
    } else if (bug[index]) {
      body.push(circle(node, 13, COLOR.red, COLOR.red, 1.2, 0.96));
    } else {
      body.push(circle(node, 9, COLOR.paper, COLOR.inkSoft, 2.4, 0.9));
    }
  });
  body.push('</g>');

  return svgDocument({
    slug: 'proof-of-absence',
    title: 'Riddled, then proven',
    description: 'One program graph: on the left, open nodes with red bugs; across a soft boundary, the same graph with every node checked in blue and none red.',
    seed,
    body: body.join(''),
  });
}

export const proofOfAbsenceStudies = [
  {
    slug: 'proof-of-absence',
    title: 'Riddled, then proven',
    description: 'One irregular relative-neighborhood graph, riddled with red bugs on the left and fully checked in blue with none red on the right, split by a soft curved boundary.',
    source: SOURCE,
    // Red and blue are invariant between light and dark assets.
    darkPreserveColors: [COLOR.red, COLOR.blue],
    generate: proofOfAbsence,
  },
];
