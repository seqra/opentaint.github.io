import { createHeroFlowField } from "@/lib/heroFlowField";

export function GET() {
  const paths = createHeroFlowField()
    .map((line) => `<path d="${line.d}"/>`)
    .join("");

  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#ca2121" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity=".42">${paths}</g></svg>`,
    {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
