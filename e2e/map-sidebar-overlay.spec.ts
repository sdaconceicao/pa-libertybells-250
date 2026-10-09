import { expect, type Page, test } from "@playwright/test";
import { skipLandingOverlay } from "./helpers/landingOverlay";
import { waitForMapCenteredOnBell, waitForMapTiles } from "./helpers/maplibre";

const FIRST_BELL = { lat: 39.8416861, lng: -77.230595 };

async function mapView(page: Page) {
  return page.locator(".maplibregl-map").evaluate((map) => {
    const canvas = map.querySelector("canvas")?.getBoundingClientRect();
    return {
      center: map.dataset.mapCenter,
      zoom: map.dataset.mapZoom,
      canvas: canvas && { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
    };
  });
}

test("opening and closing the sidebar leaves the map view unchanged", async ({ page }) => {
  await skipLandingOverlay(page);
  await page.goto("/");
  await waitForMapTiles(page);
  await page.getByRole("button", { name: /For the People For the People/ }).click();
  await waitForMapCenteredOnBell(page, FIRST_BELL, { zoom: 14 });
  await page.waitForTimeout(300);

  const before = await mapView(page);
  await page.getByRole("button", { name: "Close bells list" }).click();
  await expect(page.getByRole("button", { name: "Open bells list" })).toBeVisible();
  await expect(page.locator(".maplibregl-popup-content")).toBeVisible();
  await page.waitForTimeout(350);
  expect(await mapView(page)).toEqual(before);

  await page.getByRole("button", { name: "Open bells list" }).click();
  await expect(page.getByRole("button", { name: "Close bells list" })).toBeVisible();
  await expect(page.locator(".maplibregl-popup-content")).toBeHidden();
  await page.waitForTimeout(350);
  expect(await mapView(page)).toEqual(before);
});

test("sidebar overlays the map without changing its initial view", async ({ page }) => {
  await skipLandingOverlay(page);
  await page.goto("/");
  await waitForMapTiles(page);
  await page.waitForTimeout(300);

  const before = await mapView(page);
  await page.getByRole("button", { name: "Close bells list" }).click();
  await expect(page.getByRole("button", { name: "Open bells list" })).toBeVisible();
  await page.waitForTimeout(350);
  expect(await mapView(page)).toEqual(before);

  await page.getByRole("button", { name: "Open bells list" }).click();
  await expect(page.getByRole("button", { name: "Close bells list" })).toBeVisible();
  await page.waitForTimeout(350);
  expect(await mapView(page)).toEqual(before);
});
