// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

type Rgb = { r: number; g: number; b: number };

const css = readFileSync(
  fileURLToPath(new URL("../../index.css", import.meta.url)),
  "utf8",
);

function extractBlock(source: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(^|\\s)${escaped}\\s*\\{`, "m").exec(source);
  if (!match) {
    throw new Error(`selector not found: ${selector}`);
  }
  const open = match.index + match[0].length - 1;
  const close = source.indexOf("}", open);
  return source.slice(open + 1, close);
}

function parseVars(block: string): Map<string, string> {
  const vars = new Map<string, string>();
  for (const match of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars.set(match[1], match[2].trim());
  }
  return vars;
}

function hue(p: number, q: number, t: number): number {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue(p, q, h + 1 / 3) * 255),
    g: Math.round(hue(p, q, h) * 255),
    b: Math.round(hue(p, q, h - 1 / 3) * 255),
  };
}

function toRgb(value: string): Rgb {
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length !== 6) {
      throw new Error(`unsupported hex length: ${value}`);
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  const match = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!match) {
    throw new Error(`unsupported color value: ${value}`);
  }
  return hslToRgb(
    Number(match[1]) / 360,
    Number(match[2]) / 100,
    Number(match[3]) / 100,
  );
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const REQUIRED_TOKENS = ["link", "panel", "panel-foreground", "panel-accent"];

// [foreground token, background token, minimum WCAG ratio]
const PAIRS: Array<[string, string, number]> = [
  ["foreground", "background", 7],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "band", 4.5],
  ["muted-foreground", "secondary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["link", "background", 4.5],
  ["link", "band", 4.5],
  ["link", "code-bg", 4.5],
  ["panel-foreground", "panel", 4.5],
  ["panel-accent", "panel", 4.5],
  ["code-text", "code-bg", 4.5],
  ["code-keyword", "code-bg", 4.5],
  ["code-fn", "code-bg", 4.5],
  ["code-string", "code-bg", 4.5],
  ["code-annotation", "code-bg", 4.5],
];

describe.each([
  ["light", parseVars(extractBlock(css, ":root"))],
  ["dark", parseVars(extractBlock(css, ".dark"))],
] as const)("%s theme tokens", (_mode, vars) => {
  it.each(REQUIRED_TOKENS)("defines --%s", (token) => {
    expect(vars.has(token)).toBe(true);
  });

  it.each(PAIRS)("--%s on --%s is at least %s:1", (fg, bg, min) => {
    const fgValue = vars.get(fg);
    const bgValue = vars.get(bg);
    if (!fgValue || !bgValue) {
      throw new Error(`missing token: ${fg}=${fgValue} ${bg}=${bgValue}`);
    }
    expect(contrast(toRgb(fgValue), toRgb(bgValue))).toBeGreaterThanOrEqual(min);
  });
});
