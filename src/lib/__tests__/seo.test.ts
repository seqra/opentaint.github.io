import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { faqItems } from "../faq";
import { siteConfig } from "../site";

describe("SEO and answer-engine content", () => {
  it("describes the review-to-CI vulnerability-check workflow", () => {
    expect(siteConfig.description).toMatch(/open source engine/i);
    expect(siteConfig.description).toMatch(/agent-led security reviews/i);
    expect(siteConfig.description).toMatch(/repeatable vulnerability checks/i);
    expect(siteConfig.description).toMatch(/CI\/CD build/i);
    expect(siteConfig.description).not.toMatch(/Java|Kotlin|Spring/);
  });

  it("provides a direct definition of taint analysis", () => {
    const item = faqItems.find(({ question }) => question === "What is taint analysis?");
    expect(item?.answer).toMatch(/tracks data from untrusted sources/i);
    expect(item?.answer).toMatch(/security-sensitive sinks/i);
  });

  it("explains the developer workflow from local CLI to CI", () => {
    const item = faqItems.find(({ question }) => question === "Can developers run the same security checks locally and in CI?");
    expect(item?.answer).toMatch(/CLI/);
    expect(item?.answer).toMatch(/SARIF/);
    expect(item?.answer).toMatch(/GitHub Actions and GitLab CI/);
  });

  it("keeps the generic-query guide linked from the landing page", () => {
    const landing = readFileSync("src/components/astro/TaintAnalysisExplainer.astro", "utf8");
    expect(landing).toContain("What is taint analysis?");
    expect(landing).toContain('href="/taint-analysis/"');
  });

  it("publishes an llms.txt entity summary", () => {
    const llms = readFileSync("public/llms.txt", "utf8");
    expect(llms).toContain("OpenTaint is the open source engine for continuous, lean, and agentic application security testing");
    expect(llms).toContain("repeatable vulnerability checks");
    expect(llms).toContain("GitHub Actions and GitLab CI");
    expect(llms).toContain("https://opentaint.org/taint-analysis/");
  });
});
