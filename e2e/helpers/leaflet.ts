import { expect, type Page } from "@playwright/test";

export type MapTileState = {
	zoom: number;
	x: number;
	y: number;
};

export type BellCoords = {
	lat: number;
	lng: number;
};

function getViewportCenterTileState(): MapTileState | null {
	const tiles = [
		...document.querySelectorAll<HTMLImageElement>(
			"img.leaflet-tile-loaded, img.leaflet-tile",
		),
	];
	if (tiles.length === 0) {
		return null;
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
		return null;
	}

	return {
		zoom: Number(match[1]),
		x: Number(match[2]),
		y: Number(match[3]),
	};
}

export async function waitForMapTiles(
	page: Page,
	timeout = 15_000,
): Promise<void> {
	await page.waitForFunction(
		() =>
			document.querySelectorAll("img.leaflet-tile-loaded, img.leaflet-tile")
				.length > 0,
		undefined,
		{ timeout },
	);
}

export async function getMapTileState(page: Page): Promise<MapTileState> {
	const state = await page.evaluate(getViewportCenterTileState);
	if (!state) {
		throw new Error("No map tiles found");
	}

	return state;
}

export async function waitForMapCenteredOnBell(
	page: Page,
	bell: BellCoords,
	options: {
		zoom: number;
		maxTileDistance?: number;
		timeout?: number;
	},
): Promise<void> {
	const maxTileDistance = options.maxTileDistance ?? 2;
	const timeout = options.timeout ?? 15_000;
	const expectedTile = latLngToTile(bell.lat, bell.lng, options.zoom);

	await expect
		.poll(
			async () => {
				try {
					const state = await getMapTileState(page);
					if (state.zoom !== options.zoom) {
						return null;
					}

					const distance = Math.hypot(
						state.x - expectedTile.x,
						state.y - expectedTile.y,
					);

					return distance <= maxTileDistance ? state : null;
				} catch {
					return null;
				}
			},
			{ timeout },
		)
		.not.toBeNull();
}

export function latLngToTile(
	lat: number,
	lng: number,
	zoom: number,
): MapTileState {
	const scale = 2 ** zoom;
	const x = Math.floor(((lng + 180) / 360) * scale);
	const latRad = (lat * Math.PI) / 180;
	const y = Math.floor(
		((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
			scale,
	);

	return { zoom, x, y };
}

export function tileDistance(
	tile: MapTileState,
	bell: BellCoords,
): number {
	const bellTile = latLngToTile(bell.lat, bell.lng, tile.zoom);
	return Math.hypot(tile.x - bellTile.x, tile.y - bellTile.y);
}
