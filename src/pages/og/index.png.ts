import type { APIRoute } from "astro";
import { siteConfig } from "@/lib/site";
import { buildSiteImage, renderOgImage, ogResponse } from "@/lib/og";

export const GET: APIRoute = async () => {
  const png = await renderOgImage(
    buildSiteImage(siteConfig.description),
  );
  return ogResponse(png);
};
