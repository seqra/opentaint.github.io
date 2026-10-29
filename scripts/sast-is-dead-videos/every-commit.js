// Figure 6: the agentic loop. A stream of commits runs from the agent through
// the analyzer into the main branch. Flows go back to the agent as traces to
// fix, and a security review ends with a new rule for the analyzer.
import { clamp, ease, el, label, loopFade, progress } from "./kit.js";

const DURATION = 22;
const SPEED = 180;
const SPACING = 0.5;
const FIRST_SPAWN = 0.2;
const FIRST_FLOW_AT = 2.6;
const GATE = 0.3;
const FIX = 0.5;
const REVIEW = 1.6;
const SWITCH = 0.25;
const BOX = 20;
const BAND = 34;
const PULSE = 12;
const FADE_OUT = 70;
const EMERGE = 14;
const IDLE = "The analyzer checks every commit on CPU";

// The feedback loops are rounded rectangles: their straight runs keep the
// tokens on them well clear of the labels beside them.
const LAYOUTS = {
  wide: {
    width: 800,
    height: 380,
    agent: { x: 124, y: 180 },
    gate: { x: 400, y: 180 },
    commits: "M124 180H400",
    main: "M400 180H790",
    traces: "M400 180V210A70 70 0 0 1 330 280H194A70 70 0 0 1 124 210V180",
    rules: "M124 180V150A70 70 0 0 1 194 80H330A70 70 0 0 1 400 150V180",
    labels: [
      { x: 262, y: 56, text: "New rules", anchor: "middle" },
      { x: 262, y: 154, text: "Commits", anchor: "middle" },
      { x: 262, y: 312, text: "Traces to fix", anchor: "middle" },
      { x: 790, y: 154, text: "Main branch", anchor: "end" },
    ],
    agentLabel: { x: 78, y: 185, anchor: "end" },
    counter: { x: 790, y: 64, anchor: "end" },
    band: { from: 474, to: 786, axis: "x" },
    status: { x: 400, y: 354 },
  },
  tall: {
    width: 380,
    height: 760,
    agent: { x: 190, y: 120 },
    gate: { x: 190, y: 380 },
    commits: "M190 120V380",
    main: "M190 380V700",
    traces: "M190 380H120A70 70 0 0 1 50 310V190A70 70 0 0 1 120 120H190",
    rules: "M190 120H260A70 70 0 0 1 330 190V310A70 70 0 0 1 260 380H190",
    labels: [
      { x: 300, y: 255, text: "New rules", anchor: "end" },
      { x: 214, y: 184, text: "Commits", anchor: "start" },
      { x: 80, y: 255, text: "Traces to fix", anchor: "start" },
      { x: 214, y: 452, text: "Main branch", anchor: "start" },
    ],
    agentLabel: { x: 190, y: 66, anchor: "middle" },
    counter: { x: 20, y: 640, anchor: "start" },
    band: { from: 420, to: 696, axis: "y" },
    status: { x: 190, y: 742 },
  },
};

const pointAt = (path, amount) => path.getPointAtLength(path.getTotalLength() * clamp(amount));

// Tokens grow out of the agent and the analyzer and shrink back into them,
// so none is ever half-covered by a node.
const emerge = (point, agent, gate) => {
  const fromAgent = Math.hypot(point.x - agent.x, point.y - agent.y) - 28;
  const fromGate = Math.max(Math.abs(point.x - gate.x) - 66, Math.abs(point.y - gate.y) - 32);
  return clamp((Math.min(fromAgent, fromGate) - BOX / 2) / EMERGE);
};

// Commits spawn every SPACING, starting before the loop so the lanes are
// already full at t = 0 and the stream looks the same at t = 0 and t = DURATION.
// The analyzer finds a flow in the first commit after FIRST_FLOW_AT and in the
// first one that reaches it after the new rule; each fix follows its trace.
const schedule = ({ inTime, mainTime, backTime, ruleTime }) => {
  const lead = Math.ceil((inTime + GATE + Math.max(mainTime, backTime) + FIRST_SPAWN) / SPACING);
  const count = Math.floor((DURATION - FIRST_SPAWN) / SPACING) + 1 + lead;
  const timed = Array.from({ length: count }, (_, i) => {
    const spawn = FIRST_SPAWN + (i - lead) * SPACING;
    const arrive = spawn + inTime;
    return { spawn, arrive, leave: arrive + GATE, back: arrive + GATE + backTime };
  });
  const firstAfter = (key, time) => timed.findIndex((commit) => commit[key] >= time);
  const flow1 = firstAfter("arrive", FIRST_FLOW_AT);
  const fix1 = firstAfter("spawn", timed[flow1].back + FIX);
  const reviewAt = timed[fix1].leave + 0.3;
  const ruleAt = reviewAt + REVIEW;
  const ruleIn = ruleAt + ruleTime;
  const flow2 = firstAfter("arrive", ruleIn + 0.4);
  const fix2 = firstAfter("spawn", timed[flow2].back + FIX);
  // flow and fix are 0 for a plain commit, else the number of the incident.
  const commits = timed.map((commit, k) => ({
    ...commit,
    flow: [flow1, flow2].indexOf(k) + 1,
    fix: [fix1, fix2].indexOf(k) + 1,
  }));
  return { commits, reviewAt, ruleAt, ruleIn };
};

export const createScene = (svg, { layout, colors }) => {
  const frame = LAYOUTS[layout];
  const { agent, gate } = frame;
  const lanes = el(svg, "g");
  const lane = (d, extra = {}) => el(lanes, "path", { d, fill: "none", stroke: colors.faint, "stroke-width": 2.4, "stroke-linecap": "round", ...extra });
  const rules = lane(frame.rules, { "stroke-dasharray": "2 7" });
  const commitLane = lane(frame.commits);
  const traces = lane(frame.traces);
  const main = lane(frame.main);
  frame.labels.forEach((item) => label(lanes, item.x, item.y, item.text, { size: 14, fill: colors.muted, anchor: item.anchor }));

  // Every token moves at SPEED, so each leg takes as long as it is.
  const travel = (path) => path.getTotalLength() / SPEED;
  const times = { inTime: travel(commitLane), mainTime: travel(main), backTime: travel(traces), ruleTime: travel(rules) };
  const mainLength = main.getTotalLength();
  const { commits, reviewAt, ruleAt, ruleIn } = schedule(times);
  const flowOf = (n) => commits.find((commit) => commit.flow === n);
  const fixOf = (n) => commits.find((commit) => commit.fix === n);
  const busy = [
    [flowOf(1).back, fixOf(1).spawn + 0.3],
    [reviewAt, ruleAt + 0.3],
    [flowOf(2).back, fixOf(2).spawn + 0.3],
  ];
  const statuses = [
    { text: "Flow found: sent back with a trace", start: flowOf(1).leave, end: flowOf(1).back },
    { text: "The agent fixes the code", start: flowOf(1).back, end: reviewAt },
    { text: "Security review of merged code", start: reviewAt, end: ruleAt },
    { text: "The review becomes a new rule", start: ruleAt, end: flowOf(2).leave },
    { text: "The new rule catches a flow", start: flowOf(2).leave, end: flowOf(2).back },
    { text: "The agent fixes the code", start: flowOf(2).back, end: fixOf(2).leave },
  ];

  const band = el(svg, "rect", { rx: BAND / 2, fill: colors.faint });
  const tokens = el(svg, "g");
  const boxes = commits.map((commit) => ({
    commit,
    box: el(tokens, "rect", { x: -BOX / 2, y: -BOX / 2, width: BOX, height: BOX, rx: 5, "stroke-width": 2.2 }),
  }));
  const ruleToken = el(tokens, "rect", { x: -7, y: -7, width: 14, height: 14, rx: 2, fill: colors.ink });

  const pulses = [0, 1].map(() => el(svg, "circle", { cx: agent.x, cy: agent.y, r: 28, fill: "none", stroke: colors.ink, "stroke-width": 1.6 }));
  el(svg, "circle", { cx: agent.x, cy: agent.y, r: 28, fill: colors.node, stroke: colors.ink, "stroke-width": 2.4 });
  const sparkle = (r) => `M${agent.x} ${agent.y - r}Q${agent.x} ${agent.y} ${agent.x + r} ${agent.y}Q${agent.x} ${agent.y} ${agent.x} ${agent.y + r}Q${agent.x} ${agent.y} ${agent.x - r} ${agent.y}Q${agent.x} ${agent.y} ${agent.x} ${agent.y - r}Z`;
  el(svg, "path", { d: sparkle(13), fill: colors.ink });
  label(svg, frame.agentLabel.x, frame.agentLabel.y, "AI agent", { size: 15, weight: 500, fill: colors.ink, anchor: frame.agentLabel.anchor });

  const flash = el(svg, "rect", { fill: "none", stroke: colors.ink, "stroke-width": 2 });
  el(svg, "rect", { x: gate.x - 66, y: gate.y - 32, width: 132, height: 64, rx: 12, fill: colors.ink });
  label(svg, gate.x, gate.y - 2, "Analyzer", { size: 17, weight: 600, fill: colors.bg, anchor: "middle" });
  const version = label(svg, gate.x, gate.y + 19, "rules v1", { size: 14, fill: colors.bg, anchor: "middle" });

  const count = label(svg, frame.counter.x, frame.counter.y, "0", { size: 28, weight: 600, fill: colors.ink, anchor: frame.counter.anchor });
  label(svg, frame.counter.x, frame.counter.y + 22, "Commits checked", { size: 14, fill: colors.muted, anchor: frame.counter.anchor });
  const status = label(svg, frame.status.x, frame.status.y, "", { size: 16, weight: 500, fill: colors.ink, anchor: "middle" });

  const placeCommit = (t, { commit, box }) => {
    const { spawn, arrive, leave, back, flow, fix } = commit;
    const out = (t - leave) * SPEED;
    const point =
      t < arrive ? pointAt(commitLane, progress(t, spawn, times.inTime))
        : flow ? pointAt(traces, progress(t, leave, times.backTime))
          : pointAt(main, out / mainLength);
    const gone = flow ? t >= back : out >= mainLength;
    const tail = flow ? 1 - progress(t, back - 0.2, 0.2) : 1 - clamp((out - (mainLength - FADE_OUT)) / FADE_OUT);
    const checked = t >= leave;
    box.setAttribute("transform", `translate(${point.x} ${point.y}) scale(${emerge(point, agent, gate)})`);
    box.setAttribute("opacity", t < spawn || gone ? 0 : tail);
    box.setAttribute("fill", checked ? (flow ? colors.red : colors.blue) : colors.node);
    box.setAttribute("stroke", checked ? "none" : fix ? colors.red : colors.ink);
  };

  // The review is a soft band that spreads from the analyzer over the merged
  // commits, then fades as the agent turns it into a rule.
  const placeBand = (t) => {
    const reach = ease(progress(t, reviewAt, REVIEW * 0.6));
    const { from, to, axis } = frame.band;
    const span = (to - from) * reach;
    const [x, y, width, height] = axis === "x" ? [from, gate.y - BAND / 2, span, BAND] : [gate.x - BAND / 2, from, BAND, span];
    Object.entries({ x, y, width, height }).forEach(([key, value]) => band.setAttribute(key, value));
    band.setAttribute("opacity", 1 - progress(t, ruleAt - 0.4, 0.4));
  };

  const placeRule = (t, fade) => {
    const moving = t >= ruleAt && t < ruleIn;
    ruleToken.setAttribute("opacity", moving ? fade : 0);
    if (moving) {
      const point = pointAt(rules, progress(t, ruleAt, times.ruleTime));
      ruleToken.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(45) scale(${emerge(point, agent, gate)})`);
    }
    version.textContent = t >= ruleIn ? "rules v2" : "rules v1";
    version.setAttribute("opacity", fade);
    const pop = progress(t, ruleIn, 0.6);
    const grow = 4 + 14 * pop;
    flash.setAttribute("x", gate.x - 66 - grow);
    flash.setAttribute("y", gate.y - 32 - grow);
    flash.setAttribute("width", 132 + grow * 2);
    flash.setAttribute("height", 64 + grow * 2);
    flash.setAttribute("rx", 12 + grow);
    flash.setAttribute("opacity", pop > 0 && pop < 1 ? 1 - pop : 0);
  };

  // Rings ripple out of the agent while it works, timed from the start of
  // the work and faded at both ends so no ring appears or vanishes abruptly.
  const placePulses = (t) => {
    const active = busy.find(([start, end]) => t >= start && t < end);
    const envelope = active ? Math.min(progress(t, active[0], 0.2), 1 - progress(t, active[1] - 0.2, 0.2)) : 0;
    pulses.forEach((pulse, i) => {
      const phase = ((active ? t - active[0] : 0) * 1.1 + i * 0.5) % 1;
      pulse.setAttribute("r", 28 + phase * PULSE);
      pulse.setAttribute("opacity", (1 - phase) * 0.7 * envelope);
    });
  };

  // The idle line fills the gaps between statuses; every line fades in and
  // out over SWITCH so the text never jumps.
  const statusAt = (t) => {
    const current = statuses.find((item) => t >= item.start && t < item.end);
    if (current) return current;
    const start = Math.max(0, ...statuses.filter((item) => item.end <= t).map((item) => item.end));
    const end = Math.min(...statuses.filter((item) => item.start > t).map((item) => item.start));
    return { text: IDLE, start, end, idle: true };
  };

  const placeStatus = (t, fade) => {
    const { text, start, end, idle } = statusAt(t);
    const shown = Math.min(progress(t, start, SWITCH), 1 - progress(t, end - SWITCH, SWITCH));
    status.textContent = text;
    status.setAttribute("fill", idle ? colors.muted : colors.ink);
    status.setAttribute("opacity", shown * fade);
  };

  const render = (t) => {
    const fade = loopFade(t, DURATION);
    placePulses(t);
    boxes.forEach((item) => placeCommit(t, item));
    placeBand(t);
    placeRule(t, fade);
    placeStatus(t, fade);
    count.textContent = String(commits.filter((commit) => t >= commit.leave).length);
    count.setAttribute("opacity", fade);
  };

  const poster = flowOf(2).leave + times.backTime * 0.45;
  return { width: frame.width, height: frame.height, duration: DURATION, poster, render };
};
