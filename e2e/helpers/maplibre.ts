import { expect, type Page } from "@playwright/test";

export type MapTileState = { zoom: number; x: number; y: number };
export type BellCoords = { lat: number; lng: number };

async function getMapPosition(page: Page) {
  return page.locator(".maplibregl-map").evaluate((element) => {
    const [lng, lat] = (element.dataset.mapCenter ?? "").split(",").map(Number);
    return { lat, lng, zoom: Number(element.dataset.mapZoom) };
  });
}

export async function waitForMapTiles(page: Page, timeout = 15_000): Promise<void> {
  await expect(page.locator(".maplibregl-map[data-map-center]")).toBeVisible({ timeout });
}

export async function getMapTileState(page: Page): Promise<MapTileState> {
  const position = await getMapPosition(page);
  return latLngToTile(position.lat, position.lng, Math.round(position.zoom));
}

export async function waitForMapCenteredOnBell(page: Page, bell: BellCoords, options: { zoom: number; maxTileDistance?: number; timeout?: number }): Promise<void> {
  await expect.poll(async () => {
    const position = await getMapPosition(page);
    if (Math.round(position.zoom) !== options.zoom) return false;
    const centerTile = latLngToTile(position.lat, position.lng, options.zoom);
    return tileDistance(centerTile, bell) <= (options.maxTileDistance ?? 2);
  }, { timeout: options.timeout ?? 15_000 }).toBe(true);
}

export function latLngToTile(lat: number, lng: number, zoom: number): MapTileState {
  const scale = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * scale);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale);
  return { zoom, x, y };
}

export function tileDistance(tile: MapTileState, bell: BellCoords): number {
  const bellTile = latLngToTile(bell.lat, bell.lng, tile.zoom);
  return Math.hypot(tile.x - bellTile.x, tile.y - bellTile.y);
}
