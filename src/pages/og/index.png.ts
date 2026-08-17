import type { APIRoute } from "astro";
import { buildSiteImage, renderOgImage, ogResponse } from "@/lib/og";

export const GET: APIRoute = async () => {
  const png = await renderOgImage(buildSiteImage());
  return ogResponse(png);
};
