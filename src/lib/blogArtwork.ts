export type BlogArtwork = {
  src: string;
  alt: string;
};

const artworkBySlug: Record<string, BlogArtwork> = {
  "appsec-agent": {
    src: "/pictures/generative-art-study/topology-studies/force-relaxed-branching.svg",
    alt: "A red route crossing an irregular branching analysis tree",
  },
  "spring-analyzer": {
    src: "/pictures/generative-art-study/topology-studies/clustered-polygonal-topology.svg",
    alt: "Connected polygonal systems forming a layered analysis topology",
  },
  "semgrep-vs-codeql-vs-opentaint": {
    src: "/pictures/generative-art-study/topology-studies/voronoi-delaunay-dual.svg",
    alt: "A precise red route crossing a dual Voronoi and Delaunay field",
  },
  "conductor-rce-cve-2026-58138": {
    src: "/pictures/generative-art-study/topology-studies/opposed-tree-leaf-bridge.svg",
    alt: "Two opposed branching systems joined by one red execution path",
  },
};

export function getBlogArtwork(slug: string): BlogArtwork | undefined {
  return artworkBySlug[slug];
}
