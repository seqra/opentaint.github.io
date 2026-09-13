// Layered representation → invariant → exhaustive search.
//
// The left side is a small stack of offset representation planes. Each plane
// keeps only a few structural marks, so the stack reads as model layers rather
// than as a literal diagram. A single invariant survives the stack and enters
// a faceted search lattice whose complete branching suggests exhaustive
// program analysis.

const WIDTH = 1600;
const HEIGHT = 1000;
const VERSION = 'agent-distillation-layer-search-1.0.0';

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

function polylinePathD(points) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point.x)} ${f(point.y)}`)
    .join(' ');
}

function smoothPathD(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${f(points[0].x)} ${f(points[0].y)}`;
  if (points.length === 2) return polylinePathD(points);
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

function closedPathD(points) {
  if (!points.length) return '';
  return `${polylinePathD(points)} Z`;
}

function pathElement(points, stroke, width, opacity, mode = 'formal', className = '') {
  if (points.length < 2) return '';
  const d = mode === 'smooth' ? smoothPathD(points) : polylinePathD(points);
  const classAttribute = className ? ` class="${className}"` : '';
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round"${classAttribute}/>`;
}

function planeElement(points, fill, fillOpacity, stroke, width, opacity) {
  return `<path d="${closedPathD(points)}" fill="${fill}" fill-opacity="${f(fillOpacity)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linejoin="round" class="layer-plane"/>`;
}

function polygonElement(points, fill, opacity, stroke = 'none', width = 0, className = '') {
  const coordinates = points.map((point) => `${f(point.x)},${f(point.y)}`).join(' ');
  const classAttribute = className ? ` class="${className}"` : '';
  return `<polygon points="${coordinates}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(width)}" stroke-linejoin="round"${classAttribute}/>`;
}

function svgDocument(seed, body) {
  const slug = 'agent-review-distillation';
  const title = 'Agent review distillation';
  const description = 'Offset representation layers resolve one invariant into a faceted lattice of exhaustive formal search.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${slug}-title ${slug}-description" data-generator="topology-agent-review-distillation-layer-search" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${slug}">
  <title id="${slug}-title">${escapeXml(title)}</title>
  <desc id="${slug}-description">${escapeXml(description)}</desc>
  <style>
    [data-theme="dark"] .layer-plane { stroke-width: 3.1px !important; fill-opacity: 0.48 !important; }
    [data-theme="dark"] .layer-grid { stroke-width: 1.95px !important; }
    [data-theme="dark"] .layer-active { stroke-width: 2.35px !important; opacity: 0.92 !important; }
    [data-theme="dark"] .formal-face { opacity: 0.58 !important; }
    [data-theme="dark"] .formal-edge { stroke-width: 2.25px !important; }
    [data-theme="dark"] .search-branch { stroke-width: 2.35px !important; opacity: 0.48 !important; }
    [data-theme="dark"] .transition-branch { stroke-width: 2.65px !important; }
    [data-theme="dark"] .invariant { stroke-width: 5.3px !important; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.paper}"/>
  ${body}
</svg>
`;
}

const BASE_LAYER = Object.freeze([
  Object.freeze({ x: 92, y: 232 }),
  Object.freeze({ x: 500, y: 136 }),
  Object.freeze({ x: 770, y: 344 }),
  Object.freeze({ x: 330, y: 472 }),
]);

const LAYER_OFFSETS = Object.freeze([
  Object.freeze({ x: 0, y: 0 }),
  Object.freeze({ x: 26, y: 66 }),
  Object.freeze({ x: 52, y: 132 }),
  Object.freeze({ x: 78, y: 198 }),
  Object.freeze({ x: 104, y: 264 }),
]);

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

function layerCell(corners, u, v, width, height) {
  return [
    quadPoint(corners, u, v),
    quadPoint(corners, u + width, v),
    quadPoint(corners, u + width, v + height),
    quadPoint(corners, u, v + height),
  ];
}

function buildRepresentationLayers(seed) {
  const random = rng(deriveSeed(seed, 'representation-layers'));
  const layers = [];
  for (let index = 0; index < LAYER_OFFSETS.length; index += 1) {
    const offset = LAYER_OFFSETS[index];
    const corners = BASE_LAYER.map((point, cornerIndex) => ({
      x: point.x + offset.x + (random() - 0.5) * 8 + (cornerIndex === 2 ? index * 1.2 : 0),
      y: point.y + offset.y + (random() - 0.5) * 8,
    }));
    const shift = (index % 3 - 1) * 0.025;
    const cells = [
      { u: 0.14 + shift, v: 0.2 + (index % 2) * 0.04, w: 0.17, h: 0.14 },
      { u: 0.57 - shift, v: 0.5 - (index % 3) * 0.025, w: 0.16, h: 0.13 },
    ].map((cell) => ({
      ...cell,
      points: layerCell(corners, cell.u, cell.v, cell.w, cell.h),
    }));
    const gridTemplate = [
      [0.11, 0.2, 0.4],
      [0.49, 0.2, 0.86],
      [0.08, 0.45, 0.33],
      [0.43, 0.45, 0.78],
      [0.17, 0.72, 0.47],
      [0.57, 0.72, 0.9],
      [0.27, 0.14, 0.27, 0.35],
      [0.68, 0.56, 0.68, 0.85],
      [0.38, 0.3, 0.58, 0.65],
    ];
    const grid = gridTemplate
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
    const active = [
      [
        quadPoint(corners, 0.17 + shift, 0.3),
        quadPoint(corners, 0.28 + shift, 0.38),
        quadPoint(corners, 0.4 + shift, 0.29),
      ],
      [
        quadPoint(corners, 0.61 - shift, 0.56),
        quadPoint(corners, 0.71 - shift, 0.64),
        quadPoint(corners, 0.82 - shift, 0.52),
      ],
    ];
    layers.push({ corners, cells, grid, active, index });
  }

  // The same compact rule is sampled at a different position on each plane;
  // its gentle turn is the only red mark on the representation side.
  const invariantUv = [
    [0.28, 0.36],
    [0.4, 0.42],
    [0.53, 0.47],
    [0.68, 0.5],
    [0.82, 0.53],
  ];
  const invariant = layers.map((layer, index) => quadPoint(
    layer.corners,
    invariantUv[index][0],
    invariantUv[index][1],
  ));
  return { layers, invariant };
}

function buildSearchLattice(seed) {
  const random = rng(deriveSeed(seed, 'formal-search-lattice'));
  const xPositions = [1015, 1135, 1265, 1400, 1525];
  const yBlueprints = [
    [365, 438, 510, 582, 655],
    [285, 390, 500, 610, 720],
    [215, 355, 500, 645, 785],
    [285, 390, 500, 610, 720],
    [365, 438, 510, 582, 655],
  ];
  const columns = yBlueprints.map((ys, columnIndex) => ys.map((y, rowIndex) => ({
    id: `c${columnIndex}r${rowIndex}`,
    x: xPositions[columnIndex] + (random() - 0.5) * 14,
    y: y + (random() - 0.5) * 12,
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
    const triangleIndex = triangles.length;
    triangles.push([first, second, third]);
    addEdge(first, second, triangleIndex);
    addEdge(second, third, triangleIndex);
    addEdge(third, first, triangleIndex);
  }

  // Five aligned columns make a diamond silhouette while the alternating
  // diagonals give every cell a real shared topology instead of loose shards.
  for (let columnIndex = 0; columnIndex < columns.length - 1; columnIndex += 1) {
    for (let rowIndex = 0; rowIndex < columns[columnIndex].length - 1; rowIndex += 1) {
      const first = columns[columnIndex][rowIndex];
      const second = columns[columnIndex + 1][rowIndex];
      const third = columns[columnIndex][rowIndex + 1];
      const fourth = columns[columnIndex + 1][rowIndex + 1];
      if ((columnIndex + rowIndex) % 2 === 0) {
        addTriangle(first, second, fourth);
        addTriangle(first, fourth, third);
      } else {
        addTriangle(first, second, third);
        addTriangle(second, fourth, third);
      }
    }
  }

  // A single route is selected on actual lattice edges, with a few measured
  // turns that make it read as a repeatable scan rather than an ornament.
  const routeNodes = [
    columns[0][2],
    columns[1][2],
    columns[1][3],
    columns[2][3],
    columns[2][2],
    columns[3][2],
    columns[3][1],
    columns[4][1],
  ];
  return {
    columns,
    triangles,
    edges: [...edgeMap.values()],
    routeNodes,
    entries: [columns[0][0], columns[0][2], columns[0][4]],
  };
}

function transitionPath(layers, layerIndex, u, v, points) {
  return [quadPoint(layers[layerIndex].corners, u, v), ...points];
}

function renderAgentDistillation(seed) {
  const { layers, invariant } = buildRepresentationLayers(seed);
  const lattice = buildSearchLattice(seed);
  const body = [];

  // Render the back plane first. Offset translucent planes retain a shared
  // silhouette while their broken grids and selected cells remain legible.
  for (const layer of layers.slice().reverse()) {
    const fill = layer.index % 2 === 0 ? PALETTE.paper : PALETTE.paperDeep;
    const fillOpacity = layer.index % 2 === 0 ? 0.12 : 0.2;
    const stroke = layer.index % 2 === 0 ? PALETTE.ink : PALETTE.secondary;
    body.push(planeElement(layer.corners, fill, fillOpacity, stroke, 1.7, 0.78));
    for (const cell of layer.cells) {
      const activeFill = layer.index % 2 === 0 ? PALETTE.paperDeep : PALETTE.clay;
      const activeStroke = layer.index % 2 === 0 ? PALETTE.soft : PALETTE.secondary;
      body.push(polygonElement(cell.points, activeFill, layer.index % 2 === 0 ? 0.68 : 0.22, activeStroke, 1.05, 'layer-active'));
    }
    for (const segment of layer.grid) {
      body.push(pathElement(segment, PALETTE.soft, 1.05, 0.46, 'formal', 'layer-grid'));
    }
    for (const active of layer.active) {
      const activeStroke = layer.index % 2 === 0 ? PALETTE.ink : PALETTE.clay;
      body.push(pathElement(active, activeStroke, 1.35, 0.64, 'formal', 'layer-active'));
    }
  }

  // Two neutral selections leave the stack at distinct depths. The middle
  // selection is carried by the red invariant below.
  body.push(pathElement(
    transitionPath(layers, 1, 0.9, 0.28, [
      { x: 820, y: 275 },
      { x: 930, y: 365 },
      lattice.entries[0],
    ]),
    PALETTE.ink,
    1.55,
    0.62,
    'smooth',
    'transition-branch',
  ));
  body.push(pathElement(
    transitionPath(layers, 4, 0.9, 0.72, [
      { x: 850, y: 720 },
      { x: 935, y: 650 },
      lattice.entries[2],
    ]),
    PALETTE.secondary,
    1.55,
    0.62,
    'smooth',
    'transition-branch',
  ));

  // Formal search faces: sparse clay accents interrupt the neutral planes,
  // while shared edges establish the complete combinatorial field.
  for (let index = 0; index < lattice.triangles.length; index += 1) {
    const triangle = lattice.triangles[index];
    const fill = index % 13 === 0 || index % 17 === 0
      ? PALETTE.clay
      : index % 2 === 0
        ? PALETTE.paperDeep
        : PALETTE.paper;
    const opacity = fill === PALETTE.clay ? 0.2 : fill === PALETTE.paperDeep ? 0.68 : 0.24;
    body.push(polygonElement(triangle, fill, opacity, 'none', 0, 'formal-face'));
  }

  // A handful of complete candidate traversals make the lattice read as an
  // exhaustive search space. They are intentionally quiet under the edgework.
  const columns = lattice.columns;
  const searchRoutes = [
    [columns[0][0], columns[1][0], columns[2][0], columns[3][0], columns[4][0]],
    [columns[0][1], columns[1][1], columns[2][1], columns[3][1], columns[4][1]],
    [columns[0][2], columns[1][2], columns[2][2], columns[3][2], columns[4][2]],
    [columns[0][3], columns[1][3], columns[2][3], columns[3][3], columns[4][3]],
    [columns[0][4], columns[1][4], columns[2][4], columns[3][4], columns[4][4]],
    [columns[0][2], columns[1][2], columns[1][1], columns[1][0], columns[2][0], columns[3][0], columns[4][0]],
    [columns[0][2], columns[1][2], columns[1][3], columns[1][4], columns[2][4], columns[3][4], columns[4][4]],
  ];
  const branchColors = [PALETTE.secondary, PALETTE.soft, PALETTE.clay, PALETTE.soft, PALETTE.secondary, PALETTE.ink, PALETTE.ink];
  searchRoutes.forEach((route, index) => {
    body.push(pathElement(route, branchColors[index], 1.2, index === 2 ? 0.3 : 0.22, 'formal', 'search-branch'));
  });

  for (const edge of lattice.edges) {
    const boundary = edge.triangles.length === 1;
    const stroke = boundary
      ? PALETTE.ink
      : edge.first.id.charCodeAt(2) % 4 === 0
        ? PALETTE.secondary
        : PALETTE.soft;
    body.push(pathElement(
      [edge.first, edge.second],
      stroke,
      boundary ? 2.15 : 1.12,
      boundary ? 0.86 : 0.62,
      'formal',
      'formal-edge',
    ));
  }

  // The invariant is one continuous red lineage: sampled on each layer,
  // compressed through the seam, then followed along real lattice vertices.
  const redTail = [
    ...invariant,
    { x: 780, y: 500 },
    { x: 900, y: 500 },
    lattice.entries[1],
    ...lattice.routeNodes.slice(1),
  ];
  body.push(pathElement(redTail, PALETTE.red, 3.7, 0.97, 'formal', 'invariant'));

  return svgDocument(seed, body.join(''));
}

export const contemporaryStudy = Object.freeze({
  slug: 'agent-review-distillation',
  title: 'Agent Review Distillation',
  description: 'Offset representation layers resolve one invariant into an exhaustive faceted search lattice.',
  generate: (seed = 0xa91d571) => renderAgentDistillation(seed),
});

export const agentDistillationStudies = Object.freeze([contemporaryStudy]);
