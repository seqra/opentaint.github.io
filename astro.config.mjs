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
    /* Options live in ec.config.mjs so the `<Code>` component can be used
       from .astro files. */
    expressiveCode(),
    mdx(),
    tailwind(),
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
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
