const deploymentRevision = process.env.GITHUB_SHA || "dev";

export const siteConfig = {
  title: "OpenTaint",
  tagline: "The open source taint analysis engine for the AI era",
  description: "Turn one-off review into unlimited scans with the open source taint analysis engine that allows to combine model reasoning with formal program analysis.",
  ogTagline: "Turn one-off review into unlimited scans",
  ogVersion: deploymentRevision.slice(0, 12),
  url: "https://opentaint.org",
  author: "Seqra Team",
  twitter: "@seqradev",
  github: "https://github.com/seqra/opentaint",
  discord: "https://discord.gg/6BXDfbP4p9",
} as const;

export function ogImageUrl(name: string) {
  return `${siteConfig.url}/og/${name}.png?v=${siteConfig.ogVersion}`;
}

export const defaultKeywords = [
  "spring sast",
  "java static analysis",
  "kotlin security analyzer",
  "stored injection",
  "semgrep alternative",
  "codeql alternative",
  "cross-endpoint flow",
  "AST-pattern rules",
  "formal program analysis",
  "formal dataflow analysis",
  "AI agent security",
  "security agents",
  "agentic application security testing",
  "taint analysis engine",
  "open source sast",
  "application security debt",
  "continuous application security",
  "devsecops security scanner",
  "Semgrep Pro alternative",
  "CodeQL alternative",
];
