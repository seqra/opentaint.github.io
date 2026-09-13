// Neural → symbolic attention study.
//
// A stack of oblique representation planes carries a few corresponding
// activation cells across depth. The correspondence narrows at a seam and
// becomes a complete, faceted state lattice. There are no labels, controls,
// arrows, particles, or texture: the meaning is carried by the construction.

const WIDTH = 1600;
const HEIGHT = 1000;
const VERSION = 'neural-symbolic-attention-1.0.0';

const PALETTE = Object.freeze({
  paper: '#f7f7f5',
  paperDeep: '#ececea',
  ink: '#1b1b1d',
  soft: '#66666a',
  secondary: '#8d8582',
  clay: '#a65442',
  red: '#ca2121',
});

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
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
  const rounded = Number(value.toFixed(2));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function lerp(first, second, amount) {
  return {
    x: first.x + (second.x - first.x) * amount,
    y: first.y + (second.y - first.y) * amount,
  };
}

function quadPoint(corners, u, v) {
  return lerp(
    lerp(corners[0], corners[1], u),
    lerp(corners[3], corners[2], u),
    v,
  );
}

function polylineD(points) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point.x)} ${f(point.y)}`)
    .join(' ');
}

function smoothD(points) {
  if (!points.length) return '';
  if (points.length < 3) return polylineD(points);
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const first = points[index];
    const second = points[index + 1];
    const next = points[index + 2] || second;
    const controlOne = {
      x: first.x + (second.x - previous.x) / 6,
      y: first.y + (second.y - previous.y) / 6,
    };
    const controlTwo = {
      x: second.x - (next.x - first.x) / 6,
      y: second.y - (next.y - first.y) / 6,
    };
    d += ` C ${f(controlOne.x)} ${f(controlOne.y)} ${f(controlTwo.x)} ${f(controlTwo.y)} ${f(second.x)} ${f(second.y)}`;
  }
  return d;
}

function pathElement(points, stroke, width, opacity, mode = 'formal', className = '') {
  if (points.length < 2) return '';
  const d = mode === 'smooth' ? smoothD(points) : polylineD(points);
  const classAttribute = className ? ` class="${className}"` : '';
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round"${classAttribute}/>`;
}

function polygonElement(points, fill, opacity, stroke = 'none', width = 0, className = '') {
  if (points.length < 3) return '';
  const coordinates = points.map((point) => `${f(point.x)},${f(point.y)}`).join(' ');
  const classAttribute = className ? ` class="${className}"` : '';
  return `<polygon points="${coordinates}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(width)}" stroke-linejoin="round"${classAttribute}/>`;
}

function planeElement(points, fill, fillOpacity, stroke, width, opacity) {
  return `<path d="${polylineD(points)} Z" fill="${fill}" fill-opacity="${f(fillOpacity)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linejoin="round" class="neural-plane"/>`;
}

function svgDocument(seed, body) {
  const slug = 'neural-symbolic-attention';
  const title = 'Neural symbolic attention';
  const description = 'Perspective representation planes compress a few correspondences into an exhaustive symbolic state lattice.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${slug}-title ${slug}-description" data-generator="opentaint-neural-symbolic-attention" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${slug}">
  <title id="${slug}-title">${escapeXml(title)}</title>
  <desc id="${slug}-description">${escapeXml(description)}</desc>
  <style>
    [data-theme="dark"] .neural-plane { stroke-width: 3.2px !important; fill-opacity: 0.48 !important; }
    [data-theme="dark"] .neural-grid { stroke-width: 1.95px !important; }
    [data-theme="dark"] .neural-cell { stroke-width: 2.25px !important; opacity: 0.94 !important; }
    [data-theme="dark"] .neural-correspondence { stroke-width: 2.2px !important; opacity: 0.6 !important; }
    [data-theme="dark"] .neural-seam { stroke-width: 2.75px !important; }
    [data-theme="dark"] .neural-face { opacity: 0.58 !important; }
    [data-theme="dark"] .neural-edge { stroke-width: 2.2px !important; }
    [data-theme="dark"] .neural-branch { stroke-width: 2.35px !important; opacity: 0.48 !important; }
    [data-theme="dark"] .neural-invariant { stroke-width: 5.3px !important; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.paper}"/>
  ${body}
</svg>
`;
}

const PLANE_BASE = Object.freeze([
  Object.freeze({ x: 94, y: 240 }),
  Object.freeze({ x: 510, y: 142 }),
  Object.freeze({ x: 752, y: 334 }),
  Object.freeze({ x: 326, y: 470 }),
]);

const PLANE_OFFSETS = Object.freeze([
  Object.freeze({ x: 0, y: 0 }),
  Object.freeze({ x: 25, y: 57 }),
  Object.freeze({ x: 50, y: 114 }),
  Object.freeze({ x: 75, y: 171 }),
  Object.freeze({ x: 100, y: 228 }),
]);

const GRID_TEMPLATE = Object.freeze([
  Object.freeze([0.1, 0.2, 0.37]),
  Object.freeze([0.47, 0.2, 0.87]),
  Object.freeze([0.08, 0.46, 0.31]),
  Object.freeze([0.41, 0.46, 0.76]),
  Object.freeze([0.54, 0.72, 0.9]),
  Object.freeze([0.2, 0.76, 0.42]),
  Object.freeze([0.27, 0.14, 0.27, 0.34]),
  Object.freeze([0.68, 0.53, 0.68, 0.82]),
  Object.freeze([0.38, 0.31, 0.58, 0.66]),
]);

function layerCell(corners, u, v, width, height, skew = 0) {
  const first = quadPoint(corners, u, v);
  const second = quadPoint(corners, u + width, v + skew);
  const third = quadPoint(corners, u + width, v + height + skew);
  const fourth = quadPoint(corners, u, v + height);
  return [first, second, third, fourth];
}

function buildAttentionPlanes(seed) {
  const random = rng(deriveSeed(seed, 'attention-planes'));
  const planes = [];
  for (let index = 0; index < PLANE_OFFSETS.length; index += 1) {
    const offset = PLANE_OFFSETS[index];
    const corners = PLANE_BASE.map((point, cornerIndex) => ({
      x: point.x + offset.x + (random() - 0.5) * 7 + (cornerIndex === 2 ? index * 1.4 : 0),
      y: point.y + offset.y + (random() - 0.5) * 7,
    }));
    const phase = (index % 3 - 1) * 0.024;
    const cells = [
      { u: 0.15 + phase, v: 0.22 + (index % 2) * 0.035, w: 0.14, h: 0.14, skew: 0.015 },
      { u: 0.55 - phase, v: 0.47 - (index % 3) * 0.02, w: 0.17, h: 0.12, skew: -0.012 },
    ].map((cell) => ({
      ...cell,
      points: layerCell(corners, cell.u, cell.v, cell.w, cell.h, cell.skew),
      anchor: quadPoint(corners, cell.u + cell.w / 2, cell.v + cell.h / 2),
    }));
    const grid = GRID_TEMPLATE
      .filter((_, segmentIndex) => (segmentIndex + index) % 5 !== 4)
      .map((segment) => {
        if (segment.length === 3) {
          return [
            quadPoint(corners, segment[0], segment[1]),
            quadPoint(corners, segment[2], segment[1]),
          ];
        }
        return [
          quadPoint(corners, segment[0], segment[1]),
          quadPoint(corners, segment[2], segment[3]),
        ];
      });
    const activation = [
      [
        quadPoint(corners, 0.18 + phase, 0.31),
        quadPoint(corners, 0.27 + phase, 0.39),
        quadPoint(corners, 0.39 + phase, 0.3),
      ],
      [
        quadPoint(corners, 0.6 - phase, 0.56),
        quadPoint(corners, 0.7 - phase, 0.63),
        quadPoint(corners, 0.82 - phase, 0.52),
      ],
    ];
    const correspondenceAnchors = [
      quadPoint(corners, 0.27 + phase, 0.34),
      quadPoint(corners, 0.69 - phase, 0.59),
    ];
    planes.push({ corners, cells, grid, activation, correspondenceAnchors, index });
  }

  const invariantUv = [
    [0.29, 0.36],
    [0.4, 0.41],
    [0.51, 0.46],
    [0.63, 0.5],
    [0.76, 0.53],
  ];
  const invariant = planes.map((plane, index) => quadPoint(
    plane.corners,
    invariantUv[index][0],
    invariantUv[index][1],
  ));
  return { planes, invariant };
}

function buildSymbolicLattice(seed) {
  const random = rng(deriveSeed(seed, 'symbolic-lattice'));
  const xPositions = [1010, 1135, 1265, 1400, 1525];
  const yBlueprints = [
    [370, 500, 630],
    [300, 420, 580, 700],
    [245, 360, 500, 640, 755],
    [300, 420, 580, 700],
    [370, 500, 630],
  ];
  const columns = yBlueprints.map((ys, columnIndex) => ys.map((y, rowIndex) => ({
    id: `c${columnIndex}r${rowIndex}`,
    x: xPositions[columnIndex] + (random() - 0.5) * 14,
    y: y + (random() - 0.5) * 12,
    columnIndex,
    rowIndex,
  })));
  const triangles = [];
  const edgeMap = new Map();
  function edgeKey(first, second) {
    return first.id < second.id ? `${first.id}|${second.id}` : `${second.id}|${first.id}`;
  }
  function addEdge(first, second, triangleIndex) {
    const key = edgeKey(first, second);
    if (!edgeMap.has(key)) edgeMap.set(key, { first, second, triangles: [] });
    edgeMap.get(key).triangles.push(triangleIndex);
  }
  function addTriangle(first, second, third) {
    if (first.id === second.id || second.id === third.id || first.id === third.id) return;
    const triangleIndex = triangles.length;
    triangles.push([first, second, third]);
    addEdge(first, second, triangleIndex);
    addEdge(second, third, triangleIndex);
    addEdge(third, first, triangleIndex);
  }

  // A monotone strip between columns preserves shared vertices while allowing
  // the outer counts 3–4–5–4–3 to form a faceted diamond state space.
  for (let columnIndex = 0; columnIndex < columns.length - 1; columnIndex += 1) {
    const left = columns[columnIndex];
    const right = columns[columnIndex + 1];
    let leftIndex = 0;
    let rightIndex = 0;
    while (leftIndex < left.length - 1 || rightIndex < right.length - 1) {
      const canAdvanceLeft = leftIndex < left.length - 1;
      const canAdvanceRight = rightIndex < right.length - 1;
      if (!canAdvanceRight || (canAdvanceLeft && left[leftIndex + 1].y <= right[rightIndex + 1].y)) {
        addTriangle(left[leftIndex], left[leftIndex + 1], right[rightIndex]);
        leftIndex += 1;
      } else {
        addTriangle(left[leftIndex], right[rightIndex], right[rightIndex + 1]);
        rightIndex += 1;
      }
    }
  }

  // This path uses adjacent strip vertices and is intentionally more measured
  // than the quiet alternate branches around it.
  const routeNodes = [
    columns[0][1],
    columns[1][1],
    columns[2][2],
    columns[3][2],
    columns[4][1],
  ];
  return {
    columns,
    triangles,
    edges: [...edgeMap.values()],
    routeNodes,
    entries: [columns[0][0], columns[0][1], columns[0][2]],
  };
}

function transitionPath(plane, u, v, middlePoints) {
  return [quadPoint(plane.corners, u, v), ...middlePoints];
}

function renderNeuralSymbolicAttention(seed) {
  const { planes, invariant } = buildAttentionPlanes(seed);
  const lattice = buildSymbolicLattice(seed);
  const body = [];

  // Offset planes are drawn from back to front. Their incomplete matrix lines
  // and two activation cells make depth visible without turning into a UI.
  for (const plane of planes.slice().reverse()) {
    const fill = plane.index % 2 === 0 ? PALETTE.paper : PALETTE.paperDeep;
    const fillOpacity = plane.index % 2 === 0 ? 0.11 : 0.18;
    const stroke = plane.index % 2 === 0 ? PALETTE.ink : PALETTE.secondary;
    body.push(planeElement(plane.corners, fill, fillOpacity, stroke, 1.7, 0.8));
    for (const cell of plane.cells) {
      const fillColor = plane.index % 2 === 0 ? PALETTE.paperDeep : PALETTE.clay;
      const strokeColor = plane.index % 2 === 0 ? PALETTE.soft : PALETTE.secondary;
      body.push(polygonElement(cell.points, fillColor, plane.index % 2 === 0 ? 0.7 : 0.2, strokeColor, 1.05, 'neural-cell'));
    }
    for (const segment of plane.grid) {
      body.push(pathElement(segment, PALETTE.soft, 1.02, 0.45, 'formal', 'neural-grid'));
    }
    for (const activation of plane.activation) {
      const strokeColor = plane.index % 2 === 0 ? PALETTE.ink : PALETTE.clay;
      body.push(pathElement(activation, strokeColor, 1.32, 0.62, 'formal', 'neural-cell'));
    }
  }

  // Only two selected correspondences are carried through the depth stack;
  // they are structural links, not arrows or a dense network.
  for (let anchorIndex = 0; anchorIndex < 2; anchorIndex += 1) {
    const correspondence = planes.map((plane) => plane.correspondenceAnchors[anchorIndex]);
    body.push(pathElement(correspondence, PALETTE.secondary, 1.15, 0.42, 'smooth', 'neural-correspondence'));
  }

  // The seam is a quiet narrowing between the representation stack and the
  // symbolic lattice. The central passage is reserved for the invariant.
  body.push(pathElement(
    transitionPath(planes[1], 0.9, 0.27, [
      { x: 820, y: 292 },
      { x: 878, y: 382 },
      { x: 938, y: 425 },
      lattice.entries[0],
    ]),
    PALETTE.ink,
    1.45,
    0.58,
    'smooth',
    'neural-seam',
  ));
  body.push(pathElement(
    transitionPath(planes[4], 0.9, 0.73, [
      { x: 850, y: 708 },
      { x: 886, y: 620 },
      { x: 938, y: 575 },
      lattice.entries[2],
    ]),
    PALETTE.secondary,
    1.45,
    0.58,
    'smooth',
    'neural-seam',
  ));

  // State faces are pale and sparse, with only a few clay facets to establish
  // a material hierarchy before the complete edge topology is drawn.
  for (let index = 0; index < lattice.triangles.length; index += 1) {
    const triangle = lattice.triangles[index];
    const fill = index % 11 === 0 || index % 17 === 0
      ? PALETTE.clay
      : index % 2 === 0
        ? PALETTE.paperDeep
        : PALETTE.paper;
    const opacity = fill === PALETTE.clay ? 0.2 : fill === PALETTE.paperDeep ? 0.68 : 0.22;
    body.push(polygonElement(triangle, fill, opacity, 'none', 0, 'neural-face'));
  }

  // Candidate state traversals keep the right side exhaustive without adding
  // node dots or a literal flowchart. Their low opacity lets the topology lead.
  const columns = lattice.columns;
  const branches = [
    [columns[0][0], columns[1][0], columns[2][0], columns[3][0], columns[4][0]],
    [columns[0][1], columns[1][1], columns[2][1], columns[3][1], columns[4][1]],
    [columns[0][1], columns[1][1], columns[2][2], columns[3][2], columns[4][1]],
    [columns[0][1], columns[1][2], columns[2][3], columns[3][2], columns[4][1]],
    [columns[0][2], columns[1][3], columns[2][4], columns[3][3], columns[4][2]],
  ];
  const branchColors = [PALETTE.secondary, PALETTE.soft, PALETTE.clay, PALETTE.soft, PALETTE.secondary];
  branches.forEach((branch, index) => {
    body.push(pathElement(branch, branchColors[index], 1.12, index === 2 ? 0.28 : 0.2, 'formal', 'neural-branch'));
  });

  for (let edgeIndex = 0; edgeIndex < lattice.edges.length; edgeIndex += 1) {
    const edge = lattice.edges[edgeIndex];
    const boundary = edge.triangles.length === 1;
    const stroke = boundary
      ? PALETTE.ink
      : edgeIndex % 5 === 0
        ? PALETTE.secondary
        : PALETTE.soft;
    body.push(pathElement(
      [edge.first, edge.second],
      stroke,
      boundary ? 2.08 : 1.08,
      boundary ? 0.84 : 0.6,
      'formal',
      'neural-edge',
    ));
  }

  // One exact red lineage survives every regime: selected plane cells, seam,
  // then adjacent symbolic states on the formal lattice.
  const redPath = [
    ...invariant,
    { x: 782, y: 500 },
    { x: 900, y: 500 },
    lattice.entries[1],
    ...lattice.routeNodes.slice(1),
  ];
  body.push(pathElement(redPath, PALETTE.red, 3.6, 0.97, 'formal', 'neural-invariant'));

  return svgDocument(seed, body.join(''));
}

export const neuralSymbolicAttentionStudy = Object.freeze({
  slug: 'neural-symbolic-attention',
  title: 'Neural Symbolic Attention',
  description: 'Perspective attention planes compress selected correspondences into an exhaustive symbolic state lattice.',
  darkPreserveColors: Object.freeze(['#ca2121']),
  generate: (seed = 0x6a77d21) => renderNeuralSymbolicAttention(seed),
});

export const neuralSymbolicAttentionStudies = Object.freeze([neuralSymbolicAttentionStudy]);
