import { expect, test } from "@playwright/test";

test.describe("landing product demonstration", () => {
  test("travels through one security-review session and its synchronized surfaces", async ({ page }) => {
    await page.goto("/");

    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();
    await expect(workbench.getByText("Review this application for unauthenticated code execution. Capture what you learn for future scans.")).toBeVisible();
    await expect(workbench.getByRole("heading", { name: "Unauthenticated execution review" })).toBeVisible();
    const discovery = workbench.getByTestId("review-report-scroll");
    await expect(discovery.getByText("Trust boundary", { exact: true })).toBeVisible();
    await expect(discovery.getByText("Vulnerability pattern", { exact: true })).toBeVisible();
    await expect(discovery.getByText("Opaque method behavior", { exact: true })).toBeVisible();
    await expect(workbench).not.toContainText("Conductor");
    await expect(workbench).not.toContainText("3.23.0");

    await workbench.getByRole("button", { name: "Enact", exact: true }).click();
    await expect(workbench.getByText("rules/java/security/graaljs-code-injection.yaml", { exact: true })).toBeVisible();
    await expect(workbench.getByText("model/org.graalvm.polyglot.yaml", { exact: true })).toBeVisible();

    const sinkArtifact = workbench.getByRole("button", { name: /rules\/java\/lib\/generic\/graal-eval\.yaml/ });
    await expect(sinkArtifact).toHaveAttribute("aria-expanded", "true");
    await sinkArtifact.evaluate((button: HTMLButtonElement) => button.click());
    await expect(sinkArtifact).toHaveAttribute("aria-expanded", "false");

    await workbench.getByRole("button", { name: "Scan", exact: true }).click();
    await expect(workbench.getByTestId("scan-results-view")).toBeVisible();
    await expect(workbench.getByTestId("scan-results-view")).toContainText("2 candidate findings");

    await workbench.getByRole("button", { name: "Triage", exact: true }).click();
    await expect(workbench.getByText("Fewer false alarms", { exact: true })).toBeVisible();
    await expect(workbench.getByTestId("triage-view")).toContainText("graal-eval.yaml");
    await expect(workbench.getByTestId("triage-view")).toContainText("pattern-inside");
    await expect(workbench.getByTestId("triage-view")).toContainText("FALSE ALARMS");
    await expect(workbench.getByTestId("triage-view")).not.toContainText("PreviewRenderer.java:11");

    await workbench.getByRole("button", { name: "Report", exact: true }).click();
    const report = workbench.getByTestId("simplified-report-view");
    await expect(report).toBeVisible();
    await expect(report.getByText("JobController.java", { exact: true })).toBeVisible();
    await expect(report.getByRole("tablist")).toHaveCount(0);
    await expect(report.getByText('Method entry marks the 1st argument of "submit" as $UNTRUSTED')).toBeVisible();
    await expect(workbench.getByRole("button", { name: "First step" })).toBeDisabled();
    const navigation = report.getByTestId("report-navigation");
    await page.waitForTimeout(300);
    const initialNavigationBox = await navigation.boundingBox();
    await workbench.getByRole("button", { name: "Last step" }).click();
    const finalNavigationBox = await navigation.boundingBox();
    expect(finalNavigationBox?.x).toBeCloseTo(initialNavigationBox?.x ?? 0, 1);
    expect(finalNavigationBox?.width).toBe(initialNavigationBox?.width);
  });

  test("scrolling unfolds artifacts and steps through the report", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await track.scrollIntoViewIfNeeded();
    await expect(workbench).toBeVisible();
    const jump = async (progress: number) => {
      await track.evaluate((element, value) => {
        element.scrollTop = (element.scrollHeight - element.clientHeight) * value;
        element.dispatchEvent(new Event("scroll"));
      }, progress);
    };

    await jump(0.201);
    const artifacts = workbench.getByTestId("artifact-scroll").locator("article button");
    await expect(artifacts.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(artifacts.nth(1)).toHaveAttribute("aria-expanded", "false");
    await expect(workbench.getByTestId("artifact-code").nth(0)).toContainText("(Context $CONTEXT).eval(..., $UNTRUSTED)");

    await jump(0.255);
    await expect(artifacts.nth(0)).toHaveAttribute("aria-expanded", "false");
    await expect(artifacts.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(artifacts.nth(0)).toBeInViewport();
    await expect(artifacts.nth(1)).toBeInViewport();
    await expect.poll(() => workbench.getByTestId("artifact-code-scroll").nth(1).evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await jump(0.483);
    await expect(workbench.getByTestId("scan-results-view")).toContainText("2 candidate findings");
    await expect(workbench.getByTestId("scan-results-view")).toContainText("PreviewRenderer.java:11");

    await jump(0.742);
    await expect(workbench.getByTestId("triage-view")).toContainText("pattern-inside");
    await expect(workbench.getByTestId("triage-view")).toContainText("HostAccess.ALL");

    await jump(0.8);
    await expect(workbench).toContainText("0 false alarms");

    await jump(0.872);
    const report = workbench.getByTestId("simplified-report-view");
    await expect(report.getByRole("status")).toContainText("Step 6 of 10");
    let positions = await report.getByRole("status").evaluate((tooltip) => {
      const line = tooltip.parentElement?.firstElementChild;
      const tooltipBox = tooltip.getBoundingClientRect();
      const lineBox = line?.getBoundingClientRect();
      return { tooltipTop: tooltipBox.top, lineBottom: lineBox?.bottom ?? 0 };
    });
    expect(positions.tooltipTop).toBeGreaterThanOrEqual(positions.lineBottom);

    await jump(0.882);
    await expect(report.getByRole("status")).toContainText("Step 7 of 10");
    positions = await report.getByRole("status").evaluate((tooltip) => {
      const line = tooltip.parentElement?.firstElementChild;
      const tooltipBox = tooltip.getBoundingClientRect();
      const lineBox = line?.getBoundingClientRect();
      return { tooltipTop: tooltipBox.top, lineBottom: lineBox?.bottom ?? 0 };
    });
    expect(positions.tooltipTop).toBeGreaterThanOrEqual(positions.lineBottom);
  });

  test("internal demo scrolling advances the synchronized transcript and surface", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await track.scrollIntoViewIfNeeded();
    await expect(workbench).toBeVisible();
    const transcript = workbench.getByLabel("Agent transcript");
    await track.evaluate((element) => {
      element.scrollTop = (element.scrollHeight - element.clientHeight) * 0.86;
      element.dispatchEvent(new Event("scroll"));
    });

    await expect(workbench.getByTestId("simplified-report-view")).toBeVisible();
    await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("uses an internal demo scroll container", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await track.scrollIntoViewIfNeeded();
    await expect(workbench).toBeVisible();
    const pageBefore = await page.evaluate(() => window.scrollY);
    await track.evaluate((element) => {
      element.scrollTop = 600;
      element.dispatchEvent(new Event("scroll"));
    });
    await expect.poll(() => track.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageBefore);
  });

  test("renders the agent transcript from its true start to its true end", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    const transcript = page.getByLabel("Agent transcript");
    await track.scrollIntoViewIfNeeded();
    await expect(workbench).toBeVisible();

    await track.evaluate((element) => { element.scrollTop = 0; element.dispatchEvent(new Event("scroll")); });
    await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBe(0);

    const alignment = await workbench.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        center: box.top + box.height / 2,
        viewportCenter: box.top + box.height / 2,
      };
    });
    expect(Math.abs(alignment.center - alignment.viewportCenter)).toBeLessThanOrEqual(2);

    await track.evaluate((element) => {
      element.scrollTop = element.scrollHeight - element.clientHeight;
      element.dispatchEvent(new Event("scroll"));
    });
    await expect.poll(() => transcript.evaluate((element) => (
      element.scrollHeight - element.clientHeight - element.scrollTop
    ))).toBeLessThanOrEqual(1);
  });

  test("renders scan candidates and removes the false alarm after triage", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();

    await workbench.getByRole("button", { name: "Scan", exact: true }).click();
    const scan = workbench.getByTestId("scan-results-view");
    await expect(scan).toBeVisible();
    await expect(scan).toContainText("ScriptRuntime.java:11");
    await expect(scan).toContainText("PreviewRenderer.java:11");

    await workbench.getByRole("button", { name: "Triage", exact: true }).click();
    const triage = workbench.getByTestId("triage-view");
    await expect(workbench).toContainText("Inspected 2 complete paths");
    await expect(triage).toContainText("FALSE ALARMS");
    await expect(triage).not.toContainText("PreviewRenderer.java:11");
  });

  test("iPhone SE shows the next workflow card as a scroll cue", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const rail = page.getByRole("region", { name: "OpenTaint workflow" });
    await rail.scrollIntoViewIfNeeded();

    const visibleNext = await rail.evaluate((element) => {
      const railBox = element.getBoundingClientRect();
      const nextBox = element.children[1]?.getBoundingClientRect();
      return nextBox ? Math.max(0, railBox.right - nextBox.left) : 0;
    });
    expect(visibleNext).toBeGreaterThanOrEqual(24);
  });

  for (const viewport of [
    { name: "phone", width: 375, height: 812 },
    { name: "Zenfone 7", width: 412, height: 915 },
  ]) {
    test(`${viewport.name} hides the agent demo without page overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const workbench = page.getByTestId("unified-workbench");
      await expect(workbench).toBeHidden();

      const pageWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(viewport.width + 1);
    });
  }
});
