import { defineEcConfig } from "astro-expressive-code";

/* Expressive Code lives here rather than in astro.config.mjs so the `<Code>`
   component can be used from .astro files: that component requires the config
   to be serializable, and `themeCssSelector` is a function. */
export default defineEcConfig({
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
});
