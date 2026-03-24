import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import path from "node:path";

export default defineConfig({
  site: "https://opentaint.org",
  output: "static",
  integrations: [
    react(),
    expressiveCode({
      themes: ["github-light", "github-dark"],
      themeCssSelector: (theme) => {
        if (theme.name === "github-dark") return ".dark";
        return ":root:not(.dark)";
      },
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: "0.5rem",
        codeFontFamily: "'JetBrains Mono', monospace",
        codeFontSize: "0.875rem",
        codeLineHeight: "1.625",
        codePaddingBlock: "1rem",
        codePaddingInline: "1rem",
        borderColor: "hsl(var(--code-border))",
        codeBackground: "hsl(var(--code-bg))",
        frames: {
          editorTabBarBackground: "hsl(var(--code-header))",
          editorTabBarBorderBottomColor: "hsl(var(--code-border))",
          editorActiveTabBackground: "hsl(var(--code-bg))",
          editorActiveTabIndicatorTopColor: "hsl(var(--brand))",
          terminalTitlebarBackground: "hsl(var(--code-header))",
          terminalTitlebarBorderBottomColor: "hsl(var(--code-border))",
          terminalBackground: "hsl(var(--code-bg))",
          tooltipSuccessBackground: "hsl(var(--brand))",
          frameBoxShadowCssValue: "none",
        },
      },
    }),
    mdx(),
    tailwind(),
    sitemap(),
  ],
  markdown: {
    gfm: true,
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
