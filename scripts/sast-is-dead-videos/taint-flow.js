// Figure 2: sampling vs. exhaustive search over the same program. An agent
// checks the paths it picks, one at a time; taint analysis covers all of them.
import { buildFlowGraph } from "./flow-graph.js";
import { curve, ease, el, label, loopFade, progress, reveal } from "./kit.js";

const DURATION = 13;
const START = 0.6;
const EDGE_TIME = 0.36;
const TRACE_GAP = 0.45;
const LAYER_TIME = 2;
const PANEL = { width: 380, height: 390 };

const LAYOUTS = {
  wide: { width: 800, height: 390, panels: [{ x: 0, y: 0 }, { x: 420, y: 0 }] },
  tall: { width: 380, height: 800, panels: [{ x: 0, y: 0 }, { x: 0, y: 410 }] },
};

const COPY = {
  agent: { title: "An agent samples paths", result: (n) => `Checked 5 of ${n} paths. Found 2 of 3 bugs.` },
  proof: { title: "Taint analysis covers every path", result: (n) => `Covered all ${n} paths. Found all 3 bugs.` },
};

// Number of paths the data actually takes, from an entry point to wherever it
// stops: a dangerous call or a method that passes it no further.
const countPaths = (edges, layers) => {
  const memo = new Map();
  const from = (id) => {
    if (!memo.has(id)) {
      const out = edges.filter((edge) => edge.from === id);
      memo.set(id, out.length === 0 ? 1 : out.reduce((sum, edge) => sum + from(edge.to), 0));
    }
    return memo.get(id);
  };
  return layers[0].reduce((sum, id) => sum + from(id), 0);
};

const scale = (node, x, y, factor) =>
  node.setAttribute("transform", `translate(${x} ${y}) scale(${factor}) translate(${-x} ${-y})`);

const buildPanel = (svg, origin, colors, kind) => {
  const graph = buildFlowGraph({
    sizes: [5, 7, 8, 7, 4],
    box: { x: origin.x + 22, y: origin.y + 64, width: PANEL.width - 44, height: 228 },
    seed: 271,
    bugSources: [0, 2, 4],
  });
  const { nodes, edges, layers, bugPaths } = graph;
  const lastLayer = layers.length - 1;
  const g = el(svg, "g");
  label(g, origin.x + 4, origin.y + 26, COPY[kind].title, { size: 18, weight: 600, fill: colors.ink });
  label(g, origin.x + 4, origin.y + 326, "Entry points", { size: 14, fill: colors.muted });
  label(g, origin.x + PANEL.width - 4, origin.y + 326, "Dangerous calls", { size: 14, fill: colors.muted, anchor: "end" });
  edges.forEach((edge) => el(g, "path", { d: curve(nodes[edge.from], nodes[edge.to]), fill: "none", stroke: colors.faint, "stroke-width": 1.6 }));

  const bugEdges = new Set(bugPaths.flat());
  // Light gray shows every potential path. Only bug flows carry data into a
  // dangerous call; every other flow stops one step before it.
  const sinkIds = new Set(layers[lastLayer]);
  const flows = (edge) => bugEdges.has(edge.id) || !sinkIds.has(edge.to);
  const overlay = el(svg, "g");
  const drawn = edges.map((edge) =>
    el(overlay, "path", { d: curve(nodes[edge.from], nodes[edge.to]), fill: "none", "stroke-width": 3.2, "stroke-linecap": "round", pathLength: 1 }),
  );
  const shapeOf = (parent, node, attrs) => {
    if (node.layer === 0) return el(parent, "circle", { cx: node.x, cy: node.y, r: 7.5, "stroke-width": 1.8, ...attrs });
    return el(parent, "rect", { x: node.x - 11, y: node.y - 7, width: 22, height: 14, rx: 4, "stroke-width": 1.6, ...attrs });
  };
  const inner = nodes.filter((node) => node.layer < lastLayer);
  inner.forEach((node) => shapeOf(g, node, { fill: colors.node, stroke: colors.faint }));
  const shapes = new Map(inner.map((node) => [node.id, shapeOf(overlay, node, {})]));
  const top = el(svg, "g");
  const sinks = new Map(layers[lastLayer].map((id) => [id, el(top, "rect", { x: nodes[id].x - 12, y: nodes[id].y - 11, width: 24, height: 22, rx: 5 })]));
  const sinkOf = (path) => edges[path[path.length - 1]].to;
  const paintSinks = (reachedAt) =>
    sinks.forEach((rect, id) => rect.setAttribute("fill", reachedAt.has(id) ? colors.red : colors.ink));
  const halos = bugPaths.map((path) => {
    const source = nodes[edges[path[0]].from];
    return { source, ring: el(overlay, "circle", { cx: source.x, cy: source.y, r: 14, fill: "none", stroke: colors.red, "stroke-width": 2.6 }) };
  });
  const cursor = el(overlay, "circle", { r: 10, fill: "none", stroke: colors.ink, "stroke-width": 2.2 });
  const result = label(overlay, origin.x + 4, origin.y + 370, COPY[kind].result(countPaths(edges.filter(flows), layers)), { size: 16, weight: 500, fill: colors.ink });

  // Agent schedule: five whole paths, two of which happen to carry a bug.
  const cleanPath = (source, offset) => {
    let at = source;
    const trail = [];
    for (let step = 0; step < lastLayer; step += 1) {
      const out = edges.filter((edge) => edge.from === at && flows(edge));
      const clean = out.filter((edge) => !bugEdges.has(edge.id));
      const options = clean.length > 0 ? clean : out;
      if (options.length === 0) break;
      const edge = options[(offset + step) % options.length];
      trail.push(edge.id);
      at = edge.to;
    }
    return trail;
  };
  const sources = layers[0];
  const traces = [
    { edges: cleanPath(sources[1], 0), bug: null },
    { edges: bugPaths[0], bug: 0 },
    { edges: cleanPath(sources[3], 1), bug: null },
    { edges: bugPaths[1], bug: 1 },
    { edges: cleanPath(sources[1], 1), bug: null },
  ];
  let clock = START;
  const steps = traces.flatMap((trace) => {
    const begin = clock;
    const end = begin + trace.edges.length * EDGE_TIME;
    clock = end + TRACE_GAP;
    return trace.edges.map((id, i) => ({ id, t: begin + i * EDGE_TIME, end, bug: trace.bug }));
  });
  const agentEnd = clock;
  const proofEnd = START + (lastLayer - 1) * LAYER_TIME + LAYER_TIME * 0.9;
  const resultAt = Math.max(agentEnd, proofEnd) + 0.2;

  const renderAgent = (t) => {
    const read = new Set();
    drawn.forEach((path) => path.setAttribute("opacity", 0));
    let active = null;
    steps.forEach((step) => {
      const amount = progress(t, step.t, EDGE_TIME);
      if (amount <= 0) return;
      const path = drawn[step.id];
      const done = t >= step.end;
      path.setAttribute("opacity", 1);
      path.setAttribute("stroke", done ? (step.bug !== null ? colors.red : colors.muted) : colors.ink);
      reveal(path, ease(amount));
      read.add(edges[step.id].from);
      if (amount >= 1) read.add(edges[step.id].to);
      if (amount < 1) active = { path, amount: ease(amount) };
    });
    if (active) {
      const point = active.path.getPointAtLength(active.path.getTotalLength() * active.amount);
      cursor.setAttribute("cx", point.x);
      cursor.setAttribute("cy", point.y);
    }
    cursor.setAttribute("opacity", active ? 1 : 0);
    shapes.forEach((shape, id) => {
      shape.setAttribute("opacity", read.has(id) ? 1 : 0);
      shape.setAttribute("fill", colors.muted);
      shape.setAttribute("stroke", colors.muted);
    });
    const found = traces.filter((trace) => trace.bug !== null && t >= steps.find((s) => s.bug === trace.bug).end);
    paintSinks(new Set(found.map((trace) => sinkOf(trace.edges))));
    halos.forEach((halo, i) => {
      const trace = traces.find((item) => item.bug === i);
      const amount = trace ? progress(t, steps.find((s) => s.bug === i).end, 0.35) : 0;
      halo.ring.setAttribute("opacity", amount);
      scale(halo.ring, halo.source.x, halo.source.y, 0.6 + 0.4 * ease(amount));
    });
  };

  const renderProof = (t) => {
    cursor.setAttribute("opacity", 0);
    edges.forEach((edge, id) => {
      const path = drawn[id];
      const amount = progress(t, START + nodes[edge.from].layer * LAYER_TIME, LAYER_TIME * 0.9);
      path.setAttribute("opacity", amount > 0 && flows(edge) ? 1 : 0);
      path.setAttribute("stroke", bugEdges.has(id) ? colors.red : colors.blue);
      reveal(path, ease(amount));
    });
    shapes.forEach((shape, id) => {
      const node = nodes[id];
      const reachedAt = node.layer === 0 ? START : START + (node.layer - 1) * LAYER_TIME + LAYER_TIME * 0.9;
      const on = t >= reachedAt;
      shape.setAttribute("opacity", on ? 1 : 0);
      shape.setAttribute("fill", colors.blue);
      shape.setAttribute("stroke", colors.blue);
      const pop = progress(t, reachedAt, 0.45);
      scale(shape, node.x, node.y, on ? 1 + 0.35 * Math.sin(Math.PI * pop) : 1);
    });
    paintSinks(new Set(t >= proofEnd ? bugPaths.map(sinkOf) : []));
    halos.forEach((halo) => {
      const amount = progress(t, proofEnd, 0.35);
      halo.ring.setAttribute("opacity", amount);
      scale(halo.ring, halo.source.x, halo.source.y, 0.6 + 0.4 * ease(amount));
    });
  };

  return (t) => {
    (kind === "agent" ? renderAgent : renderProof)(t);
    result.setAttribute("opacity", ease(progress(t, resultAt, 0.5)));
    overlay.setAttribute("opacity", loopFade(t, DURATION));
  };
};

export const createScene = (svg, { theme, layout, colors }) => {
  const frame = LAYOUTS[layout];
  const renderers = ["agent", "proof"].map((kind, i) => buildPanel(svg, frame.panels[i], colors, kind));
  return {
    width: frame.width,
    height: frame.height,
    duration: DURATION,
    poster: DURATION - 1.2,
    render: (t) => renderers.forEach((render) => render(t)),
  };
};
