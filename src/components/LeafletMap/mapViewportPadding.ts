export type MapViewportPadding = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export const SIDEBAR_WIDTH_REM = 22;
export const HEADER_TOP_REM = 1;
export const HEADER_HEIGHT_REM = 3.5;
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
	const top = (HEADER_TOP_REM + HEADER_HEIGHT_REM) * rootFontSize + edge;

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
