export type BlogArtwork = {
  src: string;
  darkSrc: string;
  alt: string;
};

const artworkBySlug: Record<string, BlogArtwork> = {
  "appsec-agent": {
    src: "/pictures/generative-art-study/topology-studies/neural-symbolic-automaton.svg",
    darkSrc: "/pictures/generative-art-study/topology-studies/neural-symbolic-automaton-dark.svg",
    alt: "Neural reasoning passes through an agentic transformation into exhaustive symbolic analysis",
  },
  "spring-analyzer": {
    src: "/pictures/generative-art-study/topology-studies/clustered-polygonal-topology.svg",
    darkSrc: "/pictures/generative-art-study/topology-studies/clustered-polygonal-topology-dark.svg",
    alt: "Connected polygonal systems forming a layered analysis topology",
  },
  "semgrep-vs-codeql-vs-opentaint": {
    src: "/pictures/generative-art-study/topology-studies/analysis-depth-mesh.svg",
    darkSrc: "/pictures/generative-art-study/topology-studies/analysis-depth-mesh-dark.svg",
    alt: "Three connected regions resolve progressively deeper layers of one differential mesh",
  },
  "conductor-rce-cve-2026-58138": {
    src: "/pictures/generative-art-study/topology-studies/adaptive-proximity-lattice.svg",
    darkSrc: "/pictures/generative-art-study/topology-studies/adaptive-proximity-lattice-dark.svg",
    alt: "A red exploit path crossing a structured proximity lattice",
  },
};

export function getBlogArtwork(slug: string): BlogArtwork | undefined {
  return artworkBySlug[slug];
}
