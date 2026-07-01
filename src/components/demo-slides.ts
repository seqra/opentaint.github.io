export type DemoSlideId = "terminal" | "viewer" | "agent";

export type MediaSources = { light: string; dark: string };

export type DemoSlide = {
  id: DemoSlideId;
  label: string;
  kind: "terminal" | "media" | "video";
  // When true, the inner box uses the site background instead of the cast
  // background. Set for media that carries its own (page-coloured) chrome,
  // e.g. the browser screenshot, so the box blends with the page at its corners.
  pageBackground?: boolean;
  sources?: MediaSources;
  fallback?: MediaSources;
  alt?: string;
  testId?: string;
  href?: string;
};

// Asset files are named by the page theme they are shown on, and the baked-in
// UI matches it (`*-light` shows on the light page and contains a light UI;
// `*-dark` shows on the dark page and contains a dark UI). Both variants render
// and CSS shows the one matching the `.dark` class, so there is no inversion.
export const DEMO_SLIDES: DemoSlide[] = [
  {
    id: "agent",
    label: "Agent",
    kind: "video",
    // The video plays inline; `fallback` doubles as the poster frame and the
    // static image shown under prefers-reduced-motion.
    sources: { light: "/agent-video-light.mp4", dark: "/agent-video-dark.mp4" },
    fallback: { light: "/screen-light-3.png", dark: "/screen-dark-3.png" },
    alt: "A coding agent running OpenTaint via the skill",
    testId: "demo-agent-media",
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
    id: "terminal",
    label: "CLI",
    kind: "terminal",
  },
];
