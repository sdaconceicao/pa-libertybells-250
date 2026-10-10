import { expect, test } from "@playwright/test";
import { skipLandingOverlay } from "./helpers/landingOverlay";
import { waitForMapTiles } from "./helpers/maplibre";

test("zooming out stops at the Pennsylvania view", async ({ page }) => {
	await skipLandingOverlay(page);
	await page.goto("/");
	await waitForMapTiles(page);

	const map = page.locator(".maplibregl-map");
	const zoomIn = page.getByRole("button", { name: "Zoom in" });
	const zoomOut = page.getByRole("button", { name: "Zoom out" });
	await expect.poll(async () => Number(await map.getAttribute("data-map-min-zoom"))).toBeGreaterThan(5);
	await expect.poll(async () => {
		const zoom = Number(await map.getAttribute("data-map-zoom"));
		const minZoom = Number(await map.getAttribute("data-map-min-zoom"));
		return Math.abs(zoom - minZoom);
	}).toBeLessThan(0.01);
	await expect(zoomOut).toBeDisabled();

	await zoomIn.evaluate((button: HTMLButtonElement) => button.click());
	await expect(zoomOut).toBeEnabled();

	for (let click = 0; click < 10 && (await zoomOut.isEnabled()); click++) {
		await zoomOut.evaluate((button: HTMLButtonElement) => button.click());
		await page.waitForTimeout(400);
	}
	await expect(zoomOut).toBeDisabled();

	const zoom = Number(await map.getAttribute("data-map-zoom"));
	const minZoom = Number(await map.getAttribute("data-map-min-zoom"));
	expect(zoom).toBeCloseTo(minZoom, 2);

	await map.hover({ position: { x: 400, y: 300 } });
	await page.mouse.wheel(0, 2000);
	await page.waitForTimeout(600);
	expect(Number(await map.getAttribute("data-map-zoom"))).toBeCloseTo(minZoom, 2);
});
