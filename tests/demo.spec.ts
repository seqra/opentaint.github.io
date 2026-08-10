import { expect, test } from "@playwright/test";

test.describe("landing product demonstration", () => {
  test("shows one agent run using the CLI and producing specifications and a report", async ({ page }) => {
    await page.goto("/");

    const workbench = page.getByTestId("unified-workbench");
    await workbench.scrollIntoViewIfNeeded();
    await expect(workbench.getByText("Review this application for exploitable vulnerabilities.")).toBeVisible();

    await workbench.getByRole("button", { name: "Running OpenTaint" }).click();
    await expect(workbench.getByText(/opentaint scan/)).toBeVisible();

    await workbench.getByRole("button", { name: "Writing security specifications" }).click();
    await expect(workbench.getByText("server-side-template-injection.yaml")).toBeVisible();
    await expect(workbench.getByText("org.thymeleaf.yaml")).toBeVisible();

    await workbench.getByRole("button", { name: "Opening finding" }).click();
    await expect(workbench.getByRole("link", { name: "Open the OpenTaint report viewer" })).toBeVisible();
  });

  test("does not depend on video or terminal recordings", async ({ page }) => {
    const mediaRequests: string[] = [];
    page.on("request", (request) => {
      if (/\.(?:mp4|cast)(?:\?|$)/.test(request.url())) mediaRequests.push(request.url());
    });

    await page.goto("/");
    await page.getByTestId("unified-workbench").scrollIntoViewIfNeeded();
    expect(mediaRequests).toEqual([]);
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
      await expect(workbench.getByText(/opentaint scan/)).toBeVisible();
      await workbench.getByRole("button", { name: "Opening finding" }).click();
      await expect(workbench.getByRole("link", { name: "Open the OpenTaint report viewer" })).toBeVisible();

      const pageWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(viewport.width + 1);
    });
  }
});
