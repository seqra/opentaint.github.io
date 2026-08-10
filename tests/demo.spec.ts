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
    await expect(terminal.locator("pre")).toHaveCSS("font-family", /JetBrains Mono/);
    await expect(terminal.locator("pre")).toHaveCSS("line-height", "16px");
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
