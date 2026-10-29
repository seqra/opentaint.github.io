// Figure 3: what a proof costs, and what every change costs after it. The
// same kind of program as in Figure 2, drawn twice: entry points on the left,
// methods in between, dangerous calls on the right. An AI writes the dataflow
// semantics and proof of every method one by one, callees first, and each
// method adds one tick of tokens to a bar. The analyzer computes them all in
// one sweep and spends no tokens at all. Then commits change a few methods:
// on the proof side their callers go stale and are rewritten at the same
// price per method, while the analyzer just runs again.
import { buildFlowGraph } from "./flow-graph.js";
import { clamp, curve, ease, el, label, loopFade, progress, reveal } from "./kit.js";

const PANEL = { width: 380, height: 380 };
const LAYOUTS = {
  wide: { width: 800, height: 380, panels: [{ x: 0, y: 0 }, { x: 420, y: 0 }] },
  tall: { width: 380, height: 780, panels: [{ x: 0, y: 0 }, { x: 0, y: 400 }] },
};
const GRAPH = { sizes: [5, 7, 8, 7, 4], seed: 404, bugSources: [] };
const COMMITS = [{ changed: [22, 23] }, { changed: [13, 24] }];
const MARGIN = 4;
const SOURCE_R = 7.5;
const NODE = { width: 22, height: 14 };
const SINK = { width: 24, height: 22 };
const RING = 5;
// One grid for the text under both graphs: a status line, the token bar
// (only the proof side has one) and the amount line.
const ROWS = { graph: 48, graphHeight: 206, status: 296, bar: 318, barHeight: 16, amount: 366 };
const SLOT_GAP = 2;
const ESTIMATE = 11500;

const START = 0.6; // both first runs start here
const WRITE = 0.17; // the AI's time on one method
const SWEEP = 1.2; // the analyzer's pass over the whole program
const GROW = 0.3;
const ANNOUNCE = 0.6; // a commit's methods blink before either side reacts
const SPREAD = 0.15; // staleness climbs one layer of callers per SPREAD
const SETTLE = 0.7; // the stale set is complete before rewriting starts
const PAUSE = 1.2; // rest between a finished run and the next commit
const HOLD = 2.6;
const FADE = 0.7;
const SWITCH = 0.25;

const COPY = {
  proof: {
    title: "AI-written proof",
    writing: (k, n) => `Writing and proving method ${k} of ${n}`,
    written: (n) => `${n} methods: 145M tokens out, 28.5B in`,
    stale: (n) => `Callers go stale too: ${n} methods to redo`,
    rewriting: (k, n) => `Rewriting and re-proving method ${k} of ${n}`,
    again: "Every change costs tokens again",
  },
  taint: {
    title: "Taint analysis",
    computing: (n) => `Computing all ${n} methods in one pass`,
    computed: "About a minute of CPU, 0 tokens",
    recomputing: (n) => `Recomputing all ${n} methods`,
    again: "Another minute of CPU, still 0 tokens",
    amount: "0 tokens, ≈ 1 min of CPU (measured)",
  },
  commit: (k, n) => `Commit ${k} changes ${n} methods`,
};

const round100 = (value) => Math.round(value / 100) * 100;
const money = (value) => `≈ $${round100(value).toLocaleString("en-US")} in tokens (estimate)`;

// The program of one panel, laid out as in Figure 2. The dangerous calls are
// library models and need no semantics, so the methods are everything else;
// a method's semantics cover every call it makes, dangerous ones included.
const buildProgram = (origin) => {
  const box = { x: origin.x + MARGIN + SOURCE_R, y: origin.y + ROWS.graph, width: PANEL.width - 2 * MARGIN - SOURCE_R - SINK.width / 2, height: ROWS.graphHeight };
  const { nodes, edges, layers } = buildFlowGraph({ ...GRAPH, box });
  const lastLayer = layers.length - 1;
  const sinks = new Set(layers[lastLayer]);
  const port = (node) => (sinks.has(node.id) ? { x: node.x - SINK.width / 2, y: node.y } : node);
  const path = (edge) => curve(nodes[edge.from], port(nodes[edge.to]));
  const methods = nodes.filter((node) => node.layer < lastLayer).map((node) => node.id);
  const callers = (id) => edges.filter((edge) => edge.to === id).map((edge) => edge.from);
  return { nodes, edges, layers, lastLayer, sinks, port, path, methods, callers };
};

// Callees are written before their callers: the layer nearest the dangerous
// calls first, top to bottom within a layer.
const calleesFirst = (program, ids) =>
  [...ids].sort((a, b) => program.nodes[b].layer - program.nodes[a].layer || program.nodes[a].y - program.nodes[b].y);

// Everything a change invalidates: the changed methods, their callers, their
// callers' callers, and so on. Depth is how many steps up it climbed.
const invalidated = (program, changed) => {
  const depth = new Map(changed.map((id) => [id, 0]));
  const queue = [...changed];
  while (queue.length > 0) {
    const id = queue.shift();
    program.callers(id).forEach((caller) => {
      if (!depth.has(caller)) {
        depth.set(caller, depth.get(id) + 1);
        queue.push(caller);
      }
    });
  }
  return depth;
};

// When every method is written, goes stale and is rewritten, and when each
// analyzer pass runs. Every write also gets a slot in the token bar.
const schedule = (program) => {
  const writes = calleesFirst(program, program.methods).map((id, i) => ({ id, at: START + i * WRITE }));
  const first = { number: 0, proof: { start: START, end: START + writes.length * WRITE, writes, stale: [] }, taint: { start: START, end: START + SWEEP } };
  const commits = COMMITS.reduce((done, commit, k) => {
    const previous = done.length > 0 ? done[done.length - 1] : first;
    const at = previous.proof.end + PAUSE;
    const depth = invalidated(program, commit.changed);
    const climb = Math.max(...depth.values());
    const stale = [...depth].map(([id, d]) => ({ id, at: at + ANNOUNCE + d * SPREAD }));
    const refill = at + ANNOUNCE + climb * SPREAD + SETTLE;
    const rewrites = calleesFirst(program, [...depth.keys()]).map((id, i) => ({ id, at: refill + i * WRITE }));
    const run = {
      number: k + 1,
      at,
      changed: commit.changed,
      proof: { start: refill, end: refill + rewrites.length * WRITE, writes: rewrites, stale },
      taint: { start: at + ANNOUNCE, end: at + ANNOUNCE + SWEEP },
    };
    return [...done, run];
  }, []);
  const runs = [first, ...commits];
  // Each write gets a slot in the token bar, with an empty slot between runs.
  const slots = runs.flatMap((run, k) => run.proof.writes.map((write, i) => ({ ...write, slot: i + runs.slice(0, k).reduce((n, done) => n + done.proof.writes.length + 1, 0) })));
  return { first, commits, runs, slots };
};

const shapeOf = (parent, node, attrs) =>
  node.layer === 0
    ? el(parent, "circle", { cx: node.x, cy: node.y, r: SOURCE_R, "stroke-width": 1.8, ...attrs })
    : el(parent, "rect", { x: node.x - NODE.width / 2, y: node.y - NODE.height / 2, width: NODE.width, height: NODE.height, rx: 4, "stroke-width": 1.6, ...attrs });

const sinkOf = (parent, node, attrs) =>
  el(parent, "rect", { x: node.x - SINK.width / 2, y: node.y - SINK.height / 2, width: SINK.width, height: SINK.height, rx: 5, ...attrs });

const ringOf = (parent, node, attrs) =>
  el(parent, "rect", {
    x: node.x - NODE.width / 2 - RING, y: node.y - NODE.height / 2 - RING, width: NODE.width + 2 * RING, height: NODE.height + 2 * RING,
    rx: 4 + RING, fill: "none", "stroke-width": 2, ...attrs,
  });

const scale = (shape, node, factor) =>
  shape.setAttribute("transform", `translate(${node.x} ${node.y}) scale(${factor}) translate(${-node.x} ${-node.y})`);

// Static layer: title, every path in light gray, hollow methods and the
// dangerous calls.
const drawBackdrop = (svg, origin, colors, program, copy) => {
  const g = el(svg, "g");
  label(g, origin.x + MARGIN, origin.y + 26, copy.title, { size: 18, weight: 600, fill: colors.ink });
  program.edges.forEach((edge) => el(g, "path", { d: program.path(edge), fill: "none", stroke: colors.faint, "stroke-width": 1.6 }));
  program.nodes.forEach((node) =>
    program.sinks.has(node.id) ? sinkOf(g, node, { fill: colors.ink }) : shapeOf(g, node, { fill: colors.node, stroke: colors.faint }),
  );
};

// Everything that moves lives in one group that fades out at the end of the
// loop: colored lines, colored methods, rings on changed methods, the token
// ticks and the text.
const drawOverlay = (svg, origin, colors, program, plan) => {
  const overlay = el(svg, "g");
  const lines = program.edges.map((edge) =>
    el(overlay, "path", { d: program.path(edge), fill: "none", "stroke-width": 3.2, "stroke-linecap": "round", pathLength: 1, opacity: 0 }),
  );
  const shapes = new Map(program.methods.map((id) => [id, shapeOf(overlay, program.nodes[id], { opacity: 0 })]));
  const rings = new Map(plan.commits.flatMap((commit) => commit.changed).map((id) => [id, ringOf(overlay, program.nodes[id], { stroke: colors.ink, opacity: 0 })]));
  const slot = (PANEL.width - 2 * MARGIN) / (plan.slots[plan.slots.length - 1].slot + 1);
  const ticks = plan.slots.map((write) =>
    el(overlay, "rect", { x: origin.x + MARGIN + write.slot * slot, y: origin.y + ROWS.bar, width: slot - SLOT_GAP, height: ROWS.barHeight, fill: colors.red, opacity: 0 }),
  );
  const status = label(overlay, origin.x + MARGIN, origin.y + ROWS.status, "", { size: 18, weight: 500, fill: colors.ink });
  const amount = label(overlay, origin.x + MARGIN, origin.y + ROWS.amount, "", { size: 19, weight: 600, fill: colors.ink, opacity: 0 });
  return { overlay, lines, shapes, rings, ticks, status, amount };
};

const paintLine = (line, amount, color) => {
  line.setAttribute("opacity", amount > 0 ? 1 : 0);
  line.setAttribute("stroke", color);
  reveal(line, amount);
};

// Methods grow out of nothing when they are written or reached, and show as
// a red outline while their proof is stale.
const placeShape = (shape, node, { grow, color, hollow, nodeFill }) => {
  shape.setAttribute("opacity", grow > 0 || hollow ? 1 : 0);
  shape.setAttribute("fill", hollow ? nodeFill : color);
  shape.setAttribute("stroke", color);
  scale(shape, node, hollow ? 1 : 0.4 + 0.6 * ease(grow));
};

// Changed methods blink while the commit is announced, then stay ringed
// until that side has dealt with them.
const placeRings = (rings, commits, side, t) =>
  rings.forEach((ring, id) => {
    const commit = commits.find((item) => item.changed.includes(id) && t >= item.at && t < item[side].end);
    if (!commit) {
      ring.setAttribute("opacity", 0);
      return;
    }
    const blink = t < commit.at + ANNOUNCE ? (Math.floor((t - commit.at) / 0.15) % 2 === 0 ? 1 : 0.15) : 1;
    ring.setAttribute("opacity", blink * (1 - progress(t, commit[side].end - SWITCH, SWITCH)));
  });

// Status lines cross-fade: each fades in at its start and out before the
// next. A line's text may be a function of time, for the counting ones.
const placeStatus = (status, lines, t) => {
  const index = lines.findLastIndex((line) => t >= line.start);
  const end = lines[index + 1]?.start ?? Infinity;
  const shown = index < 0 ? 0 : Math.min(progress(t, lines[index].start, SWITCH), 1 - progress(t, end - SWITCH, SWITCH));
  const text = index < 0 ? "" : lines[index].text;
  status.textContent = typeof text === "function" ? text(t) : text;
  status.setAttribute("opacity", shown);
};

const fadeIn = (element, t, at) => element.setAttribute("opacity", progress(t, at, SWITCH));

// How many of a run's methods are done or in progress at t, at least one.
const counting = (run, t) => Math.max(1, run.proof.writes.filter((write) => t >= write.at).length);

const proofLines = (plan, copy) => {
  const total = plan.first.proof.writes.length;
  return [
    { start: plan.first.proof.start, text: (t) => copy.writing(counting(plan.first, t), total) },
    { start: plan.first.proof.end, text: copy.written(total) },
    ...plan.commits.flatMap((commit) => [
      { start: commit.at, text: COPY.commit(commit.number, commit.changed.length) },
      { start: commit.at + ANNOUNCE, text: copy.stale(commit.proof.writes.length) },
      { start: commit.proof.start, text: (t) => copy.rewriting(counting(commit, t), commit.proof.writes.length) },
      { start: commit.proof.end, text: copy.again },
    ]),
  ];
};

const taintLines = (plan, copy) => {
  const total = plan.first.proof.writes.length;
  return [
    { start: plan.first.taint.start, text: copy.computing(total) },
    { start: plan.first.taint.end, text: copy.computed },
    ...plan.commits.flatMap((commit) => [
      { start: commit.at, text: COPY.commit(commit.number, commit.changed.length) },
      { start: commit.taint.start, text: copy.recomputing(total) },
      { start: commit.taint.end, text: copy.again },
    ]),
  ];
};

// Per method, the moments that change its proof state, in time order.
const proofEvents = (runs, id) =>
  runs
    .flatMap((run) => [
      ...run.proof.writes.filter((write) => write.id === id).map((write) => ({ at: write.at, kind: "write" })),
      ...run.proof.stale.filter((item) => item.id === id).map((item) => ({ at: item.at, kind: "stale" })),
    ])
    .sort((a, b) => a.at - b.at);

const latest = (events, t) => events.findLast((event) => event.at <= t);

// The AI side: a method is written over WRITE, the calls it makes drawn out
// of it as it goes; a stale method loses its calls and shows as a red
// outline. Each write fills one tick of the bar and the estimate climbs with
// the first run.
const renderProof = ({ program, parts }, plan, colors) => {
  const events = new Map(program.methods.map((id) => [id, proofEvents(plan.runs, id)]));
  const lines = proofLines(plan, COPY.proof);
  const total = plan.first.proof.writes.length;
  return (t) => {
    const states = new Map(program.methods.map((id) => [id, latest(events.get(id), t)]));
    const written = (id) => (states.get(id)?.kind === "write" ? progress(t, states.get(id).at, WRITE) : 0);
    program.edges.forEach((edge, k) => paintLine(parts.lines[k], written(edge.from), colors.red));
    parts.shapes.forEach((shape, id) =>
      placeShape(shape, program.nodes[id], { grow: written(id), color: colors.red, hollow: states.get(id)?.kind === "stale", nodeFill: colors.node }),
    );
    placeRings(parts.rings, plan.commits, "proof", t);
    placeStatus(parts.status, lines, t);
    plan.slots.forEach((write, k) => parts.ticks[k].setAttribute("opacity", progress(t, write.at, WRITE)));
    const done = plan.first.proof.writes.filter((write) => t >= write.at + WRITE).length;
    parts.amount.textContent = money((ESTIMATE * done) / total);
    fadeIn(parts.amount, t, plan.first.proof.start);
  };
};

// The analyzer side: one front sweeps the program from the entry points to
// the dangerous calls on every run. Everything it crosses turns blue, and
// nothing ever lands in the token bar.
const renderTaint = ({ program, parts }, plan, colors) => {
  const { nodes, edges, layers } = program;
  const left = nodes[layers[0][0]].x;
  const right = program.port(nodes[layers[program.lastLayer][0]]).x;
  const speed = (right - left) / (SWEEP - GROW);
  const lines = taintLines(plan, COPY.taint);
  return (t) => {
    const run = plan.runs.findLast((item) => t >= item.taint.start);
    const front = run ? left + (t - run.taint.start) * speed : -Infinity;
    const reachedAt = (x) => (run ? run.taint.start + (x - left) / speed : Infinity);
    edges.forEach((edge, k) => {
      const from = nodes[edge.from];
      const to = program.port(nodes[edge.to]);
      paintLine(parts.lines[k], clamp((front - from.x) / (to.x - from.x)), colors.blue);
    });
    parts.shapes.forEach((shape, id) => placeShape(shape, nodes[id], { grow: progress(t, reachedAt(nodes[id].x), GROW), color: colors.blue, hollow: false }));
    placeRings(parts.rings, plan.commits, "taint", t);
    placeStatus(parts.status, lines, t);
    parts.amount.textContent = COPY.taint.amount;
    fadeIn(parts.amount, t, plan.first.taint.end);
  };
};

const buildPanel = (svg, origin, colors, side, plan) => {
  const program = buildProgram(origin);
  drawBackdrop(svg, origin, colors, program, COPY[side]);
  return { program, parts: drawOverlay(svg, origin, colors, program, plan) };
};

export const createScene = (svg, { layout, colors }) => {
  const frame = LAYOUTS[layout];
  const plan = schedule(buildProgram(frame.panels[0]));
  const proof = buildPanel(svg, frame.panels[0], colors, "proof", plan);
  const taint = buildPanel(svg, frame.panels[1], colors, "taint", plan);
  const last = plan.commits[plan.commits.length - 1];
  const duration = last.proof.end + HOLD + FADE;
  const renders = [renderProof(proof, plan, colors), renderTaint(taint, plan, colors)];
  const render = (t) => {
    renders.forEach((draw) => draw(t));
    [proof, taint].forEach((panel) => panel.parts.overlay.setAttribute("opacity", loopFade(t, duration, FADE)));
  };
  const first = plan.commits[0];
  const poster = (first.proof.start + first.proof.end) / 2;
  return { width: frame.width, height: frame.height, duration, poster, render };
};
