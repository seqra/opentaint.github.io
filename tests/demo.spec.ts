import { expect, test } from "@playwright/test";

test.describe("landing product demonstration", () => {
  test("travels through one security-review session and its synchronized surfaces", async ({ page }) => {
    await page.goto("/");

    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();
    await expect(workbench.getByText("Review this application for unauthenticated code execution and write a security review report.")).toBeVisible();
    await expect(workbench.getByRole("heading", { name: "Unauthenticated script execution" })).toBeVisible();
    await expect(workbench).not.toContainText("Conductor");
    await expect(workbench).not.toContainText("3.23.0");

    const reviewScroll = workbench.getByTestId("review-report-scroll");
    const reviewDimensions = await reviewScroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(reviewDimensions.scrollHeight).toBeGreaterThan(reviewDimensions.clientHeight);
    await reviewScroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "auto" }));
    await expect.poll(() => reviewScroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await workbench.getByRole("button", { name: "Enact", exact: true }).click();
    await expect(workbench.getByText("rules/java/security/graaljs-code-injection.yaml", { exact: true })).toBeVisible();
    await expect(workbench.getByText("model/org.graalvm.polyglot.yaml", { exact: true })).toBeVisible();

    const sinkArtifact = workbench.getByRole("button", { name: /rules\/java\/lib\/generic\/graal-eval\.yaml/ });
    await expect(sinkArtifact).toHaveAttribute("aria-expanded", "true");
    await sinkArtifact.click();
    await expect(sinkArtifact).toHaveAttribute("aria-expanded", "false");

    await workbench.getByRole("button", { name: "Scan", exact: true }).click();
    await expect(workbench.getByTestId("demo-hero-player")).toBeVisible();

    await workbench.getByRole("button", { name: "Triage", exact: true }).click();
    await expect(workbench.getByText("Fewer false alarms", { exact: true })).toBeVisible();
    await expect(workbench.getByTestId("triage-view")).toContainText("graal-eval.yaml");
    await expect(workbench.getByTestId("triage-view")).toContainText("pattern-inside");

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
    const jump = async (progress: number) => {
      await track.evaluate((element, value) => {
        const sticky = element.firstElementChild;
        const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
        const trackTop = element.getBoundingClientRect().top + window.scrollY;
        const start = trackTop - stickyTop;
        const end = trackTop + element.offsetHeight - window.innerHeight;
        window.scrollTo(0, start + (end - start) * value);
      }, progress);
    };

    await jump(0.201);
    const artifacts = workbench.getByTestId("artifact-scroll").locator("article button");
    await expect(artifacts.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(artifacts.nth(1)).toHaveAttribute("aria-expanded", "false");
    await expect(workbench.getByTestId("artifact-code").nth(0)).toContainText("(Context $CONTEXT).eval(..., $UNTRUSTED)");

    await jump(0.235);
    await expect(artifacts.nth(0)).toHaveAttribute("aria-expanded", "false");
    await expect(artifacts.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(artifacts.nth(0)).toBeInViewport();
    await expect(artifacts.nth(1)).toBeInViewport();
    await expect.poll(() => workbench.getByTestId("artifact-code-scroll").nth(1).evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await jump(0.483);
    const terminalOutput = workbench.getByTestId("terminal-output");
    await expect.poll(() => terminalOutput.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(workbench.getByText("To view findings run", { exact: true })).toBeInViewport();

    await jump(0.742);
    await expect(workbench.getByTestId("triage-view")).toContainText("pattern-inside");
    await expect(workbench.getByTestId("triage-view")).toContainText("HostAccess.ALL");

    await jump(0.8);
    await expect(workbench).toContainText("0 false positives");

    await jump(0.92);
    const report = workbench.getByTestId("simplified-report-view");
    await expect(report.getByRole("status")).toContainText("Step 6 of 10");
    let positions = await report.getByRole("status").evaluate((tooltip) => {
      const line = tooltip.parentElement?.firstElementChild;
      const tooltipBox = tooltip.getBoundingClientRect();
      const lineBox = line?.getBoundingClientRect();
      return { tooltipTop: tooltipBox.top, lineBottom: lineBox?.bottom ?? 0 };
    });
    expect(positions.tooltipTop).toBeGreaterThanOrEqual(positions.lineBottom);

    await jump(0.945);
    await expect(report.getByRole("status")).toContainText("Step 7 of 10");
    positions = await report.getByRole("status").evaluate((tooltip) => {
      const line = tooltip.parentElement?.firstElementChild;
      const tooltipBox = tooltip.getBoundingClientRect();
      const lineBox = line?.getBoundingClientRect();
      return { tooltipTop: tooltipBox.top, lineBottom: lineBox?.bottom ?? 0 };
    });
    expect(positions.tooltipTop).toBeGreaterThanOrEqual(positions.lineBottom);
  });

  test("page scrolling advances the synchronized transcript and surface", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    const transcript = workbench.getByLabel("Agent transcript");
    await track.evaluate((element) => {
      const sticky = element.firstElementChild;
      const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
      const trackTop = element.getBoundingClientRect().top + window.scrollY;
      const start = trackTop - stickyTop;
      const end = trackTop + element.offsetHeight - window.innerHeight;
      window.scrollTo(0, start + (end - start) * 0.86);
    });

    await expect(workbench.getByTestId("simplified-report-view")).toBeVisible();
    await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("uses the page as the demo scroll container", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await track.evaluate((element) => {
      const trackTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, trackTop + 40);
    });
    await workbench.hover();
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });

  test("renders the agent transcript from its true start to its true end", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    const transcript = page.getByLabel("Agent transcript");

    await track.evaluate((element) => {
      const sticky = element.firstElementChild;
      const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
      const trackTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, trackTop - stickyTop);
    });
    await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBe(0);

    const alignment = await workbench.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const sticky = element.closest("[data-testid='demo-scroll-track']")?.firstElementChild;
      const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
      return {
        center: box.top + box.height / 2,
        viewportCenter: stickyTop + (window.innerHeight - stickyTop) / 2,
      };
    });
    expect(Math.abs(alignment.center - alignment.viewportCenter)).toBeLessThanOrEqual(2);

    await track.evaluate((element) => {
      const trackTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, trackTop + element.offsetHeight - window.innerHeight);
    });
    await expect.poll(() => transcript.evaluate((element) => (
      element.scrollHeight - element.clientHeight - element.scrollTop
    ))).toBeLessThanOrEqual(1);
  });

  test("renders the native CLI timeline", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();

    await workbench.getByRole("button", { name: "Scan", exact: true }).click();
    const terminal = workbench.getByTestId("demo-hero-player");
    await expect(terminal).toBeVisible();
    await expect(terminal).toContainText("OpenTaint Scan");
    await expect(terminal).not.toContainText("$ opentaint scan");
    await expect(terminal).not.toContainText(".opentaint/model");
    await expect(terminal).toHaveAttribute("data-terminal-renderer", "native-cli");

    await track.evaluate((element) => {
      const sticky = element.firstElementChild;
      const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
      const trackTop = element.getBoundingClientRect().top + window.scrollY;
      const start = trackTop - stickyTop;
      const end = trackTop + element.offsetHeight - window.innerHeight;
      window.scrollTo(0, start + (end - start) * 0.62);
    });
    const summary = workbench.getByLabel("Real OpenTaint summary output for the anonymous security review project");
    await expect(summary).toBeVisible();
    await expect(summary).not.toContainText("$ opentaint summary results/report.sarif");
    await expect(summary).toContainText("Fingerprint: ggAE7bbWSwRU");
    await expect(summary).toContainText("Untrusted HTTP input reaches a host-enabled GraalVM Context.eval call");

    await expect.poll(() => summary.getByTestId("terminal-output").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(summary).not.toContainText("Scan Summary");
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
