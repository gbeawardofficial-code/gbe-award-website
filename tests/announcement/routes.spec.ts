import { expect, test } from "playwright/test";

test("2026 nominations update appears above the public header", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-06T12:00:00+05:30") });

  for (const path of ["/", "/about", "/women-in-excellence"]) {
    await page.goto(path);
    const notice = page.locator("#nominations-notice");

    await expect(notice).toBeVisible();
    await expect(notice).toHaveText("Nominations for 2026 are closed. Congratulations to our winners.");
    await expect(notice.getByRole("link")).toHaveCount(0);

    const positions = await page.evaluate(() => ({
      noticeBottom: document.getElementById("nominations-notice")!.getBoundingClientRect().bottom,
      headerTop: document.getElementById("site-header")!.getBoundingClientRect().top,
    }));
    expect(positions.headerTop).toBeGreaterThanOrEqual(positions.noticeBottom - 1);
  }
});

test("closed nominations update remains visible after the former deadline", async ({ page }) => {
  await page.clock.install({ time: new Date("2027-01-01T00:00:00+05:30") });
  await page.goto("/");

  await expect(page.locator("#nominations-notice")).toBeVisible();
  await expect(page.locator("#nominations-notice")).toContainText("Nominations for 2026 are closed");
});

test("mobile announcement remains readable without covering the menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("#nominations-notice")).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

  const positions = await page.evaluate(() => ({
    noticeBottom: document.getElementById("nominations-notice")!.getBoundingClientRect().bottom,
    menuTop: document.getElementById("mobile-menu")!.getBoundingClientRect().top,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(positions.menuTop).toBeGreaterThan(positions.noticeBottom);
  expect(positions.scrollWidth).toBeLessThanOrEqual(positions.viewportWidth + 1);
});
