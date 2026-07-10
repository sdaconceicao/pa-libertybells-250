import { expect, test } from "@playwright/test";
import {
	getMapTileState,
	tileDistance,
	waitForMapCenteredOnBell,
	waitForMapTiles,
} from "./helpers/leaflet";

const FIRST_BELL = {
	title: "For the People",
	lat: 39.8416861,
	lng: -77.230595,
};

const SELECT_ZOOM = 14;
const MAX_TILE_DISTANCE = 2;

test("list view loads, selecting a bell shows detail and centers the map", async ({
	page,
}) => {
	await page.goto("/");

	await expect(page.locator(".leaflet-container")).toBeVisible({
		timeout: 15_000,
	});
	await expect(
		page.getByRole("button", { name: new RegExp(FIRST_BELL.title, "i") }),
	).toBeVisible();
	await expect(page.getByRole("region", { name: "Filter bells" })).toBeVisible();

	await waitForMapTiles(page);

	const mapStateBefore = await getMapTileState(page);
	expect(mapStateBefore.zoom).toBeLessThan(SELECT_ZOOM);

	await page
		.getByRole("button", { name: new RegExp(FIRST_BELL.title, "i") })
		.click();

	const popup = page.getByTestId("bell-popup");
	await expect(popup).toBeVisible();
	await expect(
		popup.getByRole("heading", { name: FIRST_BELL.title }),
	).toBeVisible();

	await waitForMapCenteredOnBell(page, FIRST_BELL, {
		zoom: SELECT_ZOOM,
		maxTileDistance: MAX_TILE_DISTANCE,
	});

	const mapStateAfter = await getMapTileState(page);

	expect(mapStateAfter.zoom).toBe(SELECT_ZOOM);
	expect(tileDistance(mapStateAfter, FIRST_BELL)).toBeLessThanOrEqual(
		MAX_TILE_DISTANCE,
	);
});
