import { expect, test } from "@playwright/test";
import { skipLandingOverlay } from "./helpers/landingOverlay";
import { waitForMapTiles } from "./helpers/maplibre";

test("bell popups and images have a consistent size", async ({ page }) => {
  await skipLandingOverlay(page);
  await page.goto("/");
  await waitForMapTiles(page);
  await page.getByRole("button", { name: "Close bells list" }).click();
  await page.waitForTimeout(300);

  const markers = page.locator('.maplibregl-marker[aria-label]:not([aria-label^="Zoom to"])');
  await expect.poll(() => markers.count()).toBeGreaterThanOrEqual(2);
  const dimensions: Array<{ popupWidth: number; popupHeight: number; imageWidth: number; imageHeight: number }> = [];

  for (let index = 0; index < 2; index++) {
    const marker = markers.nth(index);
    await marker.hover();
    const popup = page.locator(".maplibregl-popup-content");
    await expect(popup).toBeVisible();
    const image = popup.locator('img[alt^="Image for bell"]');
    await expect(image).toBeVisible();
    const popupBox = await popup.boundingBox();
    const imageBox = await image.boundingBox();
    expect(popupBox && imageBox).toBeTruthy();
    if (!popupBox || !imageBox) continue;
    dimensions.push({ popupWidth: popupBox.width, popupHeight: popupBox.height, imageWidth: imageBox.width, imageHeight: imageBox.height });
    await page.locator(".maplibregl-popup-close-button").dispatchEvent("click");
    await expect(popup).toBeHidden();
  }

  expect(dimensions).toHaveLength(2);
  expect(dimensions[0]).toEqual(dimensions[1]);
});

test("visited menu closes when hover moves to another bell", async ({ page }) => {
  await skipLandingOverlay(page);
  await page.goto("/");
  await waitForMapTiles(page);
  await page.getByRole("button", { name: "Close bells list" }).click();
  await page.waitForTimeout(300);

  const markers = page.locator('.maplibregl-marker[aria-label]:not([aria-label^="Zoom to"])');
  await expect.poll(() => markers.count()).toBeGreaterThanOrEqual(2);
  await markers.first().hover();
  const popup = page.locator(".maplibregl-popup-content");
  await expect(popup).toBeVisible();
  await popup.getByRole("button", { name: "Show suggestions" }).click();
  await expect(page.getByRole("option", { name: "Want to go" })).toBeVisible();

  await markers.nth(1).dispatchEvent("mouseenter");
  await expect(page.getByRole("option", { name: "Want to go" })).toBeHidden();
});

test("popup arrow clears the bell when the popup is above it", async ({ page }) => {
  await skipLandingOverlay(page);
  await page.goto("/");
  await waitForMapTiles(page);
  await page.getByRole("button", { name: "Close bells list" }).click();
  await page.waitForTimeout(300);

  const marker = page.locator('.maplibregl-marker[aria-label="Preserving History of Crawford County"]');
  await expect(marker).toBeVisible();
  await page.mouse.move(650, 300);
  await page.mouse.down();
  await page.mouse.move(650, 600, { steps: 10 });
  await page.mouse.up();
  await expect(marker).toBeVisible();
  await marker.hover();

  const popup = page.locator(".maplibregl-popup");
  await expect(popup).toBeVisible();
  await expect(popup).toHaveClass(/maplibregl-popup-anchor-bottom/);
  const markerBox = await marker.boundingBox();
  const tipBox = await popup.locator(".maplibregl-popup-tip").boundingBox();
  expect(markerBox && tipBox).toBeTruthy();
  if (!markerBox || !tipBox) return;
  expect(tipBox.y + tipBox.height).toBeLessThan(markerBox.y);
});

test("Beaver County photo fills the same popup image frame", async ({ page }) => {
  await skipLandingOverlay(page);
  await page.goto("/");
  await waitForMapTiles(page);
  await page.getByRole("button", { name: /Beaver County Landmarks/ }).click();
  await page.getByRole("button", { name: "Close bells list" }).click();

  const popup = page.locator(".maplibregl-popup-content");
  await expect(popup).toBeVisible();
  const image = popup.locator('img[alt="Image for bell Beaver County Landmarks"]');
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS("transform", "matrix(1.1, 0, 0, 1.1, 0, 0)");
});
