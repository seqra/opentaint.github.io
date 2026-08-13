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
});
