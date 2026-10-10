import type { Map as MapInstance } from "maplibre-gl";
import type { Bell } from "../../../../lib/bells/types";
import {
	PA_MAP_EAST,
	PA_MAP_NORTH,
	PA_MAP_SOUTH,
	PA_MAP_WEST,
} from "../../../../lib/bells/paMapBounds";
import {
	getMapCenterOffset,
	getMapViewportPadding,
	type MapViewportPadding,
} from "./mapViewportPadding";

const DEFAULT_CENTER: [number, number] = [-77.79, 40.87];
export const PA_ZOOM_BOUNDS: [[number, number], [number, number]] = [
	[PA_MAP_WEST, PA_MAP_SOUTH],
	[PA_MAP_EAST, PA_MAP_NORTH],
];

export function viewportPadding(isMobile: boolean): MapViewportPadding {
	const rootFontSize =
		Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
		16;
	return getMapViewportPadding({ isMobile, rootFontSize });
}

export function setPennsylvaniaZoomLimit(map: MapInstance, isMobile: boolean) {
	const camera = map.cameraForBounds(PA_ZOOM_BOUNDS, {
		padding: viewportPadding(isMobile),
	});
	if (camera) {
		map.setMinZoom(camera.zoom);
		map.getContainer().dataset.mapMinZoom = `${map.getMinZoom()}`;
	}
}

export function fitPennsylvania(map: MapInstance, isMobile: boolean) {
	map.fitBounds(PA_ZOOM_BOUNDS, {
		padding: viewportPadding(isMobile),
		duration: 0,
	});
}

export function fitBells(
	map: MapInstance,
	bells: Bell[],
	padding: MapViewportPadding,
) {
	map.resize();
	if (bells.length < 2) {
		const center: [number, number] =
			bells.length === 1 ? [bells[0].lng, bells[0].lat] : DEFAULT_CENTER;
		map.easeTo({
			center,
			zoom: bells.length === 1 ? 12 : 7,
			offset: getMapCenterOffset(padding),
			duration: 0,
		});
		return;
	}
	map.fitBounds(
		[
			[
				Math.min(...bells.map((bell) => bell.lng)),
				Math.min(...bells.map((bell) => bell.lat)),
			],
			[
				Math.max(...bells.map((bell) => bell.lng)),
				Math.max(...bells.map((bell) => bell.lat)),
			],
		],
		{ padding, maxZoom: 13, duration: 0 },
	);
}
