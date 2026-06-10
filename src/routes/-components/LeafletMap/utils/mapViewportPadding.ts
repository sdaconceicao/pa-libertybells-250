export type MapViewportPadding = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export const SIDEBAR_WIDTH_REM = 22;
export const EDGE_GAP_REM = 1;
export const SIDEBAR_HANDLE_WIDTH_PX = 20;
export const MOBILE_TOGGLE_BOTTOM_PX = 72;

export function getSidebarWidthPx(
	viewportWidth: number,
	rootFontSize = 16,
): number {
	const maxSidebarWidth = SIDEBAR_WIDTH_REM * rootFontSize;
	return Math.min(maxSidebarWidth, viewportWidth - 2 * rootFontSize);
}

export function getMapViewportPadding(options: {
	sidebarOpen: boolean;
	isMobile: boolean;
	viewportWidth: number;
	rootFontSize?: number;
}): MapViewportPadding {
	const rootFontSize = options.rootFontSize ?? 16;
	const edge = EDGE_GAP_REM * rootFontSize;
	const top = edge;

	if (options.isMobile) {
		return {
			top,
			right: edge,
			bottom: MOBILE_TOGGLE_BOTTOM_PX,
			left: edge,
		};
	}

	const left = options.sidebarOpen
		? getSidebarWidthPx(options.viewportWidth, rootFontSize) + edge
		: SIDEBAR_HANDLE_WIDTH_PX;

	return {
		top,
		right: edge,
		bottom: edge,
		left,
	};
}

export function getMapCenterOffset(
	padding: MapViewportPadding,
): [number, number] {
	return [
		(padding.left - padding.right) / 2,
		(padding.top - padding.bottom) / 2,
	];
}

/** Leaflet fitBounds padding points are [x, y] (left/top insets). */
export function getFitBoundsPadding(padding: MapViewportPadding): {
	paddingTopLeft: [number, number];
	paddingBottomRight: [number, number];
} {
	return {
		paddingTopLeft: [padding.left, padding.top],
		paddingBottomRight: [padding.right, padding.bottom],
	};
}

export function getVisibleCenterContainerPoint(
	padding: MapViewportPadding,
	mapSize: { x: number; y: number },
): [number, number] {
	const [offsetX, offsetY] = getMapCenterOffset(padding);
	return [mapSize.x / 2 + offsetX, mapSize.y / 2 + offsetY];
}

type MapProjection = {
	project: (latlng: [number, number], zoom: number) => { x: number; y: number };
	unproject: (
		point: { x: number; y: number },
		zoom: number,
	) => { lat: number; lng: number };
	getSize: () => { x: number; y: number };
};

/** Map center that places `latLng` at the padded visible center at `zoom`. */
export function getMapCenterForVisibleLatLng(
	map: MapProjection,
	latLng: [number, number],
	zoom: number,
	padding: MapViewportPadding,
): [number, number] {
	const [offsetX, offsetY] = getMapCenterOffset(padding);
	if (offsetX === 0 && offsetY === 0) {
		return latLng;
	}

	const targetPoint = map.project(latLng, zoom);
	const centerPoint = {
		x: targetPoint.x - offsetX,
		y: targetPoint.y - offsetY,
	};
	const centerLatLng = map.unproject(centerPoint, zoom);
	return [centerLatLng.lat, centerLatLng.lng];
}

export function applyMapViewportPaddingOffset(
	map: {
		panBy: (offset: [number, number], options?: { animate?: boolean }) => void;
	},
	padding: MapViewportPadding,
) {
	const [offsetX, offsetY] = getMapCenterOffset(padding);
	if (offsetX === 0 && offsetY === 0) {
		return;
	}

	map.panBy([-offsetX + 0, -offsetY + 0], { animate: false });
}
