const deploymentRevision = process.env.GITHUB_SHA || "dev";

export const siteConfig = {
  title: "OpenTaint",
  tagline: "The open source taint analysis engine for the AI era",
  description: "OpenTaint is the open source engine that turns agent-led security reviews into repeatable vulnerability checks for every pull request and CI/CD build.",
  ogVersion: deploymentRevision.slice(0, 12),
  url: "https://opentaint.org",
  author: "Seqra Team",
  twitter: "@opentaint",
  github: "https://github.com/seqra/opentaint",
  discord: "https://discord.gg/6BXDfbP4p9",
} as const;

export function ogImageUrl(name: string) {
  return `${siteConfig.url}/og/${name}.png?v=${siteConfig.ogVersion}`;
}

export const defaultKeywords = [
  "security code review",
  "agentic security review",
  "find vulnerabilities in source code",
  "continuous vulnerability checks",
  "CI/CD vulnerability scanning",
  "SAST CI/CD",
  "pull request security scanning",
  "taint analysis",
  "taint analysis tools",
  "taint flow analysis",
  "taint checking",
  "java taint analysis",
  "kotlin taint analysis",
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
