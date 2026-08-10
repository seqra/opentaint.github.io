import { expect, test } from "@playwright/test";

test.describe("landing product demonstration", () => {
  test("shows one agent run using the CLI and producing specifications and a report", async ({ page }) => {
    await page.goto("/");

    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();
    await expect(workbench.getByText("Review Conductor 3.23.0 for unauthenticated code execution.")).toBeVisible();

    await workbench.getByRole("button", { name: "Running OpenTaint" }).click();
    await expect(workbench.getByTestId("demo-hero-player")).toBeVisible();

    await workbench.getByRole("button", { name: "Writing security specifications" }).click();
    await expect(workbench.getByText("graalvm-polyglot-eval.yaml")).toBeVisible();
    await expect(workbench.getByText("org.graalvm.polyglot.yaml")).toBeVisible();

    await workbench.getByRole("button", { name: "Opening finding" }).click();
    await expect(workbench.getByTitle("Interactive OpenTaint vulnerability report")).toBeVisible();
  });

  test("loads the real CLI only when the agent invokes it", async ({ page }) => {
    const castRequests: string[] = [];
    page.on("request", (request) => {
      if (/\.cast(?:\?|$)/.test(request.url())) castRequests.push(request.url());
    });

    await page.goto("/");
    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();
    expect(castRequests).toEqual([]);

    await workbench.getByRole("button", { name: "Running OpenTaint" }).click();
    await expect(workbench.getByTestId("demo-hero-player")).toBeVisible();
    await expect.poll(() => castRequests.some((url) => url.includes("/demo/conductor.cast"))).toBe(true);
  });

  for (const viewport of [
    { name: "phone", width: 375, height: 812 },
    { name: "Zenfone 7", width: 412, height: 915 },
  ]) {
    test(`${viewport.name} shows every agent action without page overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const workbench = page.getByTestId("unified-workbench");
      await workbench.scrollIntoViewIfNeeded();
      await workbench.getByRole("button", { name: "Running OpenTaint" }).click();
      await expect(workbench.getByTestId("demo-hero-player")).toBeVisible();
      await workbench.getByRole("button", { name: "Opening finding" }).click();
      await expect(workbench.getByTitle("Interactive OpenTaint vulnerability report")).toBeVisible();

      const pageWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(viewport.width + 1);
    });
  }
});
