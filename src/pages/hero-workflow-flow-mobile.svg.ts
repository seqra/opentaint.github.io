import {
  HERO_FLOW_FIELD_MOBILE_HEIGHT,
  renderHeroFlowFieldSvg,
} from "@/lib/heroFlowField";

export function GET() {
  return new Response(renderHeroFlowFieldSvg(HERO_FLOW_FIELD_MOBILE_HEIGHT), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
