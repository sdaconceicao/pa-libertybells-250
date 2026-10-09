export type MapViewportPadding = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export const EDGE_GAP_REM = 1;
export const MOBILE_TOGGLE_BOTTOM_PX = 48;

export function getMapViewportPadding(options: {
	isMobile: boolean;
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

	return {
		top,
		right: edge,
		bottom: edge,
		left: edge,
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
