import { expect, test } from "@playwright/test";
import {
	getMapTileState,
	latLngToTile,
	tileDistance,
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

	await page.waitForFunction(
		() =>
			document.querySelectorAll("img.leaflet-tile-loaded, img.leaflet-tile")
				.length > 0,
		undefined,
		{ timeout: 15_000 },
	);

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

	const expectedBellTile = latLngToTile(
		FIRST_BELL.lat,
		FIRST_BELL.lng,
		SELECT_ZOOM,
	);

	await page.waitForFunction(
		({ bellTile, targetZoom, maxTileDistance }) => {
			const tiles = [
				...document.querySelectorAll<HTMLImageElement>(
					"img.leaflet-tile-loaded, img.leaflet-tile",
				),
			];
			if (tiles.length === 0) {
				return false;
			}

			const viewportCenter = {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
			};

			let closestTile: HTMLImageElement | null = null;
			let closestDistance = Number.POSITIVE_INFINITY;

			for (const tile of tiles) {
				const rect = tile.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;
				const distance = Math.hypot(
					centerX - viewportCenter.x,
					centerY - viewportCenter.y,
				);

				if (distance < closestDistance) {
					closestDistance = distance;
					closestTile = tile;
				}
			}

			const match = closestTile?.src.match(/\/(\d+)\/(\d+)\/(\d+)\.png/);
			if (!match) {
				return false;
			}

			const zoom = Number(match[1]);
			if (zoom !== targetZoom) {
				return false;
			}

			const tileDistanceToBell = Math.hypot(
				Number(match[2]) - bellTile.x,
				Number(match[3]) - bellTile.y,
			);

			return tileDistanceToBell <= maxTileDistance;
		},
		{
			bellTile: expectedBellTile,
			targetZoom: SELECT_ZOOM,
			maxTileDistance: MAX_TILE_DISTANCE,
		},
		{ timeout: 15_000 },
	);

	const mapStateAfter = await getMapTileState(page);

	expect(mapStateAfter.zoom).toBe(SELECT_ZOOM);
	expect(tileDistance(mapStateAfter, FIRST_BELL)).toBeLessThanOrEqual(
		MAX_TILE_DISTANCE,
	);
});
