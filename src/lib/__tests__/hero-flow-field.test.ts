import { describe, expect, it } from "vitest";
import {
  createHeroFlowField,
  HERO_FLOW_FIELD_DESKTOP_HEIGHT,
  HERO_FLOW_FIELD_MOBILE_HEIGHT,
  HERO_FLOW_FIELD_TABLET_HEIGHT,
  renderHeroFlowFieldSvg,
} from "../heroFlowField";

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

  it("keeps the landing field dense across responsive layouts", () => {
    const desktop = createHeroFlowField({ height: HERO_FLOW_FIELD_DESKTOP_HEIGHT });
    const tablet = createHeroFlowField({ height: HERO_FLOW_FIELD_TABLET_HEIGHT });
    const mobile = createHeroFlowField({ height: HERO_FLOW_FIELD_MOBILE_HEIGHT });

    expect(desktop).toHaveLength(250);
    expect(tablet).toHaveLength(440);
    expect(mobile).toHaveLength(380);
    const desktopSvg = renderHeroFlowFieldSvg(HERO_FLOW_FIELD_DESKTOP_HEIGHT);
    expect(desktopSvg).toContain(
      `viewBox="0 0 1200 ${HERO_FLOW_FIELD_DESKTOP_HEIGHT}"`,
    );
    expect(desktopSvg).toContain(" L");
    expect(desktopSvg).not.toContain(" C");
    expect(desktopSvg).toContain('stroke-width="1"');
    expect(desktopSvg).toContain('stroke-width="2.25"');
    expect(desktopSvg).toContain('stroke-dasharray="12 30"');
    expect(renderHeroFlowFieldSvg(HERO_FLOW_FIELD_MOBILE_HEIGHT)).toContain(
      `viewBox="0 0 1200 ${HERO_FLOW_FIELD_MOBILE_HEIGHT}"`,
    );
  });
});
