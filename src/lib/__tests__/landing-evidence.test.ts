import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/astro/SecurityDebt.astro", "utf8");

describe("landing evidence", () => {
  it.each([
    ["44", "https://www.veracode.com/resources/analyst-reports/2026-genai-code-security-report/"],
    ["31", "https://www.verizon.com/about/news/breach-industry-wide-dbir-finds"],
    ["14", "https://snyk.io/blog/snyk-vulnbench-js-1-0-llm-security-review-repeatability/"],
    ["1,000", "https://www.anthropic.com/research/mythos-preview"],
  ])("keeps the %s claim next to its source", (claim, href) => {
    expect(source).toContain(claim);
    expect(source).toContain(href);
  });

  it("keeps the repeatability caveat visible", () => {
    expect(source).toContain("unmatched LLM-reported issues");
    expect(source).toContain("not independently confirmed vulnerabilities");
  });

  it("shows the exploitation trend rather than an isolated percentage", () => {
    expect(source).toContain('year: "2023", percent: 5');
    expect(source).toContain('year: "2024", percent: 14');
    expect(source).toContain('year: "2025", percent: 20');
    expect(source).toContain('year: "2026", percent: 31');
    expect(source).toContain("leading breach entry point for the first time in 19 years");
  });
});
