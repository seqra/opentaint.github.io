import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { flowSteps } from "../UnifiedWorkbench";

const javaRoot = resolve(process.cwd(), "demo/security-review-app/src/main/java");

function javaFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return javaFiles(path);
    return entry.name.endsWith(".java") ? [path] : [];
  });
}

describe("security review demo project", () => {
  it("keeps the real report trace concise", () => {
    expect(flowSteps).toHaveLength(10);
  });

  it("gives every source file enough context for the report viewer", () => {
    const files = javaFiles(javaRoot);

    expect(files).toHaveLength(7);
    for (const file of files) {
      const lineCount = readFileSync(file, "utf8").trimEnd().split("\n").length;
      expect(lineCount, file).toBeGreaterThanOrEqual(13);
    }
  });
});
