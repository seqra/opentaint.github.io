import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const landingFiles = [
  "src/index.css",
  "src/pages/index.astro",
  "src/components/AnimatedHero.tsx",
  "src/components/DemoSection.tsx",
  "src/components/MediaDemo.tsx",
  "src/components/TerminalDemo.tsx",
  "src/components/ThemedImage.tsx",
  "src/components/VideoDemo.tsx",
  "src/components/astro/AgentPipeline.astro",
  "src/components/astro/AgentSkills.astro",
  "src/components/astro/Demo.astro",
  "src/components/astro/EngineProof.astro",
  "src/components/astro/FAQ.astro",
  "src/components/astro/LandingFooter.astro",
  "src/components/astro/SecurityDebt.astro",
  "src/components/astro/SiteHeader.astro",
  "src/components/astro/SupportedTechnology.astro",
  "src/components/astro/TheEconomics.astro",
  "src/components/astro/WhatIsOpenTaint.astro",
] as const;

const carbonTailwindSteps = new Set([
  "0", "0.5", "1", "2", "3", "4", "6", "8", "10", "12", "16", "20", "24", "40",
]);
const carbonPixels = new Set([0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160]);

const utilityPattern = /(?:^|[\s"'`])(?:(?:sm|md|lg|xl|2xl):)*(?:-?(?:m[trblxy]?|p[trblxy]?)|gap(?:-[xy])?|space-[xy])-(\d+(?:\.\d+)?)/gm;
const arbitraryUtilityPattern = /(?:^|[\s"'`])(?:(?:sm|md|lg|xl|2xl):)*(?:-?(?:m[trblxy]?|p[trblxy]?)|gap(?:-[xy])?|space-[xy])-\[/gm;

describe("landing spacing", () => {
  it("uses only Carbon-scale Tailwind spacing utilities", () => {
    const violations: string[] = [];

    for (const file of landingFiles) {
      const source = readFileSync(file, "utf8");

      for (const match of source.matchAll(utilityPattern)) {
        if (!carbonTailwindSteps.has(match[1])) violations.push(`${file}: ${match[0].trim()}`);
      }

      if (arbitraryUtilityPattern.test(source)) violations.push(`${file}: arbitrary spacing utility`);
      arbitraryUtilityPattern.lastIndex = 0;
    }

    expect(violations).toEqual([]);
  });

  it("uses only Carbon-scale literal CSS spacing", () => {
    const source = readFileSync("src/index.css", "utf8");
    const declarationPattern = /\b(?:margin|padding|gap)(?:-[a-z]+)?\s*:\s*(-?\d*\.?\d+)(px|rem)\s*;/g;
    const violations = [...source.matchAll(declarationPattern)]
      .map((match) => ({ declaration: match[0], pixels: Number(match[1]) * (match[2] === "rem" ? 16 : 1) }))
      .filter(({ pixels }) => !carbonPixels.has(pixels))
      .map(({ declaration }) => declaration);

    expect(violations).toEqual([]);
  });
});
