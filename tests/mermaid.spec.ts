import { expect, test } from "@playwright/test";

type Overflow = {
  text: string;
  boxHeight: number;
  contentHeight: number;
};

const POSTS_WITH_DIAGRAMS = ["appsec-agent", "spring-analyzer"];

test.describe("blog mermaid diagrams", () => {
  for (const slug of POSTS_WITH_DIAGRAMS) {
    test(`${slug}: diagram labels fit inside their nodes`, async ({ page }) => {
      await page.goto(`/blog/${slug}`);

      const renderedSvg = page.locator(".mermaid-chart[data-rendered] svg").first();
      await expect(renderedSvg).toBeVisible();

      const overflows = await page.evaluate(() => {
        const found: Overflow[] = [];
        const labels = document.querySelectorAll(".mermaid-chart svg foreignObject");

        for (const box of labels) {
          const content = box.firstElementChild;
          const text = content?.textContent?.trim();
          if (!content || !text) continue;

          const boxHeight = box.getBoundingClientRect().height;
          const contentHeight = content.getBoundingClientRect().height;
          if (contentHeight > boxHeight + 1) {
            found.push({ text: text.slice(0, 40), boxHeight, contentHeight });
          }
        }

        return found;
      });

      expect(overflows).toEqual([]);
    });
  }
});
