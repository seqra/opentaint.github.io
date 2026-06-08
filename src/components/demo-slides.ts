export type DemoSlideId = "terminal" | "viewer" | "agent";

export type MediaSources = { light: string; dark: string };

export type DemoSlide = {
  id: DemoSlideId;
  label: string;
  kind: "terminal" | "media";
  // When true, the inner box uses the site background instead of the inverted
  // cast background. Set for media that carries its own (page-coloured) chrome,
  // e.g. the browser screenshot, so the box blends with the page at its corners.
  pageBackground?: boolean;
  sources?: MediaSources;
  fallback?: MediaSources;
  alt?: string;
  testId?: string;
  href?: string;
};

// Asset files are named by the page theme they are shown on — the contrasting
// UI is baked into each file (`*-light` shows on the light page and contains a
// dark UI; `*-dark` shows on the dark page and contains a light UI). MediaDemo
// picks the source by page theme, so there is no inversion here.
export const DEMO_SLIDES: DemoSlide[] = [
  {
    id: "terminal",
    label: "CLI",
    kind: "terminal",
  },
  {
    id: "viewer",
    label: "Viewer",
    kind: "media",
    pageBackground: true,
    sources: { light: "/viewer-screen-light-2.png", dark: "/viewer-screen-dark-2.png" },
    fallback: { light: "/viewer-screen-light-2.png", dark: "/viewer-screen-dark-2.png" },
    alt: "OpenTaint viewer showing Spring vulnerability findings",
    testId: "demo-viewer-media",
    href: "https://viewer.opentaint.org/",
  },
  {
    id: "agent",
    label: "Agent",
    kind: "media",
    sources: { light: "/animation-light-1.gif", dark: "/animation-dark-1.gif" },
    fallback: { light: "/screen-light-3.png", dark: "/screen-dark-3.png" },
    alt: "A coding agent running OpenTaint via the skill",
    testId: "demo-agent-media",
  },
];
