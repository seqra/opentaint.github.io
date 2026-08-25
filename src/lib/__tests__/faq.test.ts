import { describe, expect, it } from "vitest";
import { faqItems } from "../faq";

describe("faq Q3 — AST-pattern rules answer", () => {
  const q3 = faqItems.find((i) => i.question === "What are AST-pattern rules?");

  it("exists", () => {
    expect(q3).toBeDefined();
  });

  it("names AST-pattern rules as one layer", () => {
    expect(q3?.answer).toMatch(/AST-pattern rules/);
  });

  it("names formal inter-procedural dataflow analysis as the tracing layer", () => {
    expect(q3?.answer).toMatch(/formal program analysis/i);
    expect(q3?.answer).toMatch(/tainted data/);
  });

  it("explains how a rule configures the taint analyzer", () => {
    expect(q3?.answer).toMatch(/translates each AST-pattern rule into a configuration for the taint analyzer/);
    expect(q3?.answer).toMatch(/interprets each metavariable as a taint mark on matching data/);
    expect(q3?.answer).not.toMatch(/AST-pattern matchers/);
  });

  it("mentions ast-grep and Semgrep as fellow rule-format users", () => {
    expect(q3?.answer).toMatch(/ast-grep/);
    expect(q3?.answer).toMatch(/Semgrep/);
  });
});

describe("FAQ Simplified Technical English", () => {
  it("keeps descriptive sentences at 35 words or fewer", () => {
    for (const item of faqItems.filter(({ answer }) => answer)) {
      const sentences = item.answer.match(/[^.!?]+[.!?]/g) ?? [];
      for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/);
        expect(words.length, `${item.question}: ${sentence.trim()}`).toBeLessThanOrEqual(35);
      }
    }
  });

  it("covers built-in and agent-discovered vulnerability patterns", () => {
    const item = faqItems.find(({ question }) => question === "What vulnerabilities does OpenTaint detect?");
    expect(item?.answer).toMatch(/including .*\bSSTI\b/);
    expect(item?.answer).not.toMatch(/server-side template injection/i);
    expect(item?.answer).toMatch(/agent skills can discover project-specific vulnerability patterns/);
    expect(item?.answer).toMatch(/engine then searches the full codebase/);
  });
});
