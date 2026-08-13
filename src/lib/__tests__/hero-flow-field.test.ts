import { describe, expect, it } from "vitest";
import { createHeroFlowField } from "../heroFlowField";

describe("hero flow field", () => {
  it("produces a stable field of smooth cubic streamlines", () => {
    const first = createHeroFlowField();
    const second = createHeroFlowField();

    expect(first).toEqual(second);
    expect(first).toHaveLength(80);
    expect(first.every((line) => line.d.startsWith("M") && line.d.includes(" C"))).toBe(true);
    expect(first.filter((line) => line.active)).toHaveLength(20);
  });

  it("extends the same field continuously across a taller canvas", () => {
    const tall = createHeroFlowField({ height: 1440 });

    expect(tall).toHaveLength(160);
    expect(tall).toEqual(createHeroFlowField({ height: 1440 }));
    expect(tall.slice(80)).not.toEqual(tall.slice(0, 80));
    expect(tall.filter((line) => line.active)).toHaveLength(40);
  });
});
