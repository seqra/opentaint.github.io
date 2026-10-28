// Shared drawing kit for the "SAST Is Dead, Long Live SAST!" figure videos.
// Colors mirror the site tokens in src/index.css and the validated red/blue
// pair used by the static figures, so videos and inline figures match.

export const THEMES = {
  light: {
    bg: "hsl(28 20% 95.5%)",
    ink: "hsl(12 65% 7%)",
    muted: "hsl(18 10% 36%)",
    faint: "hsl(18 10% 36% / 0.28)",
    node: "hsl(36 50% 99%)",
    red: "#ca2121",
    blue: "#2f62d6",
  },
  dark: {
    bg: "hsl(0 30% 11%)",
    ink: "hsl(0 50% 95%)",
    muted: "hsl(0 12% 66%)",
    faint: "hsl(0 12% 66% / 0.26)",
    node: "hsl(0 45% 7.5%)",
    red: "#dc1818",
    blue: "#4a86ee",
  },
};

export const FONT = '"Geist Variable", system-ui, sans-serif';
const NS = "http://www.w3.org/2000/svg";

export const el = (parent, tag, attrs = {}, text) => {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  if (text !== undefined) node.textContent = text;
  parent.appendChild(node);
  return node;
};

export const label = (parent, x, y, text, { size = 15, weight = 400, fill, anchor = "start", opacity = 1 } = {}) =>
  el(parent, "text", { x, y, fill, "font-size": size, "font-weight": weight, "text-anchor": anchor, "font-family": FONT, opacity }, text);

export const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
export const progress = (t, start, duration) => clamp((t - start) / duration);
export const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

// Overlay elements fade out at the end of the loop so the last frame melts
// back into the first one.
export const loopFade = (t, duration, fade = 0.7) => 1 - progress(t, duration - fade, fade);

export const mulberry32 = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const curve = (a, b) => {
  const mid = (a.x + b.x) / 2;
  return `M${a.x} ${a.y}C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
};

// Draw a path progressively: 0 hides it, 1 shows all of it.
export const reveal = (path, amount) => {
  path.setAttribute("stroke-dasharray", "1 1");
  path.setAttribute("stroke-dashoffset", String(1 - amount));
};
