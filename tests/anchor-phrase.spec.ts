import { expect, test } from "@playwright/test";

test.describe("landing message", () => {
  test("leads with the open source engine position", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("The open source taint analysis engine for the AI era", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", {
      name: "Continuous, lean, and agentic application security testing",
      level: 1,
    })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The flexibility of model reasoning", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The consistency of formal program analysis", level: 3 })).toBeVisible();
    await expect(page.getByText("FORMAL SPECIFICATION", { exact: true })).toBeVisible();
    await expect(page.getByText("security/ssti.yml", { exact: true })).toBeVisible();
    await expect(page.getByText("$DATA = $REQ.get(...);", { exact: true })).toBeVisible();
    await expect(page.getByText("$TEMPLATE.render($DATA);", { exact: true })).toBeVisible();
    await expect(page.getByText("CI/CD VULNERABILITY GATE", { exact: true })).toBeVisible();
    await expect(page.locator(".best-worlds-scroll-cue")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Five-minute quickstart" })).toBeVisible();
    await expect(page.getByText("Run your first agentic application security test in 5 minutes", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Run deep security scan and static triage with OpenTaint appsec-agent skill", { exact: true })).toBeVisible();
  });

  test("reveals a thin edge of the full-screen approach visual below the hero", async ({ page }) => {
    await page.goto("/");

    const layout = await page.evaluate(() => {
      const hero = document.querySelector(".hero-band") as HTMLElement;
      const visual = document.querySelector(".best-worlds-stage") as HTMLElement;
      const heroBox = hero.getBoundingClientRect();
      const visualBox = visual.getBoundingClientRect();
      return {
        viewportHeight: window.innerHeight,
        heroBottom: heroBox.bottom,
        visualTop: visualBox.top,
        visualHeight: visualBox.height,
      };
    });

    expect(Math.abs(layout.heroBottom - layout.visualTop)).toBeLessThanOrEqual(1);
    expect(layout.visualTop).toBeLessThan(layout.viewportHeight);
    expect(layout.visualTop).toBeLessThan(layout.viewportHeight - 80);
    expect(layout.visualTop).toBeGreaterThan(layout.viewportHeight - 112);
    expect(layout.visualHeight).toBeGreaterThanOrEqual(layout.viewportHeight - 80);
  });

  test("frames the product proof with the real Conductor review", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "How OpenTaint found CVE-2026-58138" })).toBeVisible();
    await expect(page.getByText("What works once must keep working")).toHaveCount(0);
    await expect(page.getByText("One review versus continuous use")).toHaveCount(0);
  });

  test("highlights the learn-search operating model", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("As AI generates more code, security risk and review cost compound", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Turn one-off review into unlimited scans", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fast scans. Fewer false alarms. Fewer missed findings" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Open source, batteries included", level: 3 })).toBeVisible();
    await expect(page.getByText(/symbolic execution/i)).toHaveCount(0);
  });

  test("shows the workflow immediately before the product demo", async ({ page }) => {
    await page.goto("/");

    const workflow = page.getByRole("region", {
      name: "Turn one-off review into unlimited scans",
    });
    await expect(workflow.getByRole("heading", { name: "Discover", exact: true })).toBeVisible();
    await expect(workflow.getByRole("heading", { name: "Enact", exact: true })).toBeVisible();
    await expect(workflow.getByRole("heading", { name: "Scan", exact: true })).toBeVisible();
    await expect(workflow.getByRole("heading", { name: "Triage", exact: true })).toBeVisible();

    const immediatelyBeforeDemo = await workflow.evaluate((element) => {
      const group = element.closest(".hero-workflow-group");
      return group?.nextElementSibling?.classList.contains("demo-section");
    });
    expect(immediatelyBeforeDemo).toBe(true);
  });

  test("groups the landing sections with intentional dividers and backgrounds", async ({ page }) => {
    await page.goto("/");

    const styles = await page.evaluate(() => {
      const section = (id: string) => document.getElementById(id)?.closest("section") as HTMLElement;
      const continuous = section("continuous-security-heading");
      const heroGroup = document.querySelector(".hero-workflow-group") as HTMLElement;
      const quickstart = section("quickstart-heading");
      const securityDebt = section("security-debt-heading");
      const realWorld = section("what-heading");
      const engine = section("proof-heading");
      const skills = section("agent-skills-heading");

      return {
        continuousDivider: getComputedStyle(continuous, "::before").content,
        continuousOverflow: getComputedStyle(continuous).overflow,
        continuousBackground: getComputedStyle(continuous).backgroundColor,
        heroGroupBackground: getComputedStyle(heroGroup).backgroundColor,
        quickstartBackground: getComputedStyle(quickstart).backgroundColor,
        securityDebtBackground: getComputedStyle(securityDebt).backgroundColor,
        quickstartDivider: getComputedStyle(quickstart, "::before").content,
        realWorldBackground: getComputedStyle(realWorld).backgroundColor,
        engineBackground: getComputedStyle(engine).backgroundColor,
        engineOverflow: getComputedStyle(engine).overflow,
        skillsBackground: getComputedStyle(skills).backgroundColor,
        skillsDivider: getComputedStyle(skills, "::before").content,
      };
    });

    expect(styles.continuousDivider).toBe("none");
    expect(styles.continuousOverflow).toBe("visible");
    expect(styles.continuousBackground).toBe("rgba(0, 0, 0, 0)");
    expect(styles.heroGroupBackground).toBe(styles.quickstartBackground);
    expect(styles.securityDebtBackground).not.toBe(styles.quickstartBackground);
    expect(styles.quickstartDivider).toBe("none");
    expect(styles.engineBackground).toBe(styles.skillsBackground);
    expect(styles.engineOverflow).toBe("visible");
    expect(styles.skillsDivider).toBe("none");
  });
});
