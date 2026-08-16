import type { APIRoute } from "astro";
import { siteConfig } from "@/lib/site";
import { buildSiteImage, renderOgImage, ogResponse } from "@/lib/og";

export const GET: APIRoute = async () => {
  const png = await renderOgImage(
    buildSiteImage(siteConfig.tagline, siteConfig.ogTagline),
  );
  return ogResponse(png);
};
