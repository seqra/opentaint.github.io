export type DemoSlideId = "terminal" | "viewer" | "agent";

export type MediaSources = { light: string; dark: string };

export type DemoSlide = {
  id: DemoSlideId;
  label: string;
  kind: "terminal" | "media" | "video";
  // When true, the inner box uses the site background instead of the terminal
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
    fallback: { light: "/agent-poster-light.webp", dark: "/agent-poster-dark.webp" },
    alt: "A coding agent running OpenTaint via the skill",
    testId: "demo-agent-media",
  },
  {
    id: "viewer",
    label: "Viewer",
    kind: "video",
    pageBackground: true,
    // Recorded against the live viewer, cursor and clicks included, so the
    // walkthrough reads as someone using it rather than a slideshow.
    sources: { light: "/video/viewer-light.mp4", dark: "/video/viewer-dark.mp4" },
    fallback: { light: "/video/viewer-poster-light.webp", dark: "/video/viewer-poster-dark.webp" },
    alt: "The OpenTaint viewer: opening a finding, stepping through its taint trace, and moving to the next flow",
    testId: "demo-viewer-media",
    href: "https://viewer.opentaint.org/",
  },
  {
    id: "terminal",
    label: "CLI",
    kind: "terminal",
  },
];
