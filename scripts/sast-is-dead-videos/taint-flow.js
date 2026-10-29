// Figure 2: sampling vs. exhaustive search over the same program. An agent
// checks the paths it picks, one at a time; taint analysis covers all of them.
import { buildFlowGraph } from "./flow-graph.js";
import { clamp, curve, ease, el, label, loopFade, progress, reveal } from "./kit.js";

const START = 0.6;
const SPEED = 260;
const TRACE_GAP = 0.45;
const GROW = 0.3;
const SWITCH = 0.25;
const HOLD = 3.2;
const FADE = 0.7;
const MARGIN = 4;
const SOURCE_R = 7.5;
const NODE = { width: 22, height: 14 };
const SINK = { width: 24, height: 22 };
const PANEL = { width: 380, height: 372 };
const GRAPH = { sizes: [5, 7, 8, 7, 4], seed: 271, bugSources: [0, 2, 4] };

const LAYOUTS = {
  wide: { width: 800, height: 372, panels: [{ x: 0, y: 0 }, { x: 420, y: 0 }] },
  tall: { width: 380, height: 764, panels: [{ x: 0, y: 0 }, { x: 0, y: 392 }] },
};

const COPY = {
  agent: {
    title: "An agent samples paths",
    status: (checked, found, total, bugs) => `Checked ${checked} of ${total} paths. Found ${found} of ${bugs} bugs.`,
  },
  proof: {
    title: "Taint analysis covers every path",
    status: (total, bugs) => `Covered all ${total} paths. Found all ${bugs} bugs.`,
  },
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

// The program of one panel. Only bug flows carry data into a dangerous call;
// every other flow stops one step before it. Edges into a dangerous call end
// at its left side, so the call box never hides the tip of a line.
const buildProgram = (origin) => {
  const box = { x: origin.x + MARGIN + SOURCE_R, y: origin.y + 62, width: PANEL.width - 2 * MARGIN - SOURCE_R - SINK.width / 2, height: 232 };
  const { nodes, edges, layers, bugPaths } = buildFlowGraph({ ...GRAPH, box });
  const lastLayer = layers.length - 1;
  const bugEdges = new Set(bugPaths.flat());
  const sinks = new Set(layers[lastLayer]);
  const flows = (edge) => bugEdges.has(edge.id) || !sinks.has(edge.to);
  const port = (node) => (sinks.has(node.id) ? { x: node.x - SINK.width / 2, y: node.y } : node);
  const sinkOf = (trail) => edges[trail[trail.length - 1]].to;
  const total = countPaths(edges.filter(flows), layers);
  return { nodes, edges, layers, bugPaths, bugEdges, lastLayer, flows, port, sinkOf, total };
};

const shapeOf = (parent, node, program, attrs) => {
  if (node.layer === 0) return el(parent, "circle", { cx: node.x, cy: node.y, r: SOURCE_R, "stroke-width": 1.8, ...attrs });
  const size = node.layer === program.lastLayer ? SINK : NODE;
  const rx = node.layer === program.lastLayer ? 5 : 4;
  return el(parent, "rect", { x: node.x - size.width / 2, y: node.y - size.height / 2, width: size.width, height: size.height, rx, "stroke-width": 1.6, ...attrs });
};

const scale = (node, x, y, factor) =>
  node.setAttribute("transform", `translate(${x} ${y}) scale(${factor}) translate(${-x} ${-y})`);

// Static layer: titles, every potential path in light gray, hollow methods
// and the dangerous calls. Returns the length of each edge for the schedule.
const drawBackdrop = (svg, origin, colors, program, title) => {
  const g = el(svg, "g");
  label(g, origin.x + MARGIN, origin.y + 26, title, { size: 18, weight: 600, fill: colors.ink });
  label(g, origin.x + MARGIN, origin.y + 306, "Entry points", { size: 14, fill: colors.muted });
  label(g, origin.x + PANEL.width - MARGIN, origin.y + 306, "Dangerous calls", { size: 14, fill: colors.muted, anchor: "end" });
  const faint = program.edges.map((edge) => el(g, "path", { d: program.path(edge), fill: "none", stroke: colors.faint, "stroke-width": 1.6 }));
  program.nodes.forEach((node) =>
    shapeOf(g, node, program, node.layer === program.lastLayer ? { fill: colors.ink } : { fill: colors.node, stroke: colors.faint }),
  );
  return faint.map((path) => path.getTotalLength());
};

// Everything that moves lives in one group that fades out at the end of the
// loop. Each edge has a base line and a tint on top: the tint wipes along the
// line when a path changes color, so the two colors never blend into a third
// one. "Hot" shapes grow over entry points and calls to turn them red.
const drawOverlay = (svg, origin, colors, program) => {
  const overlay = el(svg, "g");
  const line = (edge) => el(overlay, "path", { d: program.path(edge), fill: "none", "stroke-width": 3.2, "stroke-linecap": "round", pathLength: 1 });
  const bases = program.edges.map(line);
  const tints = program.edges.map(line);
  const inner = program.nodes.filter((node) => node.layer > 0 && node.layer < program.lastLayer);
  const ends = program.nodes.filter((node) => node.layer === 0 || node.layer === program.lastLayer);
  const sources = program.nodes.filter((node) => node.layer === 0);
  const shapes = new Map([...sources, ...inner].map((node) => [node.id, shapeOf(overlay, node, program, {})]));
  const hot = new Map(ends.map((node) => [node.id, shapeOf(overlay, node, program, { fill: colors.red, stroke: colors.red })]));
  const probe = el(overlay, "circle", { r: 9, fill: "none", stroke: colors.ink, "stroke-width": 2.2 });
  const status = label(overlay, origin.x + MARGIN, origin.y + 352, "", { size: 16, weight: 500, fill: colors.ink });
  return { overlay, bases, tints, shapes, hot, probe, status };
};

const buildPanel = (svg, origin, colors, kind) => {
  const program = buildProgram(origin);
  const path = (edge) => curve(program.nodes[edge.from], program.port(program.nodes[edge.to]));
  const drawn = { ...program, path };
  const lengths = drawBackdrop(svg, origin, colors, drawn, COPY[kind].title);
  return { program: drawn, lengths, parts: drawOverlay(svg, origin, colors, drawn) };
};

const paintLine = (base, tint, { amount, color, hue, swept = 0 }) => {
  const tinted = Math.min(amount, swept);
  base.setAttribute("opacity", amount > 0 ? 1 : 0);
  tint.setAttribute("opacity", tinted > 0 ? 1 : 0);
  base.setAttribute("stroke", color);
  tint.setAttribute("stroke", hue);
  reveal(base, amount);
  reveal(tint, tinted);
};

// The new color runs along the trail from the entry point to the call, one
// edge after another, within SWITCH.
const recolor = (trail, start) =>
  trail.map((id, k) => ({ id, at: start + (k * SWITCH) / trail.length, duration: SWITCH / trail.length }));

// Methods grow out of nothing when data first reaches them.
const placeNode = (shape, node, reachedAt, t, color) => {
  const grow = progress(t, reachedAt, GROW);
  shape.setAttribute("opacity", grow > 0 ? 1 : 0);
  shape.setAttribute("fill", color);
  shape.setAttribute("stroke", color);
  scale(shape, node.x, node.y, 0.4 + 0.6 * ease(grow));
};

const placeHot = (hot, nodes, foundAt, t) =>
  hot.forEach((shape, id) => {
    const grow = progress(t, foundAt.get(id) ?? Infinity, SWITCH);
    shape.setAttribute("opacity", grow > 0 ? 1 : 0);
    scale(shape, nodes[id].x, nodes[id].y, ease(grow));
  });

// Status lines cross-fade: each fades in at its start and out before the next.
const placeStatus = (status, lines, t) => {
  const index = lines.findLastIndex((line) => t >= line.start);
  const end = lines[index + 1]?.start ?? Infinity;
  const shown = index < 0 ? 0 : Math.min(progress(t, lines[index].start, SWITCH), 1 - progress(t, end - SWITCH, SWITCH));
  status.textContent = index < 0 ? "" : lines[index].text;
  status.setAttribute("opacity", shown);
};

// A clean path from an entry point: at each step it prefers an edge no bug
// takes, so the agent's clean checks end one step before a dangerous call.
const cleanPath = (program, source, offset) => {
  const next = (at, step) => {
    const out = program.edges.filter((edge) => edge.from === at && program.flows(edge));
    const clean = out.filter((edge) => !program.bugEdges.has(edge.id));
    const options = clean.length > 0 ? clean : out;
    return options.length > 0 ? options[(offset + step) % options.length] : null;
  };
  const walk = (at, step) => {
    const edge = step < program.lastLayer ? next(at, step) : null;
    return edge ? [edge.id, ...walk(edge.to, step + 1)] : [];
  };
  return walk(source, 0);
};

// The probe moves at SPEED along the whole trace, so every edge takes as long
// as it is and the probe never slows down at a method.
const timeTrace = (pick, begin, lengths) => {
  const steps = pick.trail.reduce((done, id) => {
    const last = done[done.length - 1];
    return [...done, { id, at: last ? last.at + last.duration : begin, duration: lengths[id] / SPEED }];
  }, []);
  const last = steps[steps.length - 1];
  return { ...pick, begin, end: last.at + last.duration, steps };
};

// The agent checks five whole paths one after another; two of them happen
// to carry a bug.
const agentSchedule = (program, lengths) => {
  const sources = program.layers[0];
  const picks = [
    { trail: cleanPath(program, sources[1], 0), bug: false },
    { trail: program.bugPaths[0], bug: true },
    { trail: cleanPath(program, sources[3], 1), bug: false },
    { trail: program.bugPaths[1], bug: true },
    { trail: cleanPath(program, sources[1], 1), bug: false },
  ];
  return picks.reduce((done, pick) => {
    const last = done[done.length - 1];
    return [...done, timeTrace(pick, last ? last.end + TRACE_GAP : START, lengths)];
  }, []);
};

// When the probe first reaches each method.
const arrivals = (program, traces) => {
  const visits = traces.flatMap((trace) =>
    trace.steps.flatMap((step) => [[program.edges[step.id].from, step.at], [program.edges[step.id].to, step.at + step.duration]]),
  );
  return visits.reduce((at, [id, time]) => at.set(id, Math.min(at.get(id) ?? Infinity, time)), new Map());
};

// Entry points and calls of a bug path turn red the moment the bug is found.
const foundAt = (program, trails) =>
  new Map(trails.flatMap(({ trail, time }) => [[program.edges[trail[0]].from, time], [program.sinkOf(trail), time]]));

const placeProbe = (probe, moving, bases, t) => {
  probe.setAttribute("opacity", moving ? 1 : 0);
  if (!moving) return;
  const path = bases[moving.step.id];
  const point = path.getPointAtLength(path.getTotalLength() * moving.amount);
  const { begin, end } = moving.step.trace;
  const size = ease(Math.min(progress(t, begin, GROW), 1 - progress(t, end - GROW, GROW)));
  probe.setAttribute("transform", `translate(${point.x} ${point.y}) scale(${size})`);
};

const renderAgent = ({ program, parts }, traces, colors) => {
  const steps = traces.flatMap((trace) => {
    const wipes = recolor(trace.trail, trace.end);
    return trace.steps.map((step, k) => ({ ...step, trace, wipe: wipes[k] }));
  });
  const reached = arrivals(program, traces);
  const found = foundAt(program, traces.filter((trace) => trace.bug).map((trace) => ({ trail: trace.trail, time: trace.end })));
  const lines = traces.map((trace, i) => ({
    start: trace.end,
    text: COPY.agent.status(i + 1, traces.slice(0, i + 1).filter((item) => item.bug).length, program.total, program.bugPaths.length),
  }));
  return (t) => {
    const active = steps.map((step) => ({ step, amount: progress(t, step.at, step.duration) })).filter((item) => item.amount > 0);
    parts.bases.forEach((base, id) => paintLine(base, parts.tints[id], { amount: 0 }));
    active.forEach(({ step, amount }) =>
      paintLine(parts.bases[step.id], parts.tints[step.id], {
        amount,
        color: colors.ink,
        hue: step.trace.bug ? colors.red : colors.muted,
        swept: progress(t, step.wipe.at, step.wipe.duration),
      }),
    );
    placeProbe(parts.probe, active.find((item) => item.amount < 1), parts.bases, t);
    parts.shapes.forEach((shape, id) => placeNode(shape, program.nodes[id], reached.get(id) ?? Infinity, t, colors.muted));
    placeHot(parts.hot, program.nodes, found, t);
    placeStatus(parts.status, lines, t);
  };
};

// One front sweeps the program from the entry points to the dangerous calls,
// timed to arrive as the agent finishes its last path. Everything it crosses
// turns blue; the three bug paths and their calls turn red when it arrives.
const renderProof = ({ program, parts }, waveEnd, colors) => {
  const { nodes, edges, layers } = program;
  const left = nodes[layers[0][0]].x;
  const right = program.port(nodes[layers[program.lastLayer][0]]).x;
  const speed = (right - left) / (waveEnd - START);
  const reachedAt = (x) => START + (x - left) / speed;
  const found = foundAt(program, program.bugPaths.map((trail) => ({ trail, time: waveEnd })));
  const wipes = new Map(program.bugPaths.flatMap((trail) => recolor(trail, waveEnd)).map((wipe) => [wipe.id, wipe]));
  const lines = [{ start: waveEnd, text: COPY.proof.status(program.total, program.bugPaths.length) }];
  return (t) => {
    const front = left + (t - START) * speed;
    edges.forEach((edge, id) => {
      const from = nodes[edge.from];
      const to = program.port(nodes[edge.to]);
      const wipe = wipes.get(id);
      paintLine(parts.bases[id], parts.tints[id], {
        amount: program.flows(edge) ? clamp((front - from.x) / (to.x - from.x)) : 0,
        color: colors.blue,
        hue: colors.red,
        swept: wipe ? progress(t, wipe.at, wipe.duration) : 0,
      });
    });
    parts.probe.setAttribute("opacity", 0);
    parts.shapes.forEach((shape, id) => placeNode(shape, nodes[id], reachedAt(nodes[id].x), t, colors.blue));
    placeHot(parts.hot, nodes, found, t);
    placeStatus(parts.status, lines, t);
  };
};

export const createScene = (svg, { layout, colors }) => {
  const frame = LAYOUTS[layout];
  const agent = buildPanel(svg, frame.panels[0], colors, "agent");
  const proof = buildPanel(svg, frame.panels[1], colors, "proof");
  const traces = agentSchedule(agent.program, agent.lengths);
  const end = traces[traces.length - 1].end;
  const duration = end + HOLD + FADE;
  const renders = [renderAgent(agent, traces, colors), renderProof(proof, end, colors)];
  const render = (t) => {
    renders.forEach((draw) => draw(t));
    [agent, proof].forEach((panel) => panel.parts.overlay.setAttribute("opacity", loopFade(t, duration, FADE)));
  };
  return { width: frame.width, height: frame.height, duration, poster: end + HOLD / 2, render };
};
