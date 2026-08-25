import { expect, test } from "@playwright/test";

test.describe("landing message", () => {
  test("leads with the open source engine position", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".hero-composition .section-banner")).toHaveText("The open source taint analysis engine for the AI era");
    await expect(page.getByRole("heading", {
      name: "Continuous, lean, and agentic application security testing",
      level: 1,
    })).toBeVisible();
    await expect(page.getByText("Turn frontier model reasoning into reliable static-analysis checks that detect vulnerabilities at low cost", { exact: true })).toBeVisible();
    await expect(page.locator(".hero-promise-focus")).toHaveCount(0);
    await expect(page.locator(".hero-promise-command")).toHaveCount(0);
    await expect(page.getByText("Try open source taint analysis engine for the AI era", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "The flexibility of model reasoning", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The consistency of formal program analysis", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Spec-driven vulnerability search", level: 3 })).toBeVisible();
    await expect(page.getByText("FORMAL SPECIFICATION", { exact: true })).toHaveCount(0);
    await expect(page.locator(".best-worlds-phase-label")).toHaveText([
      "AGENTIC / DISCOVER",
      "CONTINUOUS / SCAN",
      "LEAN / ENACT",
    ]);
    await expect(page.getByText("patterns:", { exact: true })).toBeVisible();
    await expect(page.locator(".best-worlds-formal-code code > span").nth(1)).toHaveText("- pattern: |");
    await expect(page.getByText("PreviewController.java", { exact: true })).toHaveCount(0);
    await expect(page.getByText("SPRING APPLICATION CODE", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Java pattern", { exact: true })).toHaveCount(0);
    await expect(page.locator(".best-worlds-application-code .best-worlds-panel-heading")).toHaveText("Code");
    await expect(page.locator(".best-worlds-bindings > strong")).toHaveText("Data flow");
    await expect(page.locator(".best-worlds-formal-code .best-worlds-panel-heading")).toHaveText("Rule");
    await expect(page.getByText("String preview(PreviewDto dto) {", { exact: true })).toBeVisible();
    await expect(page.getByText("var template = dto.template();", { exact: true })).toBeVisible();
    await expect(page.getByText("var view = template.strip();", { exact: true })).toBeVisible();
    await expect(page.locator(".best-worlds-application-code .code-line-sink")).toHaveText("return engine.process(view, context);");
    await expect(page.locator(".best-worlds-formal-code code > span").nth(2)).toHaveText("$METHOD(..., PreviewDto $UNTRUSTED, ...) {");
    await expect(page.getByText("$ENGINE.process($UNTRUSTED, ...);", { exact: true })).toBeVisible();
    await expect(page.locator(".best-worlds-formal-code .code-line-ellipsis")).toHaveText(["..."]);
    await expect(page.getByText("METAVARIABLES ARE DATA TAINT MARKS", { exact: true })).toHaveCount(0);
    await expect(page.locator(".best-worlds-model-template")).toHaveText(["- function: PreviewDto#template", "copy:", "- from: this", "to: result"]);
    await expect(page.locator(".best-worlds-model-strip")).toHaveText(["- function: java.lang.String#strip", "copy:", "- from: this", "to: result"]);
    const modelIndentation = await page.locator(".best-worlds-model-template").evaluateAll((lines) =>
      lines.map((line) => line.querySelector("b")!.getBoundingClientRect().left)
    );
    expect(Math.abs(modelIndentation[0] - modelIndentation[1])).toBeLessThanOrEqual(1);
    expect(modelIndentation[2] - modelIndentation[1]).toBeGreaterThan(4);
    expect(Math.abs(modelIndentation[2] - modelIndentation[3])).toBeLessThanOrEqual(1);
    await expect(page.locator(".best-worlds-metavar-map")).toContainText("$UNTRUSTED=dto");
    await expect(page.locator(".best-worlds-metavar-map")).toContainText("$METHOD=preview");
    await expect(page.locator(".best-worlds-metavar-map")).toContainText("$ENGINE=engine");
    await expect(page.locator(".best-worlds-data-trace .best-worlds-trace-node > b")).toHaveText(["dto", "template()", "strip()", "engine.process()"]);
    await expect(page.locator(".best-worlds-data-trace .best-worlds-trace-node > span")).toHaveText(["$UNTRUSTED", "returns template", "returns view", "receives view"]);
    await expect(page.locator(".best-worlds-bindings")).not.toContainText("SOURCE");
    await expect(page.locator(".best-worlds-bindings")).not.toContainText("SINK");
    await expect(page.locator(".best-worlds-bindings")).not.toContainText("PASS-THROUGH");
    await expect(page.locator(".best-worlds-taint-signal")).toHaveCount(0);
    await expect(page.locator(".best-worlds-flow-stage-1")).toHaveCount(5);
    await expect(page.locator(".best-worlds-flow-stage-2")).toHaveCount(6);
    await expect(page.locator(".best-worlds-flow-stage-3")).toHaveCount(6);
    await expect(page.locator(".best-worlds-flow-stage-4")).toHaveCount(4);
    await expect(page.locator(".best-worlds-visual")).not.toContainText("$SOURCE");
    await expect(page.locator(".best-worlds-visual")).not.toContainText("$DATA");
    await expect(page.locator(".best-worlds-visual")).not.toContainText("$RETURN");
    await expect(page.getByText("Adapts security knowledge to your application", { exact: true })).toBeVisible();
    await expect(page.getByText("Finds every match for each security rule", { exact: true })).toBeVisible();
    await expect(page.getByText("FINDS NEW VULNERABILITY PATTERNS", { exact: true })).toBeVisible();
    await expect(page.getByText("UNDERSTANDS APPLICATION CONTEXT", { exact: true })).toBeVisible();
    await expect(page.getByText("UNDERSTANDS CODE DEPENDENCIES", { exact: true })).toBeVisible();
    await expect(page.getByText("SEARCHES ALL MODELED PATHS", { exact: true })).toBeVisible();
    await expect(page.getByText("GIVES PREDICTABLE RESULTS", { exact: true })).toBeVisible();
    await expect(page.getByText("CREATES DURABLE CHECKS", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Spec-driven code search", level: 3 })).toHaveCount(0);
    await expect(page.getByText("CODE CONTEXT + SECURITY REVIEW", { exact: true })).toHaveCount(0);
    await expect(page.getByText("PROJECT-SPECIFIC SSTI PATTERN", { exact: true })).toHaveCount(0);
    await expect(page.getByText("PR #184", { exact: true })).toHaveCount(0);
    await expect(page.getByText("$TAINTED = $DATA.strip();", { exact: true })).toHaveCount(0);
    await expect(page.locator(".best-worlds-visual")).not.toContainText("·");
    await expect(page.locator(".best-worlds-visual")).not.toContainText("→");
    await expect(page.locator(".best-worlds-toolbar")).toHaveCount(0);
    await expect(page.locator(".best-worlds-scroll-cue")).toHaveCount(0);
    const visualOrder = await page.locator(".best-worlds-visual").evaluate((visual) => {
      const box = (selector: string) => visual.querySelector(selector)!.getBoundingClientRect();
      const reasoning = box(".best-worlds-reasoning");
      const analysis = box(".best-worlds-analysis");
      const core = box(".best-worlds-core");
      const code = box(".best-worlds-application-code");
      const trace = box(".best-worlds-bindings");
      const pattern = box(".best-worlds-formal-code");
      return {
        topCardOffset: Math.abs(reasoning.top - analysis.top),
        coreBelowCards: core.top > Math.max(reasoning.bottom, analysis.bottom),
        searchStoryRunsLeftToRight: code.left < trace.left && trace.left < pattern.left,
        searchStoryTopOffset: Math.max(code.top, trace.top, pattern.top) - Math.min(code.top, trace.top, pattern.top),
      };
    });
    expect(visualOrder.topCardOffset).toBeLessThanOrEqual(1);
    expect(visualOrder.coreBelowCards).toBe(true);
    expect(visualOrder.searchStoryRunsLeftToRight).toBe(true);
    expect(visualOrder.searchStoryTopOffset).toBeLessThanOrEqual(1);
    const smallestVisualType = await page.locator(".best-worlds-visual").evaluate((visual) =>
      Math.min(...Array.from(visual.querySelectorAll("*")).filter((element) =>
        element.textContent?.trim() && (element as HTMLElement).offsetParent !== null
      ).map((element) => Number.parseFloat(getComputedStyle(element).fontSize)))
    );
    expect(smallestVisualType).toBeGreaterThanOrEqual(12);
    await expect(page.getByRole("heading", { name: "Scan your project in five minutes" })).toBeVisible();
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
    expect(layout.visualTop).toBeLessThan(layout.viewportHeight - 24);
    expect(layout.visualTop).toBeGreaterThan(layout.viewportHeight - 64);
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
    await expect(page.getByRole("heading", { name: "Find vulnerabilities LLMs miss using only local compute", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Turn one-off security review into unlimited scans", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fast scans. Fewer false alarms. Fewer missed findings" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Open source, batteries included", level: 3 })).toBeVisible();
    await expect(page.getByText(/symbolic execution/i)).toHaveCount(0);
  });

  test("shows the workflow immediately before the product demo", async ({ page }) => {
    await page.goto("/");

    const workflow = page.getByRole("region", {
      name: "Turn one-off security review into unlimited scans",
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
