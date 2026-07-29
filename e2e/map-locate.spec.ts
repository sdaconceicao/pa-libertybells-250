import { expect, type Page, test } from "@playwright/test";
import { waitForMapCenteredOnBell, waitForMapTiles } from "./helpers/leaflet";

// A location comfortably inside Pennsylvania so the recenter is unambiguous.
const MY_LOCATION = {
	lat: 40.4406,
	lng: -79.9959, // Pittsburgh
};

const LOCATE_ZOOM = 14;

const locateButton = (page: Page) =>
	page.getByRole("button", { name: "Center on my location" });

/**
 * Dispatch the click directly to the button. During `vite dev` the TanStack
 * Devtools trigger overlaps this bottom-right corner and intercepts positional
 * clicks (it isn't present in production builds); dispatching the event
 * exercises the same handler wiring without coordinate hit-testing.
 */
async function clickLocate(page: Page) {
	await locateButton(page).dispatchEvent("click");
}

test("locate button centers the map on the visitor's granted location", async ({
	page,
	context,
}) => {
	await context.grantPermissions(["geolocation"]);
	await context.setGeolocation({
		latitude: MY_LOCATION.lat,
		longitude: MY_LOCATION.lng,
	});

	await page.goto("/");
	await expect(page.locator(".leaflet-container")).toBeVisible({
		timeout: 15_000,
	});
	await waitForMapTiles(page);

	await clickLocate(page);

	await waitForMapCenteredOnBell(page, MY_LOCATION, {
		zoom: LOCATE_ZOOM,
		// Centering offsets the point to the padded visible area (clear of the
		// sidebar), so it lands further from the raw window center than a plain
		// setView would — allow a wider tile radius than the bell-selection test.
		maxTileDistance: 4,
	});

	// A "you are here" marker (light-blue dot + pulsing ring) is dropped at the
	// located point.
	await expect(page.locator("[data-location-marker]")).toBeVisible();
});

test("locate button warns when location access is denied", async ({
	page,
	context,
}) => {
	// No geolocation permission granted → the browser reports PERMISSION_DENIED.
	await context.clearPermissions();

	await page.goto("/");
	await expect(page.locator(".leaflet-container")).toBeVisible({
		timeout: 15_000,
	});
	await waitForMapTiles(page);

	await clickLocate(page);

	const warning = page.getByRole("alert");
	await expect(warning).toBeVisible();
	await expect(warning).toContainText(/location access is blocked/i);

	await warning
		.getByRole("button", { name: "Dismiss location warning" })
		.click();
	await expect(warning).toBeHidden();
});
