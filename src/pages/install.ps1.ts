import type { APIRoute } from "astro";

const response = await fetch(
  "https://raw.githubusercontent.com/seqra/opentaint/main/scripts/install/install.ps1",
);
const script = await response.text();

export const GET: APIRoute = () => {
  return new Response(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
