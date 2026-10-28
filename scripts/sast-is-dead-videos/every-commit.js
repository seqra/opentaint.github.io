// Figure 6: the agent writes rules and models once; the analyzer then checks
// every commit on CPU alone, and calls the agent back only for a new library.
import { clamp, ease, el, label, loopFade, progress } from "./kit.js";

const DURATION = 15;
const SPACING = 0.5;
const FIRST_SPAWN = 2;
const TRAVEL_IN = 1.8;
const GATE_TIME = 0.25;
const TRAVEL_OUT = 1.6;
const COMMITS = 12;
const RED = 4;
const NEW_LIBRARY = 7;
const ASK = 0.6;
const WORK = 1.2;
const ANSWER = 0.6;

const LAYOUTS = {
  wide: {
    width: 800,
    height: 380,
    agent: { x: 120, y: 112 },
    gate: { x: 400, y: 252 },
    rules: "M148 112C300 112 400 140 400 223",
    rulesLabel: { x: 262, y: 100, anchor: "middle", lines: ["rules and models"] },
    agentLabelY: 52,
    input: "M40 252H334",
    inputLabel: { x: 40, y: 232, anchor: "start" },
    clean: "M466 252C560 252 600 206 760 206",
    flow: "M466 252C560 252 600 300 760 300",
    cleanLabel: { x: 780, y: 186, anchor: "end", text: "No flow: proven clean" },
    flowLabel: { x: 780, y: 334, anchor: "end", text: "Flow found: a trace to fix" },
    note: { x: 400, y: 320, anchor: "middle" },
    counters: [{ key: "runs", x: 600, y: 52 }, { key: "checked", x: 780, y: 52 }],
  },
  tall: {
    width: 380,
    height: 720,
    agent: { x: 300, y: 172 },
    gate: { x: 190, y: 420 },
    rules: "M300 200C300 330 300 420 256 420",
    rulesLabel: { x: 288, y: 300, anchor: "end", lines: ["rules and", "models"] },
    agentLabelY: -40,
    input: "M190 120V391",
    inputLabel: { x: 178, y: 136, anchor: "end" },
    clean: "M190 449C190 540 96 560 96 640",
    flow: "M190 449C190 540 284 560 284 640",
    cleanLabel: { x: 96, y: 680, anchor: "middle", text: "Proven clean" },
    flowLabel: { x: 284, y: 680, anchor: "middle", text: "Trace to fix" },
    note: { x: 190, y: 500, anchor: "middle" },
    counters: [{ key: "runs", x: 20, y: 52, anchor: "start" }, { key: "checked", x: 360, y: 52 }],
  },
};

const COUNTER_LABELS = { runs: "Agent runs", checked: "Commits checked" };

// Commits after the new library wait until the agent has added its model.
const schedule = () => {
  const libraryArrival = FIRST_SPAWN + NEW_LIBRARY * SPACING + TRAVEL_IN;
  const release = libraryArrival + ASK + WORK + ANSWER;
  const commits = Array.from({ length: COMMITS }, (_, k) => {
    const arrival = k <= NEW_LIBRARY ? FIRST_SPAWN + k * SPACING + TRAVEL_IN : release + 0.3 + (k - NEW_LIBRARY - 1) * SPACING;
    const leave = (k === NEW_LIBRARY ? release : arrival) + GATE_TIME;
    return { k, spawn: arrival - TRAVEL_IN, arrival, leave, red: k === RED, library: k === NEW_LIBRARY };
  });
  return { commits, libraryArrival, release };
};

const pointAt = (path, amount) => path.getPointAtLength(path.getTotalLength() * clamp(amount));

export const createScene = (svg, { layout, colors }) => {
  const frame = LAYOUTS[layout];
  const { commits, libraryArrival, release } = schedule();
  const { agent, gate } = frame;
  const base = el(svg, "g");
  const lane = (d, stroke) => el(base, "path", { d, fill: "none", stroke, "stroke-width": 2.4, "stroke-linecap": "round" });

  const rules = lane(frame.rules, colors.faint);
  const flowRules = el(base, "path", { d: frame.rules, fill: "none", stroke: colors.ink, "stroke-width": 2.6, "stroke-dasharray": "2 9", "stroke-linecap": "round" });
  const input = lane(frame.input, colors.faint);
  const clean = lane(frame.clean, colors.faint);
  const flow = lane(frame.flow, colors.faint);
  frame.rulesLabel.lines.forEach((line, i) =>
    label(base, frame.rulesLabel.x, frame.rulesLabel.y + i * 18, line, { size: 14, fill: colors.muted, anchor: frame.rulesLabel.anchor }));
  label(base, frame.inputLabel.x, frame.inputLabel.y, "Commits", { size: 14, fill: colors.muted, anchor: frame.inputLabel.anchor });
  [frame.cleanLabel, frame.flowLabel].forEach((item) => label(base, item.x, item.y, item.text, { size: 15, weight: 500, fill: colors.ink, anchor: item.anchor }));

  const pulses = [0, 1].map(() => el(base, "circle", { cx: agent.x, cy: agent.y, r: 28, fill: "none", stroke: colors.ink, "stroke-width": 1.6 }));
  el(base, "circle", { cx: agent.x, cy: agent.y, r: 28, fill: colors.node, stroke: colors.ink, "stroke-width": 2.4 });
  const sparkle = (r) => `M${agent.x} ${agent.y - r}Q${agent.x} ${agent.y} ${agent.x + r} ${agent.y}Q${agent.x} ${agent.y} ${agent.x} ${agent.y + r}Q${agent.x} ${agent.y} ${agent.x - r} ${agent.y}Q${agent.x} ${agent.y} ${agent.x} ${agent.y - r}Z`;
  el(base, "path", { d: sparkle(13), fill: colors.ink });
  label(base, agent.x, agent.y + frame.agentLabelY, "AI agent", { size: 15, weight: 500, fill: colors.ink, anchor: "middle" });
  const ask = el(base, "circle", { r: 6, fill: colors.ink });

  const counters = Object.fromEntries(
    frame.counters.map((item) => {
      const anchor = item.anchor ?? "end";
      const value = label(base, item.x, item.y, "0", { size: 30, weight: 600, fill: colors.ink, anchor });
      label(base, item.x, item.y + 22, COUNTER_LABELS[item.key], { size: 14, fill: colors.muted, anchor });
      return [item.key, value];
    }),
  );
  const note = label(base, frame.note.x, frame.note.y, "New library: the agent adds a model", { size: 15, weight: 500, fill: colors.ink, anchor: frame.note.anchor });

  const boxes = commits.map((commit) => {
    const g = el(base, "g");
    const box = el(g, "rect", { x: -10, y: -10, width: 20, height: 20, rx: 5, "stroke-width": 2.2 });
    const plus = commit.library ? el(g, "path", { d: "M-5 0H5M0 -5V5", stroke: colors.ink, "stroke-width": 2.2, "stroke-linecap": "round" }) : null;
    return { commit, g, box, plus };
  });
  el(base, "rect", { x: gate.x - 66, y: gate.y - 29, width: 132, height: 58, rx: 12, fill: colors.ink });
  label(base, gate.x, gate.y + 6, "Analyzer", { size: 17, weight: 600, fill: colors.bg, anchor: "middle" });

  const working = (t) =>
    (t >= 0.5 && t < 0.5 + WORK) || (t >= libraryArrival + ASK && t < libraryArrival + ASK + WORK);
  const answering = (t) =>
    (t >= 0.5 + WORK * 0.5 && t < 0.5 + WORK + ANSWER) || (t >= libraryArrival + ASK + WORK * 0.5 && t < release);

  const render = (t) => {
    const fade = loopFade(t, DURATION);
    pulses.forEach((pulse, i) => {
      const phase = ((t * 1.1 + i * 0.5) % 1 + 1) % 1;
      pulse.setAttribute("r", 28 + phase * 18);
      pulse.setAttribute("opacity", working(t) ? (1 - phase) * 0.7 : 0);
    });
    flowRules.setAttribute("opacity", answering(t) ? 1 : 0);
    flowRules.setAttribute("stroke-dashoffset", String(-t * 30));

    const asking = progress(t, libraryArrival, ASK);
    const askPoint = pointAt(rules, 1 - ease(asking));
    ask.setAttribute("cx", askPoint.x);
    ask.setAttribute("cy", askPoint.y);
    ask.setAttribute("opacity", asking > 0 && asking < 1 ? 1 : 0);
    note.setAttribute("opacity", Math.min(progress(t, libraryArrival, 0.4), 1 - progress(t, release + 0.6, 0.4)));

    boxes.forEach(({ commit, g, box, plus }) => {
      const before = progress(t, commit.spawn, TRAVEL_IN);
      const after = progress(t, commit.leave, TRAVEL_OUT);
      const waiting = t >= commit.arrival && t < commit.leave - GATE_TIME;
      const visible = t >= commit.spawn && (t < commit.arrival || waiting || t >= commit.leave) && after < 1;
      const outPath = commit.red ? flow : clean;
      const stop = commit.library ? 0.88 : 1;
      const point = t < commit.leave - GATE_TIME ? pointAt(input, before * stop) : pointAt(outPath, ease(after));
      const checked = t >= commit.leave;
      const tail = 1 - progress(t, commit.leave + TRAVEL_OUT - 0.35, 0.35);
      g.setAttribute("transform", `translate(${point.x} ${point.y})`);
      g.setAttribute("opacity", visible ? Math.min(progress(t, commit.spawn, 0.25), tail) * fade : 0);
      box.setAttribute("fill", checked ? (commit.red ? colors.red : colors.blue) : colors.node);
      box.setAttribute("stroke", checked ? "none" : colors.ink);
      plus?.setAttribute("opacity", checked ? 0 : 1);
    });

    const done = commits.filter((commit) => t >= commit.leave).length;
    const runs = t >= libraryArrival + ASK ? 2 : t >= 0.5 ? 1 : 0;
    counters.checked.textContent = String(done);
    counters.runs.textContent = String(runs);
    Object.values(counters).forEach((counter) => counter.setAttribute("opacity", fade));
  };

  return { width: frame.width, height: frame.height, duration: DURATION, poster: 6.2, render };
};
