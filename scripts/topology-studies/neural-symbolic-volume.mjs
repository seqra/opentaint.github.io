/**
 * Neural-symbolic volume.
 *
 * A deterministic, non-literal transition from irregular latent slices to
 * faceted constraint surfaces and a connected triangulated search field. The
 * same small set of role colors is used by the topology-study runner, while
 * the embedded dark rules increase physical line weight and fill presence.
 */

const WIDTH = 1600;
const HEIGHT = 1000;
const TAU = Math.PI * 2;
const VERSION = 'neural-symbolic-volume-1.0.0';
const SOURCE = 'OpenTaint original procedural study';

const PALETTE = Object.freeze({
  paper: '#f7f7f5',
  paperDeep: '#ececea',
  ink: '#191719',
  soft: '#53484a',
  secondary: '#8d8582',
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
  return (hash >>> 0) || 1;
}

function deriveSeed(seed, label) {
  return hashSeed(`${seed}:${label}`);
}

function f(value) {
  const rounded = Number(value.toFixed(2));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function lerp(first, second, amount) {
  return {
    x: first.x + (second.x - first.x) * amount,
    y: first.y + (second.y - first.y) * amount,
  };
}

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function pathD(points, close = false) {
  if (!points.length) return '';
  const commands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${f(point.x)} ${f(point.y)}`);
  return `${commands.join(' ')}${close ? ' Z' : ''}`;
}

function line(first, second, stroke, width = 1, opacity = 1, className = '') {
  const classAttribute = className ? ` class="${className}"` : '';
  return `<line x1="${f(first.x)}" y1="${f(first.y)}" x2="${f(second.x)}" y2="${f(second.y)}" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round"${classAttribute}/>`;
}

function path(points, stroke, width = 1, opacity = 1, className = '') {
  if (points.length < 2) return '';
  const classAttribute = className ? ` class="${className}"` : '';
  return `<path d="${pathD(points)}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" opacity="${f(opacity)}" stroke-linecap="round" stroke-linejoin="round"${classAttribute}/>`;
}

function polygon(points, fill, opacity = 1, stroke = 'none', width = 0, className = '') {
  if (points.length < 3) return '';
  const classAttribute = className ? ` class="${className}"` : '';
  return `<path d="${pathD(points, true)}" fill="${fill}" opacity="${f(opacity)}" stroke="${stroke}" stroke-width="${f(width)}" stroke-linejoin="round"${classAttribute}/>`;
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
  const slug = 'neural-symbolic-volume';
  const title = 'Neural-symbolic volume';
  const description = 'Irregular latent slices fold into explicit constraint surfaces and a connected triangulated search volume.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${slug}-title ${slug}-description" data-generator="opentaint-neural-symbolic-volume" data-generator-version="${VERSION}" data-seed="${seed >>> 0}" data-study="${slug}" data-source="${escapeXml(SOURCE)}">
  <title id="${slug}-title">${escapeXml(title)}</title>
  <desc id="${slug}-description">${escapeXml(description)}</desc>
  <style>
    /* Dark output gains physical weight as well as warm light contrast. */
    [data-theme="dark"] .volume-boundary { stroke-width: 2.25px !important; opacity: 0.9 !important; }
    [data-theme="dark"] .volume-inner { stroke-width: 1.22px !important; opacity: 0.7 !important; }
    [data-theme="dark"] .volume-side { stroke-width: 1.45px !important; opacity: 0.78 !important; }
    [data-theme="dark"] .volume-fill-neutral { opacity: 0.2 !important; }
    [data-theme="dark"] .volume-fill-clay { opacity: 0.25 !important; }
    [data-theme="dark"] .volume-fill-red { opacity: 0.25 !important; }
    [data-theme="dark"] .surface-boundary { stroke-width: 2.45px !important; opacity: 0.92 !important; }
    [data-theme="dark"] .surface-inner { stroke-width: 1.3px !important; opacity: 0.74 !important; }
    [data-theme="dark"] .surface-fill-neutral { opacity: 0.22 !important; }
    [data-theme="dark"] .surface-fill-clay { opacity: 0.28 !important; }
    [data-theme="dark"] .surface-fill-red { opacity: 0.3 !important; }
    [data-theme="dark"] .search-boundary { stroke-width: 2.65px !important; opacity: 0.94 !important; }
    [data-theme="dark"] .search-edge { stroke-width: 1.25px !important; opacity: 0.74 !important; }
    [data-theme="dark"] .search-fill { opacity: 0.18 !important; }
    [data-theme="dark"] .search-fill-clay { opacity: 0.28 !important; }
    [data-theme="dark"] .search-fill-red { opacity: 0.3 !important; }
    [data-theme="dark"] .red-thread { stroke-width: 4.8px !important; opacity: 0.98 !important; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.paper}"/>
  ${body}
</svg>
`;
}

const SLICE_SHAPE = Object.freeze([
  Object.freeze({ x: -232, y: -76 }),
  Object.freeze({ x: -170, y: -218 }),
  Object.freeze({ x: -18, y: -264 }),
  Object.freeze({ x: 158, y: -208 }),
  Object.freeze({ x: 238, y: -42 }),
  Object.freeze({ x: 184, y: 150 }),
  Object.freeze({ x: 34, y: 246 }),
  Object.freeze({ x: -148, y: 212 }),
  Object.freeze({ x: -250, y: 78 }),
]);

function trianglePoints(nodes, triangle) {
  return triangle.map((index) => nodes[index]);
}

function sliceTriangles(nodes, centerIndex) {
  const triangles = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    triangles.push([centerIndex, index, index + 1]);
  }
  triangles.push([centerIndex, nodes.length - 1, 0]);
  return triangles;
}

function buildLatentVolume(seed) {
  const random = rng(deriveSeed(seed, 'latent-volume'));
  const slices = [];
  const origin = { x: 280, y: 580 };
  const depth = { x: 67, y: -54 };
  for (let sliceIndex = 0; sliceIndex < 5; sliceIndex += 1) {
    const amount = sliceIndex / 4;
    const center = {
      x: origin.x + depth.x * sliceIndex,
      y: origin.y + depth.y * sliceIndex,
    };
    const scale = 1 - amount * 0.12;
    const boundary = SLICE_SHAPE.map((point, pointIndex) => ({
      x: center.x + point.x * scale + (random() - 0.5) * 16 + Math.sin(pointIndex * 1.7 + sliceIndex) * 4,
      y: center.y + point.y * scale + (random() - 0.5) * 16 + Math.cos(pointIndex * 1.2 - sliceIndex) * 4,
    }));
    const centerPoint = {
      x: center.x + (random() - 0.5) * 34,
      y: center.y + (random() - 0.5) * 34,
    };
    const nodes = [...boundary, centerPoint];
    const centerIndex = nodes.length - 1;
    const triangles = sliceTriangles(nodes, centerIndex);
    const activationStart = (sliceIndex * 2 + Math.floor(random() * 3)) % boundary.length;
    const activationCount = 2 + (sliceIndex % 2);
    const active = new Set();
    for (let offset = 0; offset < activationCount; offset += 1) {
      active.add((activationStart + offset) % boundary.length);
    }
    slices.push({ boundary, nodes, triangles, center, active, index: sliceIndex });
  }
  return { slices, depth };
}

function renderLatentVolume(volume, body) {
  const { slices } = volume;
  // Back-to-front slice planes keep the depth readable without rectangular
  // cards. Each plane is an uneven ring with a small internal fan.
  for (const slice of slices.slice().reverse()) {
    const planeFill = slice.index % 2 === 0 ? PALETTE.paper : PALETTE.paperDeep;
    body.push(polygon(slice.boundary, planeFill, slice.index % 2 === 0 ? 0.08 : 0.13, PALETTE.secondary, 1.5, 'volume-boundary'));
    for (let triangleIndex = 0; triangleIndex < slice.triangles.length; triangleIndex += 1) {
      const triangle = slice.triangles[triangleIndex];
      const activeBoundary = slice.active.has(triangleIndex);
      const redActivation = slice.index === 2 && triangleIndex === 2;
      if (!activeBoundary && !redActivation && triangleIndex % 3 !== slice.index % 3) continue;
      const fill = redActivation
        ? PALETTE.red
        : activeBoundary
        ? slice.index % 2 === 0 ? PALETTE.paperDeep : PALETTE.clay
        : PALETTE.paperDeep;
      const opacity = redActivation ? 0.16 : activeBoundary ? slice.index % 2 === 0 ? 0.24 : 0.18 : 0.1;
      const className = redActivation
        ? 'volume-fill-red'
        : activeBoundary
        ? slice.index % 2 === 0 ? 'volume-fill-neutral' : 'volume-fill-clay'
        : 'volume-fill-neutral';
      body.push(polygon(trianglePoints(slice.nodes, triangle), fill, opacity, 'none', 0, className));
    }
    for (let boundaryIndex = 0; boundaryIndex < slice.boundary.length; boundaryIndex += 1) {
      const first = slice.boundary[boundaryIndex];
      const second = slice.boundary[(boundaryIndex + 1) % slice.boundary.length];
      body.push(line(first, second, PALETTE.soft, 0.82, 0.38, 'volume-inner'));
    }
    for (let triangleIndex = 0; triangleIndex < slice.triangles.length; triangleIndex += 1) {
      if (triangleIndex % 3 === (slice.index + 1) % 3) continue;
      const triangle = trianglePoints(slice.nodes, slice.triangles[triangleIndex]);
      body.push(path([triangle[0], triangle[2]], PALETTE.soft, 0.72, 0.28, 'volume-inner'));
    }
  }

  // A few corresponding seams make the slices read as one latent volume.
  const seamIndices = [0, 2, 4, 6, 8];
  for (const seamIndex of seamIndices) {
    for (let sliceIndex = 0; sliceIndex < slices.length - 1; sliceIndex += 1) {
      body.push(line(
        slices[sliceIndex].boundary[seamIndex],
        slices[sliceIndex + 1].boundary[seamIndex],
        PALETTE.secondary,
        1.05,
        0.42,
        'volume-side',
      ));
    }
  }

  // One boundary seam survives all five latent slices as the restrained red
  // signal. It is part of the volume topology, not an overlay arrow.
  const redSeam = slices.map((slice) => slice.boundary[2]);
  body.push(path(redSeam, PALETTE.red, 2.9, 0.88, 'red-thread'));
}

function surfaceShape(seed, surfaceIndex) {
  const random = rng(deriveSeed(seed, `constraint-surface-${surfaceIndex}`));
  const base = [
    { x: -138, y: -192 },
    { x: 8, y: -236 },
    { x: 154, y: -126 },
    { x: 174, y: 54 },
    { x: 70, y: 210 },
    { x: -96, y: 226 },
    { x: -172, y: 72 },
  ];
  const center = surfaceIndex === 0 ? { x: 720, y: 548 } : { x: 846, y: 420 };
  const scale = surfaceIndex === 0 ? 1 : 0.82;
  const skew = surfaceIndex === 0 ? 0 : 24;
  const boundary = base.map((point, index) => ({
    x: center.x + point.x * scale + skew * (point.y / 240) + (random() - 0.5) * 12,
    y: center.y + point.y * scale + (random() - 0.5) * 12,
  }));
  const middle = {
    x: center.x + (random() - 0.5) * 26,
    y: center.y + (random() - 0.5) * 26,
  };
  const nodes = [...boundary, middle];
  const triangles = sliceTriangles(nodes, nodes.length - 1);
  return { boundary, nodes, triangles, center, index: surfaceIndex };
}

function renderConstraintSurfaces(seed, body) {
  const surfaces = [surfaceShape(seed, 0), surfaceShape(seed, 1)];
  for (const surface of surfaces.slice().reverse()) {
    body.push(polygon(
      surface.boundary,
      surface.index === 0 ? PALETTE.paper : PALETTE.paperDeep,
      surface.index === 0 ? 0.08 : 0.12,
      PALETTE.ink,
      1.7,
      'surface-boundary',
    ));
    for (let triangleIndex = 0; triangleIndex < surface.triangles.length; triangleIndex += 1) {
      const triangle = trianglePoints(surface.nodes, surface.triangles[triangleIndex]);
      const redFace = surface.index === 1 && triangleIndex === 4;
      const clayFace = (triangleIndex + surface.index * 2) % 5 === 1;
      const neutralFace = triangleIndex % 2 === surface.index % 2;
      if (!redFace && !clayFace && !neutralFace) continue;
      body.push(polygon(
        triangle,
        redFace ? PALETTE.red : clayFace ? PALETTE.clay : PALETTE.paperDeep,
        redFace ? 0.17 : clayFace ? 0.22 : 0.14,
        'none',
        0,
        redFace ? 'surface-fill-red' : clayFace ? 'surface-fill-clay' : 'surface-fill-neutral',
      ));
    }
    for (let triangleIndex = 0; triangleIndex < surface.triangles.length; triangleIndex += 1) {
      const triangle = trianglePoints(surface.nodes, surface.triangles[triangleIndex]);
      if ((triangleIndex + surface.index) % 3 === 0) continue;
      body.push(path([triangle[0], triangle[2]], PALETTE.soft, 0.88, 0.42, 'surface-inner'));
    }
  }

  // Corresponding vertices establish the folded, symbolic relation between
  // the two surfaces. Missing seams are intentional: the planes stay airy.
  const seams = [0, 2, 4, 6];
  for (const index of seams) {
    body.push(line(
      surfaces[0].boundary[index],
      surfaces[1].boundary[index],
      PALETTE.secondary,
      1.15,
      0.52,
      'surface-inner',
    ));
  }

  // A short red crease is shared by the two explicit surfaces.
  body.push(line(surfaces[0].boundary[2], surfaces[1].boundary[2], PALETTE.red, 2.9, 0.9, 'red-thread'));
  return surfaces;
}

function edgeKey(first, second) {
  return first.id < second.id ? `${first.id}|${second.id}` : `${second.id}|${first.id}`;
}

function buildSearchField(seed) {
  const random = rng(deriveSeed(seed, 'symbolic-search-field'));
  const xPositions = [1008, 1110, 1216, 1324, 1430, 1530];
  const yBlueprint = [288, 412, 536, 660, 784];
  const columns = xPositions.map((x, columnIndex) => yBlueprint.map((y, rowIndex) => ({
    id: `c${columnIndex}r${rowIndex}`,
    x: x + (random() - 0.5) * 18 + Math.sin(rowIndex * 1.6 + columnIndex) * 7,
    y: y + (random() - 0.5) * 20 + Math.cos(columnIndex * 1.35 - rowIndex) * 11,
  })));
  const triangles = [];
  const edgeMap = new Map();
  const addEdge = (first, second, triangleIndex) => {
    const key = edgeKey(first, second);
    if (!edgeMap.has(key)) edgeMap.set(key, { first, second, triangles: [] });
    edgeMap.get(key).triangles.push(triangleIndex);
  };
  const addTriangle = (first, second, third) => {
    const triangleIndex = triangles.length;
    triangles.push([first, second, third]);
    addEdge(first, second, triangleIndex);
    addEdge(second, third, triangleIndex);
    addEdge(third, first, triangleIndex);
  };
  for (let columnIndex = 0; columnIndex < columns.length - 1; columnIndex += 1) {
    for (let rowIndex = 0; rowIndex < yBlueprint.length - 1; rowIndex += 1) {
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
  const routeNodes = [
    columns[0][2],
    columns[1][2],
    columns[1][1],
    columns[2][1],
    columns[2][3],
    columns[3][3],
    columns[3][2],
    columns[4][2],
    columns[4][1],
    columns[5][1],
  ];
  return { columns, triangles, edges: [...edgeMap.values()], routeNodes };
}

function renderSearchField(field, body) {
  for (let index = 0; index < field.triangles.length; index += 1) {
    const triangle = field.triangles[index];
    const redFace = index === 3;
    const clayFace = index % 19 === 3 || index % 23 === 8;
    body.push(polygon(
      triangle,
      redFace ? PALETTE.red : clayFace ? PALETTE.clay : PALETTE.paperDeep,
      redFace ? 0.14 : clayFace ? 0.16 : 0.08,
      'none',
      0,
      redFace ? 'search-fill-red' : clayFace ? 'search-fill-clay' : 'search-fill',
    ));
  }

  for (const edge of field.edges) {
    const boundary = edge.triangles.length === 1;
    const stroke = boundary ? PALETTE.ink : PALETTE.soft;
    body.push(line(
      edge.first,
      edge.second,
      stroke,
      boundary ? 1.7 : 0.9,
      boundary ? 0.72 : 0.38,
      boundary ? 'search-boundary' : 'search-edge',
    ));
  }

  // The red thread follows real shared vertices in the connected search
  // triangulation; it has no arrowhead and does not float above the field.
  body.push(path(field.routeNodes, PALETTE.red, 3.25, 0.92, 'red-thread'));
}

function renderNeuralSymbolicVolume(seed = 0x9e5a11c) {
  const body = [];
  const volume = buildLatentVolume(seed);
  renderLatentVolume(volume, body);
  const surfaces = renderConstraintSurfaces(seed, body);
  const field = buildSearchField(seed);

  // Join only existing structural vertices across stages. These quiet seams
  // make the change of representation legible without turning it into an
  // instructional arrow or a row of boxes.
  body.push(line(
    volume.slices[4].boundary[4],
    surfaces[0].boundary[6],
    PALETTE.secondary,
    1.3,
    0.5,
    'volume-side',
  ));
  body.push(line(
    surfaces[1].boundary[2],
    field.routeNodes[0],
    PALETTE.secondary,
    1.25,
    0.5,
    'surface-inner',
  ));
  renderSearchField(field, body);

  return svgDocument(seed, body.join(''));
}

const study = Object.freeze({
  slug: 'neural-symbolic-volume',
  title: 'Neural-symbolic volume',
  description: 'Irregular latent slices fold into explicit constraint surfaces and a connected triangulated search volume.',
  source: SOURCE,
  // The red role is intentionally unchanged in the dark asset; the runner
  // may remap the neutral and clay roles but preserves this exact hex.
  darkPreserveColors: [PALETTE.red],
  generate: (seed = 0x9e5a11c) => renderNeuralSymbolicVolume(seed),
});

export const neuralSymbolicVolumeStudies = Object.freeze([study]);
