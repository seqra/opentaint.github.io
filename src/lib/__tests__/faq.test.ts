import { describe, expect, it } from "vitest";
import { faqItems } from "../faq";

describe("faq Q3 — AST-pattern rules answer", () => {
  const q3 = faqItems.find((i) => i.question === "What are AST-pattern rules?");

  it("exists", () => {
    expect(q3).toBeDefined();
  });

  it("opens with the two-layer framing", () => {
    expect(q3?.answer).toMatch(/^Two layers\./);
  });

  it("names AST-pattern rules as one layer", () => {
    expect(q3?.answer).toMatch(/AST-pattern rules/);
  });

  it("names whole-program taint analysis as the other layer", () => {
    expect(q3?.answer).toMatch(/Whole-program taint analysis/);
  });

  it("contrasts with AST-pattern matchers", () => {
    expect(q3?.answer).toMatch(/AST-pattern matchers/);
  });

  it("mentions ast-grep and Semgrep as fellow rule-format users", () => {
    expect(q3?.answer).toMatch(/ast-grep/);
    expect(q3?.answer).toMatch(/Semgrep/);
  });
});
