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

    await workbench.getByRole("button", { name: "Report", exact: true }).click();
    await expect(workbench.getByTestId("simplified-report-view")).toBeVisible();
    await expect(workbench.getByText("ScriptRuntime.java", { exact: true }).first()).toBeVisible();
    await expect(workbench.getByTestId("simplified-report-view").getByText('Method entry marks the 1st argument of "submit" as $UNTRUSTED')).toBeVisible();
    await expect(workbench.getByRole("button", { name: "First step" })).toBeDisabled();
  });

  test("scrolling unfolds artifacts and steps through the report", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    const jump = async (progress: number) => {
      await track.evaluate((element, value) => {
        window.scrollTo(0, element.offsetTop + (element.offsetHeight - window.innerHeight) * value);
      }, progress);
    };

    await jump(0.201);
    const artifacts = workbench.getByTestId("artifact-scroll").locator("article button");
    await expect(artifacts.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(artifacts.nth(1)).toHaveAttribute("aria-expanded", "false");

    await jump(0.27);
    await expect(artifacts.nth(0)).toHaveAttribute("aria-expanded", "false");
    await expect(artifacts.nth(1)).toHaveAttribute("aria-expanded", "true");

    await jump(0.92);
    const report = workbench.getByTestId("simplified-report-view");
    await expect(report.getByRole("status")).toContainText("Step 22 of 36");
    let positions = await report.getByRole("status").evaluate((tooltip) => {
      const line = tooltip.parentElement?.firstElementChild;
      const tooltipBox = tooltip.getBoundingClientRect();
      const lineBox = line?.getBoundingClientRect();
      return { tooltipTop: tooltipBox.top, lineBottom: lineBox?.bottom ?? 0 };
    });
    expect(positions.tooltipTop).toBeGreaterThanOrEqual(positions.lineBottom);

    await jump(0.9258);
    await expect(report.getByRole("status")).toContainText("Step 23 of 36");
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
      window.scrollTo(0, element.offsetTop + (element.offsetHeight - window.innerHeight) * 0.86);
    });

    await expect(workbench.getByTestId("simplified-report-view")).toBeVisible();
    await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("uses the page as the demo scroll container", async ({ page }) => {
    await page.goto("/");
    const track = page.getByTestId("demo-scroll-track");
    const workbench = page.getByTestId("unified-workbench");
    await track.evaluate((element) => window.scrollTo(0, element.offsetTop + 40));
    await workbench.hover();
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });

  test("renders the agent transcript from its true start to its true end", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const track = page.getByTestId("demo-scroll-track");
    const transcript = page.getByLabel("Agent transcript");

    await track.evaluate((element) => window.scrollTo(0, element.offsetTop));
    await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBe(0);

    await track.evaluate((element) => {
      window.scrollTo(0, element.offsetTop + element.offsetHeight - window.innerHeight);
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
    await expect(terminal.getByText(/\$ opentaint scan/)).toBeVisible();
    await expect(terminal.getByText(".opentaint/model/org.graalvm.polyglot.yaml", { exact: false })).toBeVisible();
    await expect(terminal.locator("pre")).toHaveCSS("font-family", /SFMono-Regular|Menlo|Monaco|Consolas|Liberation Mono/);
    await expect(terminal.locator("pre")).toHaveCSS("line-height", "13px");
    await expect(terminal.locator("pre")).toHaveCSS("font-size", "13px");
    await expect(terminal).toHaveAttribute("data-terminal-renderer", "native-text");

    await track.evaluate((element) => {
      window.scrollTo(0, element.offsetTop + (element.offsetHeight - window.innerHeight) * 0.62);
    });
    await expect(workbench.getByLabel("Real OpenTaint summary output for the anonymous security review project")).toBeVisible();
    await expect(workbench.getByLabel("Real OpenTaint summary output for the anonymous security review project").getByText(/\$ opentaint summary results\/report\.sarif/)).toBeInViewport();
  });

  for (const viewport of [
    { name: "phone", width: 375, height: 812 },
    { name: "Zenfone 7", width: 412, height: 915 },
  ]) {
    test(`${viewport.name} can reach every session stage without page overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const workbench = page.getByTestId("unified-workbench");
      await workbench.scrollIntoViewIfNeeded();
      await workbench.getByRole("button", { name: "Enact", exact: true }).click();
      await expect(workbench.getByText("rules/java/security/graaljs-code-injection.yaml", { exact: true })).toBeVisible();
      await workbench.getByRole("button", { name: "Scan", exact: true }).click();
      await expect(workbench.getByTestId("demo-hero-player")).toBeVisible();
      await workbench.getByRole("button", { name: "Report", exact: true }).click();
      await expect(workbench.getByTestId("simplified-report-view")).toBeVisible();

      const pageWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(viewport.width + 1);
    });
  }
});
