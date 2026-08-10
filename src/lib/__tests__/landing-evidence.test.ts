import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/astro/SecurityDebt.astro", "utf8");

describe("landing evidence", () => {
  it.each([
    ["45", "https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/"],
    ["31", "https://www.verizon.com/about/news/breach-industry-wide-dbir-finds"],
    ["86", "https://snyk.io/blog/snyk-vulnbench-js-1-0-llm-security-review-repeatability/"],
    ["1,000", "https://www.anthropic.com/research/mythos-preview"],
  ])("keeps the %s claim next to its source", (claim, href) => {
    expect(source).toContain(claim);
    expect(source).toContain(href);
  });

  it("keeps the repeatability caveat visible", () => {
    expect(source).toContain("Unmatched LLM-only report signatures");
    expect(source).toContain("not independently confirmed vulnerabilities");
  });
});
